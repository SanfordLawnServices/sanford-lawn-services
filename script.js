const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });
}

// SmartQuote: associate separately texted/emailed property photos with the form lead.
// This script intentionally never generates, displays or sends a customer price.
(() => {
  const form=document.getElementById('smartquote-form');
  if(!form) return;
  const date=new Date().toISOString().slice(0,10).replace(/-/g,'');
  const bytes=new Uint8Array(4);
  if(window.crypto && window.crypto.getRandomValues)window.crypto.getRandomValues(bytes);
  else for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*256);
  const code=Array.from(bytes).map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();
  const reference='SL-'+date+'-'+code;
  const hidden=document.getElementById('sq-lead-id');
  const shown=document.getElementById('sq-lead-display');
  if(hidden)hidden.value=reference;
  if(shown)shown.textContent=reference;
  const service=form.querySelector('select[name="Service"]');
  if(service)service.addEventListener('change',()=>{
    const value=service.value.toLowerCase();
    const lawn=document.getElementById('sq-lawn');
    const cleanup=document.getElementById('sq-cleanup');
    const wash=document.getElementById('sq-washing');
    if(lawn&&(value.includes('lawn')||value.includes('mowing')||value.includes('multiple')))lawn.open=true;
    if(cleanup&&(/leaf|pinecone|shrub|mulch|debris|multiple/.test(value)))cleanup.open=true;
    if(wash&&(/wash|driveway|patio|sidewalk|multiple/.test(value)))wash.open=true;
  });
})();
