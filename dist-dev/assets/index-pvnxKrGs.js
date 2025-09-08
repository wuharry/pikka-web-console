(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const n of s.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&o(n)}).observe(document,{childList:!0,subtree:!0});function r(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(a){if(a.ep)return;a.ep=!0;const s=r(a);fetch(a.href,s)}})();const f={log:"text-blue-600",warn:"text-yellow-600",info:"text-green-600",error:"text-red-600"};function y(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}function C({message:e,colorClass:t}){return"level"in e?`
      <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
        <span class="text-xs font-bold ${t[e.level]}">[${e.level}]</span>
        <span class="text-xs text-gray-400 ml-2">[${new Date().toLocaleTimeString()}]</span>
        <pre class="text-sm font-mono mt-1 whitespace-pre-wrap">${y(e.message)}</pre>
      </div>
    `:`
    <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
      <span class="text-xs font-bold  ${t.error}">[${e.name}]</span>
      <span class="text-xs text-gray-400 ml-2">[${new Date().toLocaleTimeString()}]</span>
      <pre class="text-sm font-mono mt-1 whitespace-pre-wrap">${y(e.message)}</pre>
    </div>
  `}function p({messages:e,colorClass:t}){return e.length===0?'<div class="text-gray-500 p-4">No messages</div>':e.map(r=>C({message:r,colorClass:t})).join("")}function g(e,t){return`<div class="${t}">${e}</div>`}function L({messages:e,containerClass:t="bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto"}){const r=e.slice().sort((o,a)=>a.timestamp-o.timestamp);return r.length===0?'<div class="text-gray-500 p-4">No messages</div>':`<div class="${t}">
  <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
  </
    ${p({messages:r,colorClass:f})} })}
  </div>`}const d="console-content overflow-y-auto",x={log:"bg-blue-600",error:"bg-red-600",warn:"bg-yellow-600",info:"bg-green-600",all:"bg-slate-700"},m={log:e=>g(p({messages:e,colorClass:f}),d),error:e=>g(p({messages:e,colorClass:f}),d),warn:e=>g(p({messages:e,colorClass:f}),d),info:e=>g(p({messages:e,colorClass:f}),d),all:e=>L({messages:e,containerClass:d})},S=(e,t)=>{e.forEach(r=>r.classList.remove("active","text-gray-50",...t))},E=e=>{const t=e.dataset.tab||"all";e.classList.add("active","text-gray-50",x[t])},T=({tabType:e,consoleData:t})=>{if(e==="all")return m.all(t);if(e==="error")return m.error(t);try{return m[e](t)}catch{return""}},A=({tabType:e,consoleData:t})=>{const r=document.querySelector("#tab-content");r&&(r.innerHTML=T({tabType:e,consoleData:t}))};function k(e){const t=document.querySelector("#tab-links");if(!t)return;const r=t.querySelectorAll('button[role="tab"]'),o=Object.values(x);r.forEach(a=>{const s=a.cloneNode(!0);if(s.dataset.tab){const n=s.textContent?.toLowerCase().trim();s.dataset.tab=n}else s.dataset.tab="all";a.parentNode?.replaceChild(s,a),s.addEventListener("click",n=>{const i=n.currentTarget;S(t.querySelectorAll('button[role="tab"]'),o),E(i);const l=i.dataset.tab;if(!l)return;const b=[...e.error,...e.info,...e.warn,...e.log];A({tabType:l,consoleData:l==="all"?b:e[l]})})})}const I=(e,t)=>{const r={error:[],info:[],warn:[],log:[]},o=new BroadcastChannel(e);(()=>{o.addEventListener("message",s)})();function s(i){const l=i.data;!l||!l.message||("level"in l&&l.level?r[l.level].push(l):"name"in l&&r.error.push(l),t&&t())}return{getChannelData:()=>{const{error:i,info:l,warn:b,log:w}=r;return{error:i,info:l,warn:b,log:w}},cleanUp:()=>{o.removeEventListener("message",s),o.close()}}};function O(){let e;const t=()=>{const r=e.getChannelData();k(r)};return e=I("pikka-web-console-channel",t),{render:t,stop:e.cleanUp}}const c=e=>{const t=new WeakSet,r={string:o=>o,number:o=>o.toString(),boolean:o=>o.toString(),object:o=>JSON.stringify(o,(a,s)=>{if(typeof s=="object"&&s!==null){if(t.has(s))return"[Circular]";t.add(s)}return s instanceof Error?{name:s.name,message:s.message,stack:s.stack}:s}),function:o=>`[Function: ${o.name||"anonymous"}]`,symbol:o=>o.toString(),bigint:o=>o.toString()+"n",undefined:()=>"undefined"};try{const o=typeof e;if(o in r){const a=r[o];return a(e)}return String(e)}catch{return"[Unserializable]"}},u=()=>Date.now(),M=({callback:e})=>{const{log:t,warn:r,info:o}=console;return{stop:()=>{console.log=t,console.info=o,console.warn=r},start:()=>{console.log=(...n)=>{const i={level:"log",args:n,message:n.map(c).join(" "),timestamp:u(),source:{tabId:"",url:location.pathname+location.search+location.hash,origin:location.origin}};e(i),t.apply(console,n)},console.warn=(...n)=>{const i={level:"warn",args:n,message:n.map(c).join(" "),timestamp:u(),source:{tabId:"",url:location.pathname+location.search+location.hash,origin:location.origin}};e(i),r.apply(console,n)},console.info=(...n)=>{const i={level:"info",args:n,message:n.map(c).join(" "),timestamp:u(),source:{tabId:"",url:location.pathname+location.search+location.hash,origin:location.origin}};e(i),o.apply(console,n)}}}},$=({callback:e})=>{const{error:t}=console;console.error=(...n)=>{const i={name:n[0]instanceof Error?n[0].name:"Error",message:n[0]instanceof Error?n[0].message:c(n[0]),stack:n[0]instanceof Error?n[0].stack:"",cause:n[0]instanceof Error?n[0].cause:void 0,timestamp:u(),source:{tabId:"",url:location.pathname+location.search+location.hash,origin:location.origin}};e(i),t.apply(console,n)};const r=n=>{const i={name:n instanceof ErrorEvent&&n.error?.name||"Error",message:n instanceof ErrorEvent?n.error?.message:c(n),stack:n instanceof ErrorEvent?n.error?.stack:"",timestamp:u(),source:{tabId:"",url:location.pathname+location.search+location.hash,origin:location.origin}};e(i)},o=n=>{const i=`Promise UnhandledRejection: ${c(n.reason)}`,l={name:n.reason&&n.reason instanceof Error?n.reason.name:"Error",message:n.reason&&n.reason instanceof Error?n.reason.message:i,stack:n.reason&&n.reason instanceof Error?n.reason.stack:"",timestamp:u(),source:{tabId:"",url:location.pathname+location.search+location.hash,origin:location.origin}};e(l)};return{start:()=>{window.addEventListener("error",r),window.addEventListener("unhandledrejection",o)},stop:()=>{window.removeEventListener("error",r),window.removeEventListener("unhandledrejection",o),console.error=t}}},_=e=>{const t=new BroadcastChannel(e),r=M({callback:n=>{t.postMessage(n)}}),o=$({callback:n=>{t.postMessage(n)}});return{start:()=>{r.start(),o.start()},stop:()=>{r.stop(),o.stop(),t.close()}}};function N(){const e=_("pikka-web-console-channel");return{start:()=>{e.start()},cleanUp:()=>{e.stop()}}}const U=`<div class="font-sans leading-6 font-normal text-gray-100 bg-gray-950 
            min-h-screen flex flex-col m-0 w-full">

  <!-- Header Container -->
  <div class="w-full">
    <!-- Tab Navigation -->
    <ul id="tab-links" 
        role="tablist"
        class="flex flex-wrap text-sm font-medium text-center 
               text-gray-400 border-b border-gray-700 select-none
               /* active 樣式（由 JS 加上 .active 時生效） */
               [&_.active]:text-white [&_.active]:bg-gray-800/70">

      <!-- Log Tab -->
      <li class="me-2">
        <button role="tab" aria-current="page"
                class="inline-block px-4 py-2 rounded-t-lg transition-colors
                       hover:!text-white hover:!bg-gray-800/80 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-blue-500/50">
          Log
        </button>
      </li>

      <!-- Error Tab -->
      <li class="me-2">
        <button role="tab"
                class="inline-block px-4 py-2 rounded-t-lg transition-colors
                       hover:!text-white hover:!bg-gray-800/80 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-red-500/40">
          Error
        </button>
      </li>

      <!-- Warn Tab -->
      <li class="me-2">
        <button role="tab"
                class="inline-block px-4 py-2 rounded-t-lg transition-colors
                       hover:!text-white hover:!bg-gray-800/80 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-yellow-500/40">
          Warn
        </button>
      </li>

      <!-- Info Tab -->
      <li class="me-2">
        <button role="tab"
                class="inline-block px-4 py-2 rounded-t-lg transition-colors
                       hover:!text-white hover:!bg-gray-800/80 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-green-500/40">
          Info
        </button>
      </li>

      <!-- All Tab -->
      <li>
        <button role="tab"
                class="inline-block px-4 py-2 rounded-t-lg transition-colors
                       hover:!text-white hover:!bg-gray-800/80 focus-visible:outline-none
                       focus-visible:ring-2 focus-visible:ring-purple-500/40">
          All
        </button>
      </li>
    </ul>
  </div>

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col">
    <!-- Tab Content Display -->
    <div id="tab-content"
         class="flex-1 bg-gray-900 overflow-hidden
                /* 覆蓋 JS 生成項目的 hover 與邊框（不改 JS） */
                [&_.console-message]:!border-gray-700
                [&_.console-message:hover]:!bg-gray-800/60
                [&_.text-gray-400]:text-gray-400">

      <!-- Console History Display -->
      <div class="console-history h-full flex flex-col">
        <!-- Input Log Display -->
        <div id="console-input-log" 
             class="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
          <!-- console 輸入內容 -->
        </div>

        <!-- Output Log Display -->
        <div id="console-output-log" 
             class="flex-1 overflow-y-auto p-4 space-y-2 
                    border-t border-gray-700 text-sm">
          <!-- console 輸出內容 -->
        </div>
      </div>
    </div>

    <!-- Console Input Area -->
    <div class="border-t border-gray-700 p-4 bg-gray-900">
      <div class="flex items-center space-x-2">
        <span class="text-green-400 font-mono">></span>
        <input id="console-input" 
               type="text" 
               autofocus 
               spellcheck="false"
               placeholder="輸入 JavaScript 指令..."
               class="flex-1 bg-gray-800 text-gray-100 
                      border border-gray-600 rounded px-3 py-2
                      focus:border-blue-500 focus:outline-none
                      font-mono text-sm transition-colors">
      </div>
    </div>
  </div>
</div>
`;function j(){let e=!1,t=!1,r=null,o=null;const a=()=>{const n=document.querySelector("#pikka-console-web");return n?(n.innerHTML=U,!0):!1},s=()=>(o=N(),o.start(),r=O(),r.render(),!!r);return{initialize(){return e?!0:a()?(s(),e=!0,!0):!1},bootUp(){return this.initialize()?t?!0:s()?(t=!0,!0):!1:!1},restart(){return e=!1,t=!1,this.bootUp()},stop(){o&&o.cleanUp(),r&&r.stop(),t=!1},getApplicationStatus(){return{isInitialized:e,isStarted:t}},isReady(){return e&&t}}}const v=j();function h(){v.bootUp()&&typeof window<"u"&&(window.consoleApp=v)}function D(){return typeof window>"u"?!1:document.readyState==="loading"?(document.addEventListener("DOMContentLoaded",h,{once:!0}),!1):(h(),!0)}D();
//# sourceMappingURL=index-pvnxKrGs.js.map
