(()=>{
 const root=document.documentElement,preference=(window.__speReducedMotion??=matchMedia('(prefers-reduced-motion: reduce)'));
 let observer;const targets=[...document.querySelectorAll('main>.section,main>.timeline-row,main>.membership-band,main>.trust')];
 function release(){observer?.disconnect();targets.forEach(e=>e.classList.remove('reveal-pending'));document.querySelectorAll('.hero-enter,.stamp-enter').forEach(e=>e.classList.remove('hero-enter','stamp-enter'));root.classList.remove('motion-ready')}
 function start(){
  release();if(preference.matches)return;root.classList.add('motion-ready');
  const hero=document.querySelector('.home-hero,.page-head,.exploration-hero');
  const parts=hero?[...hero.querySelectorAll('h1,.lead,.actions,.surface,.ascii-panel')].filter((e,i,a)=>!a.some(p=>p!==e&&p.contains(e))).slice(0,4):[];
  parts.forEach((e,i)=>{e.style.setProperty('--enter-delay',`${i*40}ms`);e.classList.add('hero-enter');e.addEventListener('animationend',()=>e.classList.remove('hero-enter'),{once:true})});
  const stamp=e=>e.querySelectorAll('.stamp').forEach(s=>{s.classList.add('stamp-enter');s.addEventListener('animationend',()=>s.classList.remove('stamp-enter'),{once:true})});
  if(hero)stamp(hero);
  if(!('IntersectionObserver'in window))return;
  try{observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){target.classList.remove('reveal-pending');stamp(target);observer.unobserve(target)}}),{threshold:0,rootMargin:'0px 0px -24px 0px'});
   targets.forEach(e=>{e.classList.add('reveal-target');if(e.getBoundingClientRect().top>innerHeight+12){e.classList.add('reveal-pending');observer.observe(e)}})
  }catch{release()}
 }
 preference.addEventListener('change',start);start();
 document.addEventListener('focusin',e=>e.target.closest('.reveal-pending')?.classList.remove('reveal-pending'));
 window.addEventListener('beforeprint',release);window.addEventListener('hashchange',()=>targets.forEach(e=>e.classList.remove('reveal-pending')));
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f')release()});
 document.querySelectorAll('.toolbar').forEach(toolbar=>{
  const marker=document.createElement('span');marker.className='chip-indicator';marker.setAttribute('aria-hidden','true');toolbar.append(marker);
  const locate=()=>{const active=toolbar.querySelector('[aria-pressed=true]');if(!active||preference.matches){marker.style.opacity='0';return}const r=active.getBoundingClientRect(),parent=toolbar.getBoundingClientRect();marker.style.transform=`translate(${r.left-parent.left}px,${r.bottom-parent.top+4}px) scaleX(${r.width})`;marker.style.opacity='1'};
  toolbar.addEventListener('click',locate);preference.addEventListener('change',locate);if('ResizeObserver'in window)new ResizeObserver(locate).observe(toolbar);locate();
 });
})();

(()=>{
 const preference=(window.__speReducedMotion??=matchMedia('(prefers-reduced-motion: reduce)'));
 const glyphs='.:+x#%',running=new Map(),seen=new WeakSet();
 const stats=window.__speMotion={text:[],images:[],activeImages:0};
 let frame=0,observer;
 const random=()=>glyphs[Math.floor(Math.random()*glyphs.length)];
 function settle(element){
  const item=running.get(element);if(!item)return;
  clearTimeout(item.safety);item.words.forEach(word=>{word.node.classList.remove('is-scrambling');word.layer.dataset.glyphs=''});
  element.dataset.asciiState='final';running.delete(element);
 }
 function tick(now){
  frame=0;
  running.forEach((item,element)=>{
   const elapsed=now-item.start,resolved=Math.floor(elapsed/item.duration*item.length);
   if(elapsed>=item.duration){settle(element);return}
   if(now-item.last<30)return;item.last=now;
   let offset=0;
   item.words.forEach(word=>{word.layer.dataset.glyphs=[...word.text].map(character=>offset++<resolved?character:random()).join('')});
  });
  if(running.size)frame=requestAnimationFrame(tick);
 }
 function stream(element){
  if(preference.matches||seen.has(element))return;
  seen.add(element);
  const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.textContent.trim()&&!node.parentElement.closest('svg,[aria-hidden="true"],.ascii-word')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  const words=[];
  nodes.forEach(node=>{
   const fragment=document.createDocumentFragment();
   node.textContent.split(/(\s+)/).forEach(text=>{
    if(!text.trim()){fragment.append(document.createTextNode(text));return}
    const word=document.createElement('span'),final=document.createElement('span'),layer=document.createElement('span');
    word.className='ascii-word';final.className='ascii-final';final.textContent=text;
    layer.className='ascii-stream';layer.setAttribute('aria-hidden','true');layer.dataset.glyphs=text;
    word.append(final,layer);fragment.append(word);words.push({node:word,layer,text});
   });
   node.replaceWith(fragment);
  });
  if(!words.length)return;
  element.setAttribute('aria-label',words.map(word=>word.text).join(' '));
  const length=words.reduce((sum,word)=>sum+[...word.text].length,0),duration=Math.min(680,Math.max(160,length*32));
  words.forEach(word=>word.node.classList.add('is-scrambling'));
  const item={words,length,duration,start:performance.now(),last:0,safety:setTimeout(()=>settle(element),700)};
  running.set(element,item);element.dataset.asciiState='streaming';stats.text.push({text:element.getAttribute('aria-label'),duration});
  if(!frame)frame=requestAnimationFrame(tick);
 }
 const candidates=[...new Set([...document.querySelectorAll('h1,h2,h3,.stamp,.hero-origin,.exploration-intro>.meta,.origin,.meta>span,.section-title>.meta,.newsletter-copy>.mono')].map(element=>element.matches('h1,h2,h3')?(element.querySelector('a')||element):element))].filter(element=>!element.closest('.ascii-panel')&&!element.querySelector('.stamp')&&!element.closest('[aria-live]'));
 function stop(){running.forEach((_,element)=>settle(element));cancelAnimationFrame(frame);frame=0}
 function observe(){
  observer?.disconnect();stop();
  if(preference.matches||automated()||!('IntersectionObserver'in window))return;
  observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(!isIntersecting)return;if(target.matches('.section-title')){target.classList.add('ascii-divider-enter');setTimeout(()=>target.classList.remove('ascii-divider-enter'),240)}else stream(target);observer.unobserve(target)}),{threshold:.12});
  [...candidates,...document.querySelectorAll('.section-title')].forEach(element=>observer.observe(element));
 }
 preference.addEventListener('change',observe);window.addEventListener('beforeprint',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});observe();
 document.querySelectorAll('.button,.inline-link,.rule-link').forEach(button=>{
  const svg=button.querySelector('svg');if(!svg)return;
  const arrow=document.createElement('span'),layer=document.createElement('span');arrow.className='ascii-arrow';arrow.setAttribute('aria-hidden','true');layer.className='ascii-arrow-glyph';layer.textContent='→';svg.before(arrow);arrow.append(svg,layer);
  let timer=0,end=0;
  const reset=()=>{clearInterval(timer);clearTimeout(end);layer.textContent='→'};
  const play=()=>{reset();if(preference.matches)return;timer=setInterval(()=>layer.textContent=random(),30);end=setTimeout(reset,180)};
  button.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'&&matchMedia('(hover: hover) and (pointer: fine)').matches)play()});button.addEventListener('pointerleave',reset);button.addEventListener('blur',reset);preference.addEventListener('change',reset);
 });
 document.addEventListener('spe:loading',event=>{
  const button=event.target,layer=button.querySelector('.ascii-arrow-glyph');if(!layer||preference.matches)return;
  let index=0;const timer=setInterval(()=>layer.textContent=['|','/','−','\\'][index++%4],35);setTimeout(()=>{clearInterval(timer);layer.textContent='→'},160);
 });

 const images=[...document.querySelectorAll('main img')].filter(img=>!img.closest('.chapter,.chapter-emblem,.org-chart'));
 const jobs=new Map(),visited=new WeakSet(),inView=new Set();let imageObserver,modules,capable;
 function automated(){return navigator.webdriver===true||/HeadlessChrome/i.test(navigator.userAgent)}
 function allowed(){return !preference.matches&&!automated()&&'IntersectionObserver'in window&&'ResizeObserver'in window}
 function webgl(){
  if(capable!==undefined)return capable;
  try{const canvas=document.createElement('canvas'),context=canvas.getContext('webgl2');capable=!!context;context?.getExtension('WEBGL_lose_context')?.loseContext()}catch{capable=false}
  return capable;
 }
 function load(){
  return modules??=Promise.all([
   import(/* @vite-ignore */ 'https://esm.sh/react@18.3.1'),
   import(/* @vite-ignore */ 'https://esm.sh/react-dom@18.3.1/client?deps=react@18.3.1'),
   import(/* @vite-ignore */ 'https://esm.sh/img-fx@0.5.1?deps=react@18.3.1,react-dom@18.3.1,three@0.170.0')
  ]);
 }
 function finish(job,state){
  if(job.done)return;job.done=true;clearTimeout(job.timeout);job.watch?.disconnect();job.pause?.();
  if(job.host)job.host.hidden=true;
  job.img.dataset.imgfxState=state;stats.activeImages=Math.max(0,stats.activeImages-1);
  stats.images.push({src:job.img.src,state,duration:Math.round(performance.now()-job.start)});
  queueMicrotask(pumpImages);
 }
 function pumpImages(){if(!allowed()||document.hidden||stats.activeImages)return;const next=[...inView].find(img=>!visited.has(img));if(next)reveal(next)}
 async function reveal(img){
  if(!allowed()||visited.has(img))return;
  visited.add(img);
  if(!webgl()){document.documentElement.dataset.imgfxMode='no-webgl';return}
  const job={img,start:performance.now(),done:false};jobs.set(img,job);stats.activeImages++;
  job.timeout=setTimeout(()=>finish(job,'fallback-timeout'),45000);
  try{
   const [react,dom,fx]=await load();await img.decode();await new Promise(resolve=>setTimeout(resolve,750));
   const r=img.getBoundingClientRect();
   if(job.done||!allowed()||document.hidden||r.bottom<=0||r.top>=innerHeight||!img.naturalWidth){finish(job,'offscreen');return}
   const React=react.default,host=document.createElement('div');job.host=host;host.className='ascii-image-effect';host.setAttribute('aria-hidden','true');
   host.style.cssText=`left:${r.left+scrollX}px;top:${r.top+scrollY}px;width:${r.width}px;height:${r.height}px;border-radius:${getComputedStyle(img).borderRadius}`;
   document.body.append(host);img.dataset.imgfxState='revealing';document.documentElement.dataset.imgfxMode='active';
   const width=Math.min(256,r.width),height=width*r.height/r.width;
   function Picture(){
    const ref=React.useRef(null),[paused,pause]=React.useState(false);job.pause=()=>pause(true);
    React.useEffect(()=>{ref.current?.triggerReveal({hold:'manual'});job.triggered=performance.now()},[]);
    return React.createElement(fx.ImageGeneration,{ref,preset:'pixels-mechanic',images:[img.currentSrc||img.src],paused},React.createElement('div',{style:{width,height}}));
   }
   class Boundary extends React.Component{
    constructor(props){super(props);this.state={failed:false}}
    static getDerivedStateFromError(){return{failed:true}}
    componentDidCatch(){queueMicrotask(()=>finish(job,'fallback-error'))}
    render(){return this.state.failed?null:this.props.children}
   }
   const stage=document.createElement('div');stage.className='ascii-image-stage';stage.style.setProperty('--fx-width',r.width+'px');stage.style.setProperty('--fx-height',r.height+'px');host.append(stage);
   job.watch=new MutationObserver(()=>{const shader=stage.querySelector('.image-gen-shader');if(shader?.style.opacity==='0')finish(job,'revealed')});
   job.watch.observe(stage,{subtree:true,attributes:true,attributeFilter:['style']});
   job.root=dom.createRoot(stage);job.root.render(React.createElement(Boundary,null,React.createElement(Picture)));
  }catch{finish(job,'fallback-unavailable');document.documentElement.dataset.imgfxMode='fallback'}
 }
 function watchImages(){
  imageObserver?.disconnect();
  if(!allowed()){document.documentElement.dataset.imgfxMode=preference.matches?'reduced-motion':'automation';jobs.forEach(job=>finish(job,'static'));return}
  document.documentElement.dataset.imgfxMode='ready';
  imageObserver=new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>{if(isIntersecting)inView.add(target);else{inView.delete(target);const job=jobs.get(target);if(job&&!job.done)finish(job,'offscreen')}});pumpImages()},{threshold:.12});
  images.forEach(img=>imageObserver.observe(img));
 }
 preference.addEventListener('change',watchImages);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)jobs.forEach(job=>finish(job,'hidden'))});
 window.addEventListener('resize',()=>jobs.forEach(job=>finish(job,'resized')));
 window.addEventListener('beforeprint',()=>jobs.forEach(job=>finish(job,'print')));
 window.addEventListener('pagehide',()=>{jobs.forEach(job=>{finish(job,'closed');job.root?.unmount()})});
 watchImages();
})();
