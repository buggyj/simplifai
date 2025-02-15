/*\
title: $:/plugins/bj/simplifai/sidebar.mjs
type: application/javascript
module-type: library
\*/
const {ibutton}=await import("$:/plugins/bj/simplifai/iconbutton.mjs")
const {html, render, useState} = await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs");
const {API_KEY} = await import("$:/plugins/bj/simplifai/setting.mjs")

const {init} = await import ("$:/plugins/bj/tiddlywiki-preact/towidget.mjs")

function mssg(modal, name, msg) {return `<$action-sendmessage $message="tm-modal" $param="${modal}" title="${name}" message="${msg}"/>`}
let modal="$:/plugins/bj/simplifai/SelectModal", name="chats",  msg="choose chat"	

function newChat(){return `<$action-setfield $tiddler="$:/temp/bj/simplifai/CurrentGeminiChat" text="$:/temp/bj/newChat"/>`}

export function sidebar({history,__pwidget}) {
	const [extended, setExtended] = useState(false)
	const [hidKeyEntry, setHidKeyEntry] = useState(true);
	const {dispatchEvent, invokeActionString} = init(__pwidget)
	return html`
	${!hidKeyEntry && html`
	<div class="bj_key-entry-overlay "></div>
	`}
    <div class="aic_sidebar">
		<div class="bottom-item btn">
		    <${ibutton}  name="menu_icon" alt="menu icon"  
			   onclick=${() => setExtended((prev) => !prev)}/>
		</div>
		<div class="bottom-item btn">
		    <${ibutton}  name="history_icon" alt="history icon"  
			   onclick=${() => (invokeActionString(mssg(modal, name, msg)))}/>
		</div>
  		<div class="bottom-item btn">
		    <${ibutton}  name="plus_icon" alt="plus icon"  
			   onclick=${() => {invokeActionString(newChat())}}/>
		</div>
		<div class="bottom-item btn">
		  <${ibutton} name="setting_icon" alt="" visable="0.5"
		  onclick=${() => setHidKeyEntry((prev) => !prev)}/>
		  ${extended ? html`<span>Set Key</span> `: null}
		  ${!hidKeyEntry ? html`
			  <div class='bj_key-entry'>Enter Key:
			  <input type="password" onchange=${(e) => {
				API_KEY.value=e.target.value		  
			  }}/>
			  <button onclick=${() => setHidKeyEntry((prev) => !prev)}>[x]</button>
			  </div> 
		  `: null}
		</div>
	</div>
  `;
}


      