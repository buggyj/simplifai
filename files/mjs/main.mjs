/*\
title: $:/plugins/bj/simplifai/main.mjs
type: application/javascript
module-type: library
\*/

const {html, render,useContext,useState, useRef, useEffect, signal} = await import ("$:/plugins/bj/unchane/preactsignal.mjs");

const {ibutton} = await import("$:/plugins/bj/simplifai/iconbutton.mjs");
const { goChat,Search,aiType } = await import ('$:/plugins/bj/simplifai/ai.mjs');
const {API_KEY} = await import("$:/plugins/bj/simplifai/setting.mjs"); 
const {init} = await import ("$:/plugins/bj/unchane/towidget.mjs");
const {MessageItem} = await import('$:/plugins/bj/simplifai/messageitem.mjs');
const { filterTiddlers } = await import ("$:/plugins/bj/unchane/storeutils.js");
const {getTextReference,setTextReference} = await import('$:/plugins/bj/unchane/store.js')

let modal="$:/plugins/bj/simplifai/nokeyModal", title="",  msg=""	
let errorModal="$:/plugins/bj/simplifai/errorModal", errtitle="",  errmsg=""



export const Input=signal("")

function getcards(){
   return filterTiddlers("[all[shadows+tiddlers]tag[chatterbot]]");
}
const cards = [
  { id: 1, title: "Summarize text",     description: "Paste any text and get a concise summary  fsdgsdf sdfg sfsdfg Paste any text and get a concise summary" },
  { id: 2, title: "Write an email",     description: "Draft professional emails quickly"         },
  { id: 3, title: "Explain a concept",  description: "Get clear explanations on any topic"       },
  { id: 4, title: "Generate ideas",     description: "Brainstorm creative ideas for any project" },
    { id: 5, title: "Summarize text",     description: "Paste any text and get a concise summary" },
  { id: 6,title: "Write an email",     description: "Draft professional emails quickly"         },
  { id: 7, title: "Explain a concept",  description: "Get clear explanations on any topic"       },
  { id: 8, title: "Generate ideas",     description: "Brainstorm creative ideas for any project" },
];

function actionCard (card) {
  let chat = '$:/temp/bj/newChat';
  setTextReference(`${chat}!!sysparams`,getTextReference(`${card}!!sysparams`));
  setTextReference(`${chat}!!sysrole`,getTextReference(`${card}!!sysrole`));
    setTextReference(`${chat}!!sysmodel`,getTextReference(`${card}!!sysmodel`));
  setTextReference(`${chat}!!systools`,getTextReference(`${card}!!systools`));
  setTextReference(`${chat}!!tools`,getTextReference(`${card}!!tools`));
}

export function SuggestionCards({ configured, setConfigured }) {
  //if (configured) return null;

  const cards = getcards();

  // skip is no chatterbot cards
  if (!cards || cards.length === 0) {
    setConfigured(true);
    return null;
  }

  return html`
  <div class="suggestion-cards">
  ${cards.map(tiddler => 
	    { 
            return html`
             <div
                  key=${tiddler}
                  class="suggestion-card"
                  onClick=${() => {setConfigured(true); actionCard(tiddler);}}
                >
                  <h3 >${getTextReference(`${tiddler}!!heading`)}</h3>
                  <p>${getTextReference(`${tiddler}!!details`)}</p>
                </div>`
           }
      )}
    </div>
    `
    ;

}
export function Main({history,__pwidget}) {
	const onSent = async (prompt) => {
     if (!API_KEY.value){onNoKey();return}	
         const error = await goChat(prompt, history,__pwidget,Search.value )
         if (error === false) Input.value = ''//clear prompt
         else onError()
	}
  const onNoKey = () => {sendmessage({$message:"tm-modal", $param:modal, title:"", message:msg})}
  const onError = () => {sendmessage({$message:"tm-modal", $param:errorModal, title:errtitle, message:aiType.value})}
  const lastMessageRef = useRef(null);
  console.log('ai says hi again')
  const {sendmessage} = init(__pwidget)
  // Scroll to the first line of the last message when history updates
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history.value]); // Runs every time history updates
    
    const [started, setStarted] = useState(false);
    const [result, setResult] = useState("");
    const [configured, setConfigured] = useState(false);
    
	return html`
    <div class="main">
		<div class="maincontainer" >
        ${!(history.value.length) ? html`
          <div class="greet">
              ${configured ? html`
              <h1><span>Hello You,</span></h1>
              <h1>can I help You today?</h1>
            ` : html`
                <h1>Select a chatterbot or start typing?</h1>
                <${SuggestionCards} configured=${configured} setConfigured=${setConfigured} />`}
          </div>
		`:history.value.map(
          (message, index) => html`
			  <${MessageItem}
				  key=${index}
				  message=${message}
				  index=${index}
				  lastMessageRef=${lastMessageRef}
				  history=${history}
				  __pwidget=${__pwidget}
			/>`     
          )//history.value.map
         }
        </div>   
		<div class="main-bottom">
		  <${SearchBox} onSent=${onSent} API_KEY=${API_KEY} Input=${Input} Search=${Search} ibutton=${ibutton}/>
		  <p class="bottom-info">
			BUT: AI may be inaccurate so
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
    }
  };

  const handleInput = (e) => {
    e.target.style.height = 'auto';
    e.target.parentElement.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
    e.target.parentElement.style.height = (e.target.scrollHeight) + 'px';
    Input.value = e.target.value;
  };

  const handleChange = (e) => {
    e.target.parentElement.style.height = 'auto';
    e.target.parentElement.style.height = (e.target.scrollHeight) + 'px';
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
    
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
