/*\
title: $:/plugins/bj/simplifai/main.mjs
type: application/javascript
module-type: library
\*/

const {html, render,useContext,useState, useRef, useEffect, signal} = await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs");

const {ibutton}=await import("$:/plugins/bj/simplifai/iconbutton.mjs")
const marked = await import ("$:/plugins/bj/plugins/marked/markdown.js");
const { runChat } = await import ('$:/plugins/bj/simplifai/gemini.mjs');
//const { runChat } = await import ('$:/plugins/bj/simplifai/gpt.mjs')
const {API_KEY} = await import("$:/plugins/bj/simplifai/setting.mjs"); 

const {init} = await import ("$:/plugins/bj/tiddlywiki-preact/towidget.mjs")

function mssg(modal, name, msg) {return `<$action-sendmessage $message="tm-modal" $param="${modal}" title="${title}" message="${msg}"/>`}
let modal="$:/plugins/bj/simplifai/nokeyModal", title="",  msg=""	
export const Input=signal("")

function markdown(source) {
  return (marked(source)).replace(/<pre>/g, "<my-pre><pre>").replace(/<\/pre>/g, "</pre></my-pre>");
}
export function Main({history,sysRole,params,__pwidget}) {
	const onSent = async (prompt) => {
     if (!API_KEY.value){onNoKey();return}
		Input.value=""
        await runChat(prompt, history,sysRole,params,__pwidget)
	}
  const onNoKey = () => {invokeActionString(mssg(modal, name, msg))}
  const lastMessageRef = useRef(null);
  const {dispatchEvent, invokeActionString} = init(__pwidget)
  // Scroll to the first line of the last message when history updates
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView();
    }
  }, [history.value]); // Runs every time history updates
    
    const [started, setStarted] = useState(false);
    const [result, setResult] = useState("");
	return html`
    <div class="main">
		<div class="maincontainer" >
		 ${!(history.value)  ? html `
            <div class="greet">
              <h1>
                <span>Hello You,</span>
              </h1>
              <h1>can I help You today?</h1>
            </div>
		`:history.value.map(
          (message, index) => html`
            <div key=${index} ref=${index === history.value.length - 1 ? lastMessageRef : null}>
              <!-- Display User or Bot Icon -->
              ${message.role === "user"
                ? html`	
                <div class="result-title" class=${!message.hidden?'':'noshow'} onclick=${() =>{
						if (history.value[index].hidden){
							delete history.value[index].hidden;
							delete history.value[index+1].hidden;
							history.value = [...history.value]
						}
						else {
							history.value[index].hidden=true;
							history.value[index+1].hidden=true;
							history.value = [...history.value]				
						}}} >
	              <${ibutton} name="user_icon" alt="" />
	              <p>${message.parts[0].text}</p>
	            </div>`
                : html` 
                <div class="result-data" style="display:${!message.hidden?'block':'none'};">
	              <${ibutton} name="gemini_icon" alt="" />
                      ${message.parts.map(
                      (part, i) => html`<p key=${i} dangerouslySetInnerHTML=${{ __html: markdown(part.text )}}></p>`)}
	            </div>`
              }
	        </div> `     
          )//history.value.map
         }
        </div>   
		<div class="main-bottom">
		  <div class="search-box">
			<textarea
			  onkeydown=${(e) => {
			 
				if (e.key === "Enter" && !e.shiftKey) {
				  e.preventDefault(); // Prevent default behavior (new line)
				 onSent(e.target.value)
				 if (API_KEY.value){ 
					e.target.value=''
					e.target.parentElement.style.height = 'auto';
					e.target.style.height = 'auto';
				 }
				}
			  }}
			  onInput=${(e) => { 
			     e.target.style.height = 'auto';
			  	 e.target.parentElement.style.height = 'auto';
			  	 e.target.style.height = (e.target.scrollHeight) + 'px';
				 e.target.parentElement.style.height = (e.target.scrollHeight) + 'px';
				  
			  }}
			  onchange=${(e) => {
				e.target.parentElement.style.height = 'auto';
				 e.target.parentElement.style.height = (e.target.scrollHeight) + 'px';
				 e.target.style.height = 'auto';
				 e.target.style.height = (e.target.scrollHeight) + 'px';
				//setInput(e.target.value)
				Input.value=e.target.value
				  
			  }}
			  value=${Input.value}
			  type="text"
			  placeholder="Don't be shy..."
			/>
			<div>
			  <${ibutton} name="input_icon" alt="" onclick=${() => {
				  onSent(Input.value)
				}}/>
			  
			</div>
		  </div>
		  <p class="bottom-info">
			BUT: Gemini may be inaccurate so
			double-check its responses.
		  </p>
		</div>
	  </div>
  `;
}

