/*\
title: $:/plugins/bj/simplifai/main.mjs
type: application/javascript
module-type: library
\*/

const {html, render,useContext,useState, useRef, useEffect, signal} = await import ("$:/plugins/bj/unchane/preactsignal.mjs");

const {ibutton} = await import("$:/plugins/bj/simplifai/iconbutton.mjs");
const { runChat,Search } = await import ('$:/plugins/bj/simplifai/gemini.mjs');
const {API_KEY} = await import("$:/plugins/bj/simplifai/setting.mjs"); 
const {init} = await import ("$:/plugins/bj/unchane/towidget.mjs");
const {newChatName} = await import('$:/plugins/bj/simplifai/naming.mjs');
const {MessageItem} = await import('$:/plugins/bj/simplifai/messageitem.mjs');

let modal="$:/plugins/bj/simplifai/nokeyModal", title="",  msg=""	
let errorModal="$:/plugins/bj/simplifai/errorModal", errtitle="",  errmsg=""

export const Input=signal("")


export function Main({history,sysRole,params,prefixes,__pwidget,addtools}) {
	const onSent = async (prompt) => {
     if (!API_KEY.value){onNoKey();return}	
         const tools = (Search.value?false:addtools)
         const error = await runChat(prompt, history,sysRole.value,params.value,prefixes.value,__pwidget,tools,Search.value )
         if (error === false) Input.value = ''//clear prompt
         else onError()
	}
  const onNoKey = () => {sendmessage({$message:"tm-modal", $param:modal, title:"", message:msg})}
  const onError = () => {sendmessage({$message:"tm-modal", $param:errorModal, title:errtitle, message:errmsg})}
  const lastMessageRef = useRef(null);
  
  const {sendmessage} = init(__pwidget)
  // Scroll to the first line of the last message when history updates
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history.value]); // Runs every time history updates
    
    const [started, setStarted] = useState(false);
    const [result, setResult] = useState("");
    
	return html`
    <div class="main">
		<div class="maincontainer" >
		 ${!(history.value)  ? html `
            <div class="greet">
              <h1><span>Hello You,</span></h1>
              <h1>can I help You today?</h1>
            </div>
		`:history.value.map(
          (message, index) => html`
			  <${MessageItem}
				  key=${index}
				  message=${message}
				  index=${index}
				  lastMessageRef=${lastMessageRef}
				  history=${history}
				  ibutton=${ibutton}
				  __pwidget=${__pwidget}
			/>`     
          )//history.value.map
         }
        </div>   
		<div class="main-bottom">
		  <${SearchBox} onSent=${onSent} API_KEY=${API_KEY} Input=${Input} Search=${Search} ibutton=${ibutton}/>
		  <p class="bottom-info">
			BUT: Gemini may be inaccurate so
			double-check its responses.
		  </p>
		</div>
	  </div>
  `;
}

function SearchBox({ onSent, API_KEY, Input, ibutton, Search }) {

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior (new line)
      onSent(e.target.value);
      if (API_KEY.value) {
        e.target.value = '';
        e.target.parentElement.style.height = 'auto';
        e.target.style.height = 'auto';
      }
    }
  };

  const handleInput = (e) => {
    e.target.style.height = 'auto';
    e.target.parentElement.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
    e.target.parentElement.style.height = (e.target.scrollHeight) + 'px';
  };

  const handleChange = (e) => {
    e.target.parentElement.style.height = 'auto';
    e.target.parentElement.style.height = (e.target.scrollHeight) + 'px';
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
    Input.value = e.target.value;
  };

  return html`
    <div class="search-box">
      <textarea
        onkeydown=${handleKeyDown}
        onInput=${handleInput}
        onchange=${handleChange}
        value=${Input.value}
        type="text"
        placeholder="Don't be shy..."
      />
      <div>
      ${(Search.value)  ? html `
        <${ibutton} name="world_icon" alt="" onclick=${() => {
          Search.value = !Search.value;
        }}/>`
        : html`
        <${ibutton} name="greyworld_icon" alt="" onclick=${() => {
          Search.value = !Search.value;
        }}/>`}
         <${ibutton} name="input_icon" alt="" onclick=${() => {
           onSent(Input.value);
        }}/>
      </div>
    </div>
  `;
}
