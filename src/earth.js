'use strict';
function earthLand(lon,lat,polygons){
 return polygons.some(([west,east,south,north,ring])=>{
  if(lon<west||lon>east||lat<south||lat>north)return false;
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
   const [ax,ay]=ring[i],[bx,by]=ring[j];
   if((ay>lat)!==(by>lat)&&lon<(bx-ax)*(lat-ay)/(by-ay)+ax)inside=!inside;
  }
  return inside;
 });
}
function earthRows(grid){
 return grid.map(row=>{
  let result='',kind=null,run='';
  const flush=()=>{if(run)result+=kind?`<span class="${kind}">${run}</span>`:run};
  row.forEach(cell=>{if(cell.kind!==kind){flush();run='';kind=cell.kind}run+=cell.glyph});flush();return result;
 }).join('\n');
}
function renderEarthHTML(rotation,data){
 const w=84,h=43,radius=40.5,tilt=-.19,grid=Array.from({length:h},()=>Array.from({length:w},()=>({glyph:' ',kind:null})));
 for(let row=0;row<h;row++)for(let col=0;col<w;col++){
  const x=(col-41.5)/radius,y=(21-row)*2/radius,rr=x*x+y*y;if(rr>1)continue;
  const z=Math.sqrt(1-rr),yy=y*Math.cos(tilt)-z*Math.sin(tilt),zz=y*Math.sin(tilt)+z*Math.cos(tilt);
  const lat=Math.asin(yy)*180/Math.PI,lon=((Math.atan2(x,zz)*180/Math.PI+rotation+540)%360)-180;
  const ix=Math.min(179,Math.floor((lon+180)/2)),iy=Math.max(0,Math.min(89,Math.floor((90-lat)/2)));
  const indonesia=earthLand(lon,lat,data.indonesia),land=indonesia||data.mask[iy].some(([start,end])=>ix>=start&&ix<=end);
  grid[row][col]={glyph:land?'+':'·',kind:indonesia?'earth-indonesia':land?'earth-land':'earth-ocean'};
 }
 return earthRows(grid);
}


(async()=>{
 const surface=document.querySelector('.earth-surface');if(!surface)return;const stage=surface.querySelector('.earth-stage'),pre=surface.querySelector('.ascii-art'),pause=surface.querySelector('[data-earth-control]');
 let data;try{const response=await fetch('/media/earth.json');if(!response.ok)return;data=await response.json()}catch{return}if(pause)pause.disabled=false;const reduced=(window.__speReducedMotion??=matchMedia('(prefers-reduced-motion: reduce)'));
 let id=0,last=0,rotation=115,visible=true,paused=false,frames=0;
 function draw(){pre.innerHTML=renderEarthHTML(rotation,data);surface.dataset.frames=++frames}
 function measure(){
  const sample=document.createElement('span'),font=getComputedStyle(pre);sample.style.cssText='position:absolute;white-space:pre;letter-spacing:0;pointer-events:none';sample.style.fontFamily=font.fontFamily;sample.style.fontSize=font.fontSize;sample.style.fontWeight=font.fontWeight;sample.textContent='M'.repeat(100);stage.append(sample);
  const range=document.createRange();range.selectNodeContents(sample);const width=range.getBoundingClientRect().width/100;sample.remove();
  if(width){stage.style.setProperty('--earth-cell',width+'px');pre.style.lineHeight=2*width+'px';stage.dataset.cellWidth=width}
 }
 function controls(){surface.dataset.state=id?'running':'paused';if(pause){pause.disabled=reduced.matches;const label=reduced.matches?'Earth with Indonesia highlighted in blue':paused?'Resume globe motion':'Pause globe motion';pause.setAttribute('aria-label',label);pause.title=label;pause.setAttribute('aria-pressed',String(paused))}}
 function frame(now){
  id=0;if(document.hidden||!visible||paused||reduced.matches){controls();return}
  if(!last)last=now;
  if(now-last>=1000/12){const steps=Math.floor((now-last)/(1000/12));rotation=(rotation+steps*.5)%360;last+=steps*(1000/12);draw()}
  id=requestAnimationFrame(frame);controls();
 }
 function sync(){cancelAnimationFrame(id);id=0;last=0;if(!reduced.matches&&!document.hidden&&visible&&!paused)id=requestAnimationFrame(frame);controls()}
 pause?.addEventListener('click',()=>{paused=!paused;sync()});document.addEventListener('visibilitychange',sync);window.addEventListener('resize',measure);
 reduced.addEventListener('change',()=>{if(reduced.matches){rotation=115;draw()}sync()});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:0}).observe(surface);
 measure();draw();sync();document.fonts.ready.then(measure);
})();
