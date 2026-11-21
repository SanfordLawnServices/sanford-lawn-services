// Sanford SmartQuote backend scaffold — Cloudflare Worker.
// NOT deployed. Requires D1, R2, Turnstile, secrets and production security review.
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff",...headers}});
const MAX_FILES=10,MAX_FILE_BYTES=8*1024*1024,MAX_TOTAL_BYTES=25*1024*1024;
const services=new Set(["mowing","leaves","beds","washing","other"]);
const frequencies=new Set(["One-time","Weekly","Biweekly","Monthly","Not sure"]);
const allowedTypes=new Set(["image/jpeg","image/png","image/webp"]);
function cors(origin,env){return origin===env.ALLOWED_ORIGIN?{"access-control-allow-origin":origin,"vary":"Origin","access-control-allow-headers":"authorization, content-type","access-control-allow-methods":"GET,POST,OPTIONS"}:{}}
async function authorized(req,env){
 const h=req.headers.get("authorization")||"";if(!h.startsWith("Bearer ")||!env.OWNER_TOKEN)return false;
 const a=new TextEncoder().encode(h.slice(7)),b=new TextEncoder().encode(env.OWNER_TOKEN);
 if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;
}
async function verifyTurnstile(token,ip,env){
 if(!env.TURNSTILE_SECRET||!token)return false;
 const body=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token,remoteip:ip||""});
 const response=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body});
 if(!response.ok)return false;const result=await response.json();return result.success===true;
}
function safeString(value,max){return typeof value==="string"?value.trim().slice(0,max):""}
function fileSignatureValid(bytes,type){
 if(type==="image/jpeg")return bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;
 if(type==="image/png")return bytes.slice(0,8).every((v,i)=>v===[137,80,78,71,13,10,26,10][i]);
 if(type==="image/webp")return String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP";
 return false;
}
export default {async fetch(req,env){
 const url=new URL(req.url),origin=req.headers.get("origin")||"",headers=cors(origin,env);
 if(req.method==="OPTIONS")return new Response(null,{status:origin===env.ALLOWED_ORIGIN?204:403,headers});
 if(!env.DB||!env.PHOTOS)return json({error:"Backend storage is not configured"},503,headers);
 if(url.pathname==="/api/health"&&req.method==="GET")return json({status:"configured",mode:"draft-only"},200,headers);
 if(url.pathname.startsWith("/api/")&&origin&&origin!==env.ALLOWED_ORIGIN)return json({error:"Origin not allowed"},403,headers);
 try{
 if(url.pathname==="/api/intake"&&req.method==="POST"){
  const length=Number(req.headers.get("content-length")||0);
  if(length>MAX_TOTAL_BYTES)return json({error:"Upload too large"},413,headers);
  const form=await req.formData();
  if(!await verifyTurnstile(safeString(form.get("turnstileToken"),4096),req.headers.get("cf-connecting-ip"),env))return json({error:"Verification required"},403,headers);
  const name=safeString(form.get("name"),100),address=safeString(form.get("address"),200),email=safeString(form.get("email"),200);
  const service=safeString(form.get("service"),30),frequency=safeString(form.get("frequency"),30),notes=safeString(form.get("details"),2500);
  const consent=form.get("consent")==="yes";
  if(!name||!address||!email.includes("@")||!services.has(service)||!frequencies.has(frequency)||!consent)return json({error:"Missing or invalid required fields"},400,headers);
  const files=form.getAll("photos").filter(v=>v instanceof File);
  if(files.length>MAX_FILES)return json({error:"Maximum 10 photos"},400,headers);
  let total=0;const validated=[];
  for(const file of files){
   if(!allowedTypes.has(file.type)||file.size>MAX_FILE_BYTES||file.size===0)return json({error:"Invalid photo type or size"},400,headers);
   total+=file.size;if(total>MAX_TOTAL_BYTES)return json({error:"Combined photos exceed 25 MB"},413,headers);
   const bytes=new Uint8Array(await file.arrayBuffer());
   if(!fileSignatureValid(bytes,file.type))return json({error:"Photo content does not match file type"},400,headers);
   validated.push({bytes,type:file.type});
  }
  const id=crypto.randomUUID(),created=new Date().toISOString(),uploaded=[];
  try{
   for(let i=0;i<validated.length;i++){const p=validated[i],key="intake/"+id+"/"+i;await env.PHOTOS.put(key,p.bytes,{httpMetadata:{contentType:p.type}});uploaded.push(key)}
   await env.DB.prepare("INSERT INTO inquiries (id,created_at,name,address,email,service,frequency,notes,status) VALUES (?,?,?,?,?,?,?,?,?)").bind(id,created,name,address,email,service,frequency,notes,"pending").run();
   for(const key of uploaded)await env.DB.prepare("INSERT INTO inquiry_photos (inquiry_id,object_key) VALUES (?,?)").bind(id,key).run();
  }catch(err){for(const key of uploaded)await env.PHOTOS.delete(key).catch(()=>{});await env.DB.prepare("DELETE FROM inquiries WHERE id=?").bind(id).run().catch(()=>{});throw err}
  return json({reference:id,status:"received",message:"Request received for owner review. No quote has been issued."},201,headers);
 }
 if(url.pathname==="/api/owner/inquiries"&&req.method==="GET"){
  if(!await authorized(req,env))return json({error:"Unauthorized"},401,headers);
  const rows=await env.DB.prepare("SELECT id,created_at,name,address,email,service,frequency,notes,status FROM inquiries ORDER BY created_at DESC LIMIT 100").all();
  return json({inquiries:rows.results},200,headers);
 }
 const match=url.pathname.match(/^\/api\/owner\/inquiries\/([a-f0-9-]{36})\/status$/);
 if(match&&req.method==="POST"){
  if(!await authorized(req,env))return json({error:"Unauthorized"},401,headers);
  const body=await req.json(),status=body.status;
  if(!["pending","needs-info","approved-internal","declined"].includes(status))return json({error:"Invalid status"},400,headers);
  const row=await env.DB.prepare("SELECT id FROM inquiries WHERE id=?").bind(match[1]).first();
  if(!row)return json({error:"Not found"},404,headers);
  await env.DB.prepare("UPDATE inquiries SET status=? WHERE id=?").bind(status,match[1]).run();
  await env.DB.prepare("INSERT INTO audit_events (inquiry_id,action,created_at) VALUES (?,?,?)").bind(match[1],"status:"+status,new Date().toISOString()).run();
  return json({id:match[1],status,customer_notified:false},200,headers);
 }
 return json({error:"Not found"},404,headers);
 }catch(err){console.error("SmartQuote request failed",err?.name||"error");return json({error:"Unable to process request"},500,headers)}
}};
