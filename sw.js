const C=1048576,E=C+28,PC=80;let KEY=null,MAP={};
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('message',e=>{KEY=e.data.key;MAP=e.data.map;e.ports[0]&&e.ports[0].postMessage('ok')});
const idb=()=>new Promise((r,j)=>{const q=indexedDB.open('board',1);q.onupgradeneeded=()=>q.result.createObjectStore('k');q.onsuccess=()=>{const g=q.result.transaction('k').objectStore('k').get('s');g.onsuccess=()=>r(g.result);g.onerror=j};q.onerror=j});
async function part(n,x,a,b){const p=Math.floor(a/PC),o=a%PC,k=Math.min(b,p*PC+PC-1)-a+1,u=new URL(`../creative-board-m${x.p[p]}/${n}.${p}.bin`,self.registration.scope);
const s=o*E,e=Math.min((o+k)*E,x.e[p])-1;const r=await fetch(u,{headers:{Range:`bytes=${s}-${e}`}});if(!r.ok)throw Error(r.status);let d=new Uint8Array(await r.arrayBuffer());if(r.status===200)d=d.slice(s,e+1);
const out=[];for(let i=0;i*E<d.length;i++){const b=d.subarray(i*E,Math.min((i+1)*E,d.length));out.push(new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12),additionalData:new TextEncoder().encode(n+':'+(a+i))},KEY,b.slice(12))))}
return{out,k}}
self.addEventListener('fetch',e=>{const m=new URL(e.request.url).pathname.match(/\/v\/(\d+)$/);if(!m)return;e.respondWith((async()=>{if(!KEY){const s=await idb().catch(()=>null);if(s){KEY=s.key;MAP=s.map}}
const n=m[1],x=MAP[n];if(!KEY||!x)return new Response('',{status:404});
const h=/bytes=(\d+)-(\d*)/.exec(e.request.headers.get('range')||'bytes=0-'),st=+h[1],en=Math.min(h[2]?+h[2]:x.z-1,x.z-1,st+4*C-1);if(st>=x.z)return new Response('',{status:416});
try{const a=Math.floor(st/C),b=Math.floor(en/C);const {out,k}=await part(n,x,a,b);const last=Math.min(en,(a+k)*C-1,x.z-1),buf=new Uint8Array(last-st+1);let pos=a*C,w=0;
for(const c of out){const f=Math.max(st,pos),t=Math.min(last,pos+c.length-1);if(t>=f){buf.set(c.subarray(f-pos,t-pos+1),w);w+=t-f+1}pos+=c.length}
return new Response(buf,{status:206,headers:{'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Length':String(buf.length),'Content-Range':`bytes ${st}-${last}/${x.z}`}})}catch(_){return new Response('',{status:502})}})())});
