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
let modal="ModalMessage", title="Error no key",  msg="No key found, setup need a key"	
export const Input=signal("")

export function Main({history,__pwidget}) {
	const onSent = async (prompt) => {
     if (!API_KEY.value){onNoKey();return}
		//setResult("")
		//setStarted(true)
		setCurrentPrompt(Input.value)
		Input.value=""
		//let response=
        await runChat(prompt, history, __pwidget)
		//setResult(response)	
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
    
	const [currentPrompt, setCurrentPrompt] = useState("");
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
                <div class="result-title">
	              <${ibutton} name="user_icon" alt="" />
	              <p>${message.parts[0].text}</p>
	            </div>`
                : html` 
                <div class="result-data">
	              <${ibutton} name="gemini_icon" alt="" />
                      ${message.parts.map(
                      (part, i) => html`<p key=${i} dangerouslySetInnerHTML=${{ __html: marked(part.text )}}></p>`)}
	            </div>`
              }
	        </div> `     
          )//history.value.map
         }
        </div>   
		<div class="main-bottom">
		  <div class="search-box">
			<input
			  onchange=${(e) => {
				//setInput(e.target.value)
				Input.value=e.target.value
				  
			  }}
			  value=${Input.value}
			  type="text"
			  placeholder="Don't be shy..."
			/>
			<div>
			  <${ibutton} name="send_icon" alt="" onclick=${() => {
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

