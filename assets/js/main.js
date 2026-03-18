document.documentElement.classList.add('js-enabled');
import { initInspireMe } from "./inspire.js";

document.documentElement.setAttribute('data-theme','light');
const rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const qs=(s,p=document)=>p.querySelector(s),qsa=(s,p=document)=>[...p.querySelectorAll(s)];
const fDate=new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric'});
const KEY={theme:'mbci-theme',prayer:'mbci-prayer-requests'};
const st={tick:false,progress:null,bar:null,loader:null,leave:false,reveal:null,countTimer:null,sermons:[],filtered:[],page:1,cache:new Map(),themeBtn:null,audio:null};
const d={
body:document.body,
header:qs('.site-header'),
navbar:qs('.navbar'),
navToggle:qs('.nav-toggle'),
navMenu:qs('.nav-menu'),
navLinks:qsa('.nav-link'),
sectionLinks:qsa('.nav-link').filter(a=>String(a.getAttribute('href')||'').startsWith('#')),
revealItems:qsa('.reveal'),
heroes:qsa('.hero,.page-hero'),
search:qs('[data-sermon-search]'),
category:qs('[data-sermon-category]'),
sermonGrid:qs('[data-sermon-grid]'),
sermonEmpty:qs('[data-sermon-empty]'),
pager:qs('[data-sermon-pagination]'),
homeSermons:qs('[data-home-sermons]'),
eventGrid:qs('[data-event-grid]'),
homeEvents:qs('[data-home-events]'),
modal:qs('#event-modal'),
mTitle:qs('#modal-title'),
mDate:qs('#modal-date'),
mLoc:qs('#modal-location'),
mDesc:qs('#modal-description'),
amountChips:qsa('.amount-chip[data-amount]'),
customAmount:qs('[data-custom-amount]'),
giveTotal:qs('[data-give-total]'),
giveForm:qs('[data-give-form]'),
giveFeedback:qs('[data-give-feedback]'),
contactForm:qs('[data-contact-form]'),
contactFeedback:qs('[data-contact-feedback]'),
prayerForm:qs('[data-prayer-form]'),
prayerFeedback:qs('[data-prayer-feedback]'),
prayerList:qs('[data-prayer-list]'),
newsForms:qsa('.newsletter-form'),
audioShell:qs('[data-audio-player]'),
audioEl:qs('[data-audio-element]'),
audioRange:qs('[data-audio-progress]'),
audioTime:qs('[data-audio-time]'),
audioTitle:qs('[data-audio-title]'),
audioSpeaker:qs('[data-audio-speaker]'),
blogModal:qs('#blog-modal'),
blogTitle:qs('#blog-modal-title'),
blogCategory:qs('#blog-modal-category'),
blogImage:qs('#blog-modal-image'),
blogContent:qs('#blog-modal-content')
};
const BLOG_ARTICLES={
discipleship:{
category:'Discipleship',
title:'How to Build a Daily Prayer Rhythm',
image:'assets/images/discipleship.jpg',
imageAlt:'Believers walking in faith',
paragraphs:[
'A steady prayer rhythm starts with consistency, not complexity. Choose a fixed daily time where you can be fully present with God and guard that time as a spiritual appointment.',
'Use a simple pattern: thanksgiving, worship, scripture meditation, intercession, and listening prayer. This keeps your devotion balanced and helps you grow in spiritual depth.',
'Write down key verses and prayer burdens in a journal. Over time, this record becomes a testimony of growth, answered prayers, and God’s guidance through each season.',
'When you miss a day, restart without guilt. Spiritual maturity is built through faithful return, not perfect performance.'
]
},
family:{
category:'Family',
title:'Raising Children in Biblical Wisdom',
image:'assets/images/family.jpg',
imageAlt:'Family reading together',
paragraphs:[
'Biblical parenting begins with modeling faith at home. Children often imitate what they consistently observe more than what they are told once.',
'Create simple family discipleship habits: shared scripture reading, short evening prayers, and weekly conversations about God’s truth in daily life.',
'Discipline should be both firm and loving. Correct behavior while affirming identity, so children understand that guidance comes from covenant love, not rejection.',
'Build an environment of grace, honesty, and encouragement where children can ask questions and grow in conviction with confidence.'
]
},
leadership:{
category:'Leadership',
title:'Serving with Excellence in Ministry',
image:'assets/images/leadership.jpg',
imageAlt:'Shepherding and ministry leadership image',
paragraphs:[
'Kingdom leadership is stewardship. We lead people by serving their growth, protecting unity, and honoring Christ in every decision.',
'Excellence in ministry means being spiritually prepared, relationally healthy, and operationally reliable. Prayer and planning should always move together.',
'Strong leaders multiply others. Develop people intentionally through mentoring, delegation, and accountability so the work outlives one person.',
'Remain humble, teachable, and faithful in private. Public fruit is sustained by private consecration.'
]
}
};
const setFeedback=(el,msg,err=false)=>{if(!el)return;el.textContent=msg;el.classList.toggle('is-error',!!err);};
const btnState=(b,on,load,idle)=>{if(!b)return;b.disabled=on;b.textContent=on?load:idle;};
const postJson=async(url,payload)=>{const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const j=await r.json().catch(()=>({ok:false,message:'Unexpected server response.'}));if(!r.ok||!j.ok)throw new Error(j.message||'Request failed.');return j;};
const fetchJson=async(url)=>{if(st.cache.has(url))return st.cache.get(url);const req=fetch(url).then(async r=>{if(!r.ok)throw new Error(`Failed to load ${url}`);return r.json();});st.cache.set(url,req);return req;};
const md=(dt)=>{const x=new Date(dt);if(Number.isNaN(x.getTime()))return{m:'TBD',d:'--'};return{m:x.toLocaleString('en-US',{month:'short'}).toUpperCase(),d:String(x.getDate()).padStart(2,'0')};};
const rd=(dt)=>{const x=new Date(dt);if(Number.isNaN(x.getTime()))return'Date unavailable';return `${fDate.format(x)} | ${x.toLocaleString('en-US',{hour:'numeric',minute:'2-digit'})}`;};
const isHomePage=()=>{const p=location.pathname.toLowerCase();return p==='/'||p.endsWith('/index.html');};
const themeLabel=t=>t==='dark'?'Light':'Dark';
const paintThemeBtn=()=>{if(!st.themeBtn)return;const t=document.documentElement.getAttribute('data-theme')||'light';const n=themeLabel(t);st.themeBtn.setAttribute('aria-label',`Switch to ${n.toLowerCase()} mode`);st.themeBtn.setAttribute('aria-pressed',String(t==='dark'));st.themeBtn.innerHTML=`<span aria-hidden='true'>${n==='Dark'?'D':'L'}</span><span>${n}</span>`;};
const applyTheme=(t,persist=true)=>{document.documentElement.setAttribute('data-theme',t);if(persist){try{localStorage.setItem(KEY.theme,t);}catch{}}paintThemeBtn();};
const initTheme=()=>{const pref=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';let stored=null;try{stored=localStorage.getItem(KEY.theme);}catch{}applyTheme(stored||pref,false);if(!d.navbar)return;const b=document.createElement('button');b.type='button';b.className='theme-toggle';b.setAttribute('aria-live','polite');b.addEventListener('click',()=>{const cur=document.documentElement.getAttribute('data-theme')||'light';applyTheme(cur==='dark'?'light':'dark');});st.themeBtn=b;if(d.navToggle)d.navToggle.insertAdjacentElement('beforebegin',b);else d.navbar.append(b);paintThemeBtn();};
const initChrome=()=>{const p=document.createElement('div');p.className='scroll-progress';p.setAttribute('role','progressbar');p.setAttribute('aria-label','Scroll progress');p.setAttribute('aria-valuemin','0');p.setAttribute('aria-valuemax','100');p.setAttribute('aria-valuenow','0');p.innerHTML="<span class='scroll-progress-bar' aria-hidden='true'></span>";const l=document.createElement('div');l.className='site-loader';l.setAttribute('role','status');l.setAttribute('aria-live','polite');l.setAttribute('aria-label','Loading page');l.innerHTML="<div class='site-loader-spinner' aria-hidden='true'></div><p class='site-loader-text'>Preparing experience...</p>";d.body.prepend(p);d.body.prepend(l);st.progress=p;st.bar=qs('.scroll-progress-bar',p);st.loader=l;};
const hideLoader=()=>{if(!st.loader)return;st.loader.classList.add('is-hidden');setTimeout(()=>st.loader?.remove(),650);};
const initVideoPlayback=()=>{const vids=qsa('video');if(!vids.length)return;const attach=v=>{v.muted=true;v.defaultMuted=true;v.autoplay=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');v.setAttribute('x5-playsinline','true');v.setAttribute('x5-video-player-type','h5');v.preload='auto';const tryPlay=()=>{const p=v.play();if(p&&typeof p.catch==='function')p.catch(()=>{});};if(v.readyState>=2)tryPlay();else{v.addEventListener('loadeddata',tryPlay,{once:true});v.addEventListener('canplay',tryPlay,{once:true});v.load();}document.addEventListener('touchstart',tryPlay,{passive:true,once:true});document.addEventListener('click',tryPlay,{once:true});addEventListener('pageshow',tryPlay);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')tryPlay();});};vids.forEach(attach);};
const upHeader=()=>{if(d.header)d.header.classList.toggle('is-scrolled',window.scrollY>14);};
const upProgress=()=>{if(!st.progress||!st.bar)return;const h=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);const pr=Math.min(100,Math.max(0,window.scrollY/h*100));st.bar.style.transform=`scaleX(${pr/100})`;st.progress.setAttribute('aria-valuenow',String(Math.round(pr)));};
const upParallax=()=>{if(rm)return;const y=window.scrollY;d.heroes.forEach(h=>h.style.setProperty('--parallax-offset',`${Math.round((y-h.offsetTop)*0.18)}px`));};
const onScroll=()=>{if(st.tick)return;st.tick=true;requestAnimationFrame(()=>{upHeader();upProgress();upParallax();st.tick=false;});};
const initScroll=()=>{upHeader();upProgress();upParallax();addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);};
const closeMenu=()=>{if(!d.navMenu||!d.navToggle)return;d.navMenu.classList.remove('is-open');d.navToggle.classList.remove('is-active');d.navToggle.setAttribute('aria-expanded','false');d.navToggle.setAttribute('aria-label','Open navigation menu');};
const toggleMenu=()=>{if(!d.navMenu||!d.navToggle)return;const open=d.navMenu.classList.toggle('is-open');d.navToggle.classList.toggle('is-active',open);d.navToggle.setAttribute('aria-expanded',String(open));d.navToggle.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');};
const initNav=()=>{if(d.navToggle){d.navToggle.setAttribute('aria-label','Open navigation menu');d.navToggle.addEventListener('click',toggleMenu);}d.sectionLinks.forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(!id)return;const t=qs(id);if(!t)return;e.preventDefault();t.scrollIntoView({behavior:rm?'auto':'smooth',block:'start'});closeMenu();}));d.navLinks.forEach(a=>{if(!a.getAttribute('href')?.startsWith('#'))a.addEventListener('click',closeMenu);});document.addEventListener('click',e=>{if(!d.navMenu?.classList.contains('is-open'))return;const inNav=e.target instanceof Element&&e.target.closest('.navbar');if(!inNav)closeMenu();});addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});if(!d.sectionLinks.length)return;const secs=d.sectionLinks.map(a=>qs(a.getAttribute('href'))).filter(Boolean);const ob=new IntersectionObserver(es=>{const v=es.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!v)return;const id=`#${v.target.id}`;d.sectionLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')===id));},{threshold:[0.35,0.65],rootMargin:'-20% 0px -55% 0px'});secs.forEach(s=>ob.observe(s));};
const observeReveal=els=>{if(!els.length)return;if(rm||!st.reveal){els.forEach(x=>x.classList.add('is-visible'));return;}els.forEach(x=>st.reveal.observe(x));};
const initReveal=()=>{if(!d.revealItems.length)return;if(rm||!('IntersectionObserver'in window)){d.revealItems.forEach(x=>x.classList.add('is-visible'));return;}st.reveal=new IntersectionObserver((es,ob)=>{es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('is-visible');ob.unobserve(e.target);});},{threshold:0.18,rootMargin:'0px 0px -40px 0px'});observeReveal(d.revealItems);};
const initTransitions=()=>{if(rm)return;document.addEventListener('click',e=>{const a=e.target instanceof Element?e.target.closest('a[href]'):null;if(!a||st.leave||e.defaultPrevented)return;const h=a.getAttribute('href');if(!h||h.startsWith('#')||h.startsWith('mailto:')||h.startsWith('tel:'))return;if(a.target==='_blank'||a.hasAttribute('download'))return;if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;const u=new URL(a.href,location.href);if(u.origin!==location.origin)return;e.preventDefault();st.leave=true;d.body.classList.add('is-leaving');setTimeout(()=>location.href=u.href,240);});};
const restorePageState=()=>{st.leave=false;d.body.classList.remove('is-leaving');d.body.classList.add('loaded','is-ready');hideLoader();};
const initHomeBackGuard=()=>{if(!isHomePage())return;const tag='__mbciHomeGuard';const cur=history.state&&typeof history.state==='object'?history.state:{};if(!cur[tag])history.replaceState({...cur,[tag]:'base'},'',location.href);history.pushState({[tag]:'lock'},'',location.href);addEventListener('popstate',()=>{if(!isHomePage())return;history.pushState({[tag]:'lock'},'',location.href);restorePageState();});};
const initHistoryStateFix=()=>{addEventListener('pageshow',()=>{restorePageState();upHeader();upProgress();upParallax();closeMenu();});addEventListener('popstate',restorePageState);addEventListener('pagehide',()=>{d.body.classList.remove('is-leaving');});};
const fmtCD=ms=>{const s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60),ss=s%60;return`${d}d ${h}h ${m}m ${ss}s`;};
const refreshCountdowns=()=>{qsa('.event-card[data-event-date]').forEach(c=>{const dt=c.getAttribute('data-event-date');const out=qs('[data-countdown]',c);if(!dt||!out)return;const t=new Date(dt).getTime();if(Number.isNaN(t)){out.textContent='Date unavailable';return;}const diff=t-Date.now();out.textContent=diff<=0?'Event is live now':`Starts in ${fmtCD(diff)}`;});};
const ensureTicker=()=>{if(st.countTimer)return;st.countTimer=setInterval(refreshCountdowns,1000);};
const sermonCard=(s,i=0)=>{const dVal=new Date(s.date);const dateTxt=Number.isNaN(dVal.getTime())?s.date:fDate.format(dVal);const delay=Math.min(i*30,180);return`<article class='sermon-card reveal' style='transition-delay:${delay}ms' data-category='${s.category}' data-title='${s.title.toLowerCase()}' data-pastor='${s.pastor.toLowerCase()}'><div class='sermon-thumb'><img src='${s.thumbnail}' alt='${s.title}' loading='lazy'/><button class='play-button' type='button' aria-label='Play ${s.title}' data-audio-src='${s.audio}' data-audio-title='${s.title}' data-audio-speaker='${s.pastor}'>Play</button></div><div class='sermon-content'><h3>${s.title}</h3><p class='meta'>${s.pastor}</p><p class='meta'>${dateTxt}</p><p class='meta'>Duration: ${s.duration}</p></div></article>`;};
const eventCard=(e,details=false,i=0)=>{const {m,d}=md(e.dateTime);const delay=Math.min(i*30,180);return`<article class='event-card reveal' style='transition-delay:${delay}ms' data-event-date='${e.dateTime}'><div class='event-date-badge'><span class='month'>${m}</span><span class='day'>${d}</span></div><div class='event-content'><h3>${e.title}</h3><p class='meta'>${e.location}</p><p class='countdown' data-countdown>Loading countdown...</p>${details?`<button class='btn btn-secondary event-open' type='button' data-event-title='${e.title}' data-event-date-text='${rd(e.dateTime)}' data-event-location='${e.location}' data-event-description='${e.description}'>View Details</button>`:`<a class='text-link' href='events.html'>View Event</a>`}</div></article>`;};
const fillCats=arr=>{if(!d.category)return;const cats=[...new Set(arr.map(x=>x.category).filter(Boolean))].sort();d.category.innerHTML=['<option value="all">All Categories</option>',...cats.map(c=>`<option value='${c}'>${c.charAt(0).toUpperCase()+c.slice(1)}</option>`)].join('');};
const renderPager=()=>{if(!d.pager)return;const size=Number(d.sermonGrid?.getAttribute('data-page-size')||6);const pages=Math.max(1,Math.ceil(st.filtered.length/size));if(pages<=1){d.pager.innerHTML='';return;}const btns=[];for(let p=1;p<=pages;p++)btns.push(`<button type='button' class='page-btn ${p===st.page?'is-active':''}' data-page='${p}' aria-label='Go to page ${p}'>${p}</button>`);d.pager.innerHTML=btns.join('');};
const renderPage=()=>{if(!d.sermonGrid)return;const size=Number(d.sermonGrid.getAttribute('data-page-size')||6);const pages=Math.max(1,Math.ceil(st.filtered.length/size));st.page=Math.min(st.page,pages);const start=(st.page-1)*size;const sub=st.filtered.slice(start,start+size);d.sermonGrid.innerHTML=sub.map((x,i)=>sermonCard(x,i)).join('');renderPager();if(d.sermonEmpty)d.sermonEmpty.hidden=sub.length!==0;observeReveal(qsa('.reveal',d.sermonGrid));};
const applyFilters=()=>{const q=d.search?d.search.value.trim().toLowerCase():'';const c=d.category?d.category.value:'all';st.filtered=st.sermons.filter(s=>{const cat=c==='all'||s.category===c;const hay=`${s.title} ${s.pastor} ${s.summary}`.toLowerCase();const txt=!q||hay.includes(q);return cat&&txt;});st.page=1;renderPage();};
const renderHomeSermons=arr=>{if(!d.homeSermons)return;d.homeSermons.innerHTML=arr.slice(0,3).map((x,i)=>sermonCard(x,i)).join('');observeReveal(qsa('.reveal',d.homeSermons));};
const renderEventsHome=arr=>{if(!d.homeEvents)return;d.homeEvents.innerHTML=arr.slice(0,3).map((x,i)=>eventCard(x,false,i)).join('');observeReveal(qsa('.reveal',d.homeEvents));refreshCountdowns();ensureTicker();};
const renderEventsPage=arr=>{if(!d.eventGrid)return;d.eventGrid.innerHTML=arr.map((x,i)=>eventCard(x,true,i)).join('');observeReveal(qsa('.reveal',d.eventGrid));refreshCountdowns();ensureTicker();};
const initData=async()=>{try{const [sermons,events]=await Promise.all([fetchJson('assets/data/sermons.json'),fetchJson('assets/data/events.json')]);if(Array.isArray(sermons)){const sorted=[...sermons].sort((a,b)=>new Date(b.date)-new Date(a.date));st.sermons=sorted;st.filtered=sorted;if(d.sermonGrid){fillCats(sorted);renderPage();d.search?.addEventListener('input',applyFilters);d.category?.addEventListener('change',applyFilters);}renderHomeSermons(sorted);}if(Array.isArray(events)){const sorted=[...events].sort((a,b)=>new Date(a.dateTime)-new Date(b.dateTime));renderEventsPage(sorted);renderEventsHome(sorted);}}catch{if(d.sermonGrid)d.sermonGrid.innerHTML="<p class='empty-state'>Unable to load sermons right now.</p>";if(d.eventGrid)d.eventGrid.innerHTML="<p class='empty-state'>Unable to load events right now.</p>";if(d.homeSermons)d.homeSermons.innerHTML="<p class='empty-state'>Sermons unavailable at the moment.</p>";if(d.homeEvents)d.homeEvents.innerHTML="<p class='empty-state'>Events unavailable at the moment.</p>";}};
const initPager=()=>{if(!d.pager)return;d.pager.addEventListener('click',e=>{const b=e.target instanceof Element?e.target.closest('[data-page]'):null;if(!b)return;const p=Number(b.getAttribute('data-page'));if(!Number.isFinite(p)||p<1)return;st.page=p;renderPage();d.sermonGrid?.scrollIntoView({behavior:rm?'auto':'smooth',block:'start'});});};
const initAudio=()=>{
  const audioEl=d.audioEl||new Audio();
  st.audio=audioEl;
  st.audio.preload='metadata';
  st.audio.setAttribute?.('playsinline','');
  st.audio.setAttribute?.('webkit-playsinline','');
  let activeBtn=null;
  const tf=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const markBtn=(btn,playing=false)=>{
    if(!btn)return;
    btn.textContent=playing?'Pause':'Play';
    const t=btn.getAttribute('data-audio-title')||'sermon';
    btn.setAttribute('aria-label',`${playing?'Pause':'Play'} ${t}`);
    btn.classList.toggle('is-playing',playing);
  };
  const resetBtns=()=>{
    qsa('.play-button[data-audio-src]').forEach(b=>markBtn(b,false));
    activeBtn=null;
  };
  const upd=()=>{
    if(!st.audio)return;
    const cur=Number.isFinite(st.audio.currentTime)?st.audio.currentTime:0;
    const dur=Number.isFinite(st.audio.duration)?st.audio.duration:0;
    if(d.audioRange){
      const pct=dur>0?cur/dur*100:0;
      d.audioRange.value=String(Math.max(0,Math.min(100,pct)));
    }
    if(d.audioTime)d.audioTime.textContent=`${tf(cur)} / ${tf(dur)}`;
  };
  if(d.audioRange){
    d.audioRange.addEventListener('input',()=>{
      if(!st.audio||!Number.isFinite(st.audio.duration)||st.audio.duration<=0)return;
      st.audio.currentTime=Number(d.audioRange.value)/100*st.audio.duration;
    });
  }
  st.audio.addEventListener('timeupdate',upd);
  st.audio.addEventListener('loadedmetadata',upd);
  st.audio.addEventListener('pause',()=>{if(activeBtn)markBtn(activeBtn,false);});
  st.audio.addEventListener('ended',()=>{if(activeBtn)markBtn(activeBtn,false);activeBtn=null;upd();});
  st.audio.addEventListener('play',()=>{if(activeBtn)markBtn(activeBtn,true);});
  const playFromBtn=btn=>{
    if(!st.audio||!btn)return;
    const src=btn.getAttribute('data-audio-src');
    if(!src)return;
    const sameSrc=st.audio.getAttribute('src')===src;
    if(sameSrc&&!st.audio.paused){st.audio.pause();return;}
    if(activeBtn&&activeBtn!==btn)markBtn(activeBtn,false);
    if(!sameSrc){st.audio.setAttribute('src',src);st.audio.load();}
    const title=btn.getAttribute('data-audio-title')||'Sermon Audio';
    const speaker=btn.getAttribute('data-audio-speaker')||'';
    if(d.audioTitle)d.audioTitle.textContent=title;
    if(d.audioSpeaker)d.audioSpeaker.textContent=speaker;
    const playPromise=st.audio.play();
    if(playPromise&&typeof playPromise.catch==='function'){
      playPromise.then(()=>{activeBtn=btn;markBtn(btn,true);upd();}).catch(()=>{markBtn(btn,false);});
    }else{
      activeBtn=btn;markBtn(btn,true);upd();
    }
  };
  const onTrigger=e=>{
    const btn=e.target instanceof Element?e.target.closest('.play-button[data-audio-src]'):null;
    if(!btn)return;
    e.preventDefault();
    playFromBtn(btn);
  };
  document.addEventListener('click',onTrigger);
  addEventListener('pageshow',()=>{
    if(st.audio&&st.audio.paused&&activeBtn)markBtn(activeBtn,false);
    upd();
  });
  addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='hidden'&&st.audio&&!st.audio.paused)st.audio.pause();
  });
  if(!d.audioEl){
    st.audio.addEventListener('error',()=>{resetBtns();});
  }else{
    d.audioEl.controls=true;
  }
};
const initModal=()=>{if(!d.modal)return;d.modal.setAttribute('aria-hidden','true');const close=()=>{d.modal.hidden=true;d.modal.setAttribute('aria-hidden','true');d.body.style.overflow='';};const open=b=>{if(!d.mTitle||!d.mDate||!d.mLoc||!d.mDesc)return;d.mTitle.textContent=b.getAttribute('data-event-title')||'Event Details';d.mDate.textContent=b.getAttribute('data-event-date-text')||'';d.mLoc.textContent=b.getAttribute('data-event-location')||'';d.mDesc.textContent=b.getAttribute('data-event-description')||'';d.modal.hidden=false;d.modal.setAttribute('aria-hidden','false');d.body.style.overflow='hidden';};document.addEventListener('click',e=>{const o=e.target instanceof Element?e.target.closest('.event-open'):null;if(o){open(o);return;}const c=e.target instanceof Element?e.target.closest('[data-modal-close]'):null;if(c)close();});addEventListener('keydown',e=>{if(e.key==='Escape'&&!d.modal.hidden)close();});};
const initBlogModal=()=>{if(!d.blogModal||!d.blogTitle||!d.blogCategory||!d.blogImage||!d.blogContent)return;d.blogModal.setAttribute('aria-hidden','true');const close=()=>{d.blogModal.hidden=true;d.blogModal.setAttribute('aria-hidden','true');d.body.style.overflow='';};const open=key=>{const article=BLOG_ARTICLES[key];if(!article)return;d.blogCategory.textContent=article.category;d.blogTitle.textContent=article.title;d.blogImage.src=article.image;d.blogImage.alt=article.imageAlt;d.blogContent.innerHTML=article.paragraphs.map(p=>`<p>${p}</p>`).join('');d.blogModal.hidden=false;d.blogModal.setAttribute('aria-hidden','false');d.body.style.overflow='hidden';};document.addEventListener('click',e=>{const trigger=e.target instanceof Element?e.target.closest('.blog-open[data-blog-key]'):null;if(trigger){e.preventDefault();open(trigger.getAttribute('data-blog-key')||'');return;}const closer=e.target instanceof Element?e.target.closest('[data-blog-modal-close]'):null;if(closer)close();});addEventListener('keydown',e=>{if(e.key==='Escape'&&!d.blogModal.hidden)close();});};
const initGive=()=>{if(!d.giveForm||!d.giveTotal)return;const setTotal=v=>{const n=Number.parseFloat(String(v));d.giveTotal.textContent=Number.isFinite(n)&&n>0?`$${n.toFixed(0)}`:'$0';};if(d.amountChips.length){d.amountChips.forEach(ch=>ch.addEventListener('click',()=>{d.amountChips.forEach(x=>x.classList.remove('is-active'));ch.classList.add('is-active');const a=ch.getAttribute('data-amount')||'0';if(d.customAmount)d.customAmount.value=a;setTotal(a);}));const active=d.amountChips.find(x=>x.classList.contains('is-active'));setTotal(active?.getAttribute('data-amount')||'0');}d.customAmount?.addEventListener('input',()=>{d.amountChips.forEach(x=>x.classList.remove('is-active'));setTotal(d.customAmount.value);});d.giveForm.addEventListener('submit',async e=>{e.preventDefault();if(!d.giveFeedback)return;const sel=d.customAmount?.value||d.amountChips.find(x=>x.classList.contains('is-active'))?.getAttribute('data-amount')||'0';const amount=Number.parseFloat(sel);const ok=d.giveForm.checkValidity()&&Number.isFinite(amount)&&amount>0;const submit=qs("button[type='submit']",d.giveForm);const card=qs("[name='cardNumber']",d.giveForm);if(!ok){setFeedback(d.giveFeedback,'Enter valid payment details and a donation amount greater than $0.',true);return;}btnState(submit,true,'Processing...','Complete Donation');try{const res=await postJson('/api/give',{giverName:String(qs("[name='giverName']",d.giveForm)?.value||'').trim(),giverEmail:String(qs("[name='giverEmail']",d.giveForm)?.value||'').trim(),amount,cardLast4:String(card?.value||'').replace(/\D/g,'').slice(-4)});setFeedback(d.giveFeedback,res.message||'Donation submitted successfully.');d.giveForm.reset();d.amountChips.forEach(x=>x.classList.remove('is-active'));const def=d.amountChips.find(x=>x.getAttribute('data-amount')==='100');if(def){def.classList.add('is-active');if(d.customAmount)d.customAmount.value='100';setTotal('100');}else setTotal('0');}catch(err){setFeedback(d.giveFeedback,err.message||'Unable to submit donation right now.',true);}finally{btnState(submit,false,'Processing...','Complete Donation');}});};
const initContact=()=>{if(!d.contactForm||!d.contactFeedback)return;d.contactForm.addEventListener('submit',async e=>{e.preventDefault();const n=qs("[name='name']",d.contactForm),em=qs("[name='email']",d.contactForm),s=qs("[name='subject']",d.contactForm),m=qs("[name='message']",d.contactForm);const mv=Boolean(m&&m.value.trim().length>=10);const ok=Boolean(n?.value.trim()&&em?.value.trim()&&s?.value.trim()&&mv&&d.contactForm.checkValidity());const submit=qs("button[type='submit']",d.contactForm);if(!ok){setFeedback(d.contactFeedback,'Please complete all fields and enter a message of at least 10 characters.',true);return;}btnState(submit,true,'Sending...','Send Message');try{const res=await postJson('/api/contact',{name:n.value.trim(),email:em.value.trim(),subject:s.value.trim(),message:m.value.trim()});setFeedback(d.contactFeedback,res.message||'Message sent successfully.');d.contactForm.reset();}catch(err){setFeedback(d.contactFeedback,err.message||'Unable to send message right now.',true);}finally{btnState(submit,false,'Sending...','Send Message');}});};
const loadPrayers=()=>{try{const p=JSON.parse(localStorage.getItem(KEY.prayer)||'[]');return Array.isArray(p)?p:[];}catch{return[];}};
const savePrayers=arr=>{try{localStorage.setItem(KEY.prayer,JSON.stringify(arr));}catch{}};
const renderPrayers=arr=>{if(!d.prayerList)return;if(!arr.length){d.prayerList.innerHTML="<li class='meta'>No requests submitted yet.</li>";return;}d.prayerList.innerHTML=arr.slice(0,5).map(x=>`<li><strong>${x.name}</strong><p class='meta'>${x.request}</p><p class='meta'>${fDate.format(new Date(x.createdAt))}</p></li>`).join('');};
const initPrayer=()=>{if(!d.prayerForm||!d.prayerFeedback)return;const arr=loadPrayers();renderPrayers(arr);d.prayerForm.addEventListener('submit',e=>{e.preventDefault();const n=String(qs("[name='name']",d.prayerForm)?.value||'').trim();const em=String(qs("[name='email']",d.prayerForm)?.value||'').trim();const r=String(qs("[name='request']",d.prayerForm)?.value||'').trim();if(!n||r.length<10){setFeedback(d.prayerFeedback,'Please enter your name and at least 10 characters for the prayer request.',true);return;}const next=[{name:n,email:em,request:r,createdAt:new Date().toISOString()},...arr].slice(0,20);savePrayers(next);renderPrayers(next);d.prayerForm.reset();setFeedback(d.prayerFeedback,'Prayer request submitted. Our team will stand with you in prayer.');});};
const initNews=()=>{if(!d.newsForms.length)return;d.newsForms.forEach(f=>{f.setAttribute('aria-label','Newsletter subscription form');const inp=qs("input[name='email']",f);const submit=qs("button[type='submit']",f);let fb=qs('.form-feedback',f);if(!fb){fb=document.createElement('p');fb.className='form-feedback';fb.setAttribute('aria-live','polite');f.append(fb);}f.addEventListener('submit',async e=>{e.preventDefault();const em=String(inp?.value||'').trim();if(!em){setFeedback(fb,'Please enter your email address.',true);return;}btnState(submit,true,'Subscribing...','Subscribe');try{const res=await postJson('/api/newsletter',{email:em});setFeedback(fb,res.message||'Subscribed successfully.');f.reset();}catch(err){setFeedback(fb,err.message||'Unable to subscribe right now.',true);}finally{btnState(submit,false,'Subscribing...','Subscribe');}});});};
const init=()=>{initChrome();initVideoPlayback();initNav();initScroll();initReveal();initTransitions();initHomeBackGuard();initHistoryStateFix();initModal();initBlogModal();initPager();initAudio();initGive();initContact();initPrayer();initNews();initInspireMe();initData();refreshCountdowns();ensureTicker();d.body.classList.add('loaded','is-ready');if(document.readyState==='complete')hideLoader();else addEventListener('load',hideLoader,{once:true});};
init();


