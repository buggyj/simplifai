/*\
title: $:/plugins/bj/simplifai/main.mjs
type: application/javascript
module-type: library
\*/

const {html, render,useContext,useState, useRef, useEffect, signal} = await import ("$:/plugins/bj/unchane/preactsignal.mjs");

const {ibutton}=await import("$:/plugins/bj/simplifai/iconbutton.mjs")
const marked = await import('$:/plugins/bj/plugins/marked/markdown.js');
const { runChat } = await import ('$:/plugins/bj/simplifai/gemini.mjs');
const {API_KEY} = await import("$:/plugins/bj/simplifai/setting.mjs"); 
const {init} = await import ("$:/plugins/bj/unchane/towidget.mjs")
const {newChatName} = await import('$:/plugins/bj/simplifai/naming.mjs')
const {newTiddler} = await import ("$:/plugins/bj/unchane/utils.mjs");
const {setTextReference} = await import('$:/plugins/bj/unchane/store.js')

let modal="$:/plugins/bj/simplifai/nokeyModal", title="",  msg=""	
let errorModal="$:/plugins/bj/simplifai/errorModal", errtitle="",  errmsg=""

export const Input=signal("")

function markdownButton(source) {
  return marked(source).replace(/<pre(?=\s|>)([^>]*)>/g, "<my-pre><pre$1>").replace(/<\/pre>/g, "</pre></my-pre>");
}

const MarkdownRenderer = ({ markdown }) => {
   const contentRef = useRef(null);

   useEffect(() => {
	   if (contentRef.current) {
		   const codeBlocks = contentRef.current.querySelectorAll('pre > code');
		   codeBlocks.forEach((codeBlock) => {
			   Prism.highlightElement(codeBlock);
		   });
	   }
   }, []); // content is static so no need to check for changes

   const htmlsource = markdownButton(markdown);

   return html`
	   <div ref=${contentRef} dangerouslySetInnerHTML=${{ __html: htmlsource }} />
   `;
};

export function Main({history,sysRole,params,__pwidget}) {
	const onSent = async (prompt) => {
     if (!API_KEY.value){onNoKey();return}	
         const error = await runChat(prompt, history,sysRole.value,params.value,__pwidget )
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
		  <${SearchBox} onSent=${onSent} API_KEY=${API_KEY} Input=${Input} ibutton=${ibutton}/>
		  <p class="bottom-info">
			BUT: Gemini may be inaccurate so
			double-check its responses.
		  </p>
		</div>
	  </div>
  `;
}

function SearchBox({ onSent, API_KEY, Input, ibutton }) {

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
        <${ibutton} name="input_icon" alt="" onclick=${() => {
          onSent(Input.value);
        }}/>
      </div>
    </div>
  `;
}
// Abstracted Message Component
function MessageItem({ message, index, lastMessageRef, history, ibutton, __pwidget}) {

/*history object
* the history is a sequence of roles (array elements), each with a role and hidden field.
* An interaction (inta) is consecutive sequence of roles.
* Each inta has one role of type user (a user-role), which starts the inta. The inta 
* fininsh immediately before the next user-role, or end of the history array. 
* The rest of the inta is made-up of other role types.
* Each role in the inta has a parent field.
* The parent field contain an index (into the history array), that is the position
* of the last role of its parent inta. More that one inta can have the same parent, and
* the inta form a tree within the history.
* 
* Example array called 'history':The first row is the index (shown in hexidecimal) of the history array
* and the second row show the value of the parent index of the inta. The / delimits a inta,
* - represents 'null'. roles have a hidden field. Every role in the same inta has the same value
* of parent and the same value of hidden.
* 
* index |0|1|2|3|4|5|6|7|8|9|a|b|c|d|e|f|
* parent|-|-|-|-/3|3|3/6|6|6/6|6/3|3/b|b|
* hidden|n|n|n|n/n|n|n/n|n|n/y|y/n|n/y|y| 
* 
* so we have 
* 
* inta(0-3,n), inta(4-6,n), inta(7-9,n), inta(a-b,y), inta(c-d,n), inta(e-f,y)
* 
* the roles with records with hidden = n form the active path thru the array, in the example with have
* an active path of: inta(0-3,n), inta(4-6,n),inta(7-9,n),inta(c-d,n). There is
* only one active path in the array. 
* There is another array called 'show'. that is a list of the index of active-roles, eg
* 
* i    |0|1|2|3|4|5|
* index|0|4|7|a|c|e|
* 
* A function 'makeCurrentPath(lastRole)' has a parameter that takes one of the values from 'show'. 
* It modifies the roles in the 'history' such that lastRole will be the start of the last active inta. 
* All ancestors intas (parents, and their parents etc) of this inta will have roles with hidden=n, 
* all other roles in the 'history' with have hidden=y.
*/

function onlyPathToRoot(historyold, lastRole) {
  // First, mark all roles as hidden
  let history = [...historyold.value]
  for (let i = 0; i < history.length; i++) {
    history[i].hidden = true;
  }
  
  function findIntaStart(roleIndex) {
    let currentIndex = roleIndex;
    
    // Move backward until we find a user-role or reach the beginning
    while (currentIndex > 0 && history[currentIndex].role !== 'user') {
      currentIndex--;
    }
    
    return currentIndex;
  }
  
  function unHideIntaRoles(startRoleIndex) {
    history[startRoleIndex].hidden = false
    let currentIndex = startRoleIndex + 1;
    // Continue until we find another user or reach the end
    while (currentIndex < history.length && history[currentIndex].role !== 'user') {
       history[currentIndex].hidden = false
      currentIndex++;
    }
  }
  
  // Start with the lastRole and trace back through ancestors
  let currentRole = lastRole;
  
  while (currentRole !== null && currentRole !== undefined) {
    // Find the start of the interaction containing currentRole
    const intaStart = findIntaStart(currentRole);
    
    // unhide roles in this interaction
    unHideIntaRoles(intaStart);
    
    // Move to the parent interaction
    const parentIndex = history[intaStart].parent;
    currentRole = parentIndex;
  }
  
  return history;
}
 
function subTree(historysig, nodeId) {
  var history = historysig.value;
  
  function findIntaStart(roleIndex) {
    let currentIndex = roleIndex;
    // Move backward until we find a user-role or reach the beginning
    while (currentIndex > 0 && history[currentIndex].role !== 'user') {
      currentIndex--;
    }
    
    return currentIndex;
  }

  function getInta(startRoleIndex) {
    var inta = [history[startRoleIndex]];
    let currentIndex = startRoleIndex + 1;
    
    // Continue until we find another user or reach the end
    while (currentIndex < history.length && history[currentIndex].role !== 'user') {
      inta.push(history[currentIndex]);
      currentIndex++;
    }
    
    return inta;
  }

  // Find the start of the interaction
  var startNodeId = findIntaStart(nodeId);
  
  // Get the current interaction
  var currentInta = getInta(startNodeId);
  
  // If there's a parent, recursively get the parent's subtree and append current inta
  if (history[startNodeId].parent !== null && history[startNodeId].parent !== undefined) {
    var parentSubtree = subTree(historysig, history[startNodeId].parent);
    return parentSubtree.concat(currentInta);
  }
  
  // If no parent, just return the current interaction
  return currentInta;
}
 
 
 /*
function subTree(history, n) {
  let currentNodeIndex = n;
  let treeArray = [ ...(history.value)]; 
  let newTree =[]
  let i = 0
  
  while (true) {
    const currentNode = treeArray[currentNodeIndex];
    if (currentNode.role !== "user") continue;
    newTree[i] = treeArray[currentNodeIndex+1]
    i++
    newTree[i] = treeArray[currentNodeIndex]
    i++
    if (!currentNode || currentNode.parent === null || currentNode.parent === undefined) {
      break; // Reached the root or an invalid parent
    }

    const parentIndex = currentNode.parent;

    const parentNode = treeArray[parentIndex];

    if(!parentNode) {
        break; // Handle if the supposed parent doesn't exist
    }
    currentNodeIndex = parentIndex; 
  }
  const reversedArr = [];
  for (let i = newTree.length - 1; i >= 0; i--) {
    reversedArr.push(newTree[i]);
  }
  return reversedArr;

}
*/
function toClipBoard(parts) {
      let text=''
      for (const item = 0; item < parts.length -1; item++) text += (parts[item]).text + ' '
      text += (parts[parts.length-1]).text
	  navigator.clipboard.writeText(text)
}

  return html`
    <div key=${index} ref=${index === history.value.length - 1 ? lastMessageRef : null}>
      ${message.role === "user" ? html`
        <div class="result-title" class=${!message.hidden ? '' : 'noshow'}>#${index}#
          <${ibutton} name="user_icon" alt="" onclick=${() => { history.value = onlyPathToRoot(history, index);}} title="toggle" />
          <${ibutton} name="copy_icon" alt="copy request" style="width:12px;margin:4px;" title="copy" onClick=${() => toClipBoard(message.parts)} />
          <${ibutton} name="bud_icon" alt="bud chat"  style="width:12px;margin:4px;" onclick=${() => { 
			  var base = __pwidget.toTiddlers['history'],newtitle;
              newtitle = newTiddler({basetitle:base,template:base,fields:{text:JSON.stringify(subTree(history, index))}});
              setTextReference("$:/temp/bj/simplifai/CurrentGeminiChat",newtitle)
            }} title="toggle" />
          <p>${message.parts[0].text}</p>
        </div>
      ` : html`
		  ${message.parts.some(part => part.text) ? html`
			<div class="result-data" style=${{ display: !message.hidden ? 'block' : 'none' }}>
			  <${ibutton} name="gemini_icon" alt="" />
			  <${ibutton} name="copy_icon" alt="copy reply" style="width:12px;margin:4px;" title="copy" onClick=${() => toClipBoard(message.parts)} />
			  ${message.parts.map((part, i) => {if (part.text) return html`<${MarkdownRenderer} key=${i} markdown=${part.text} />`})}
			</div>
		  ` : ''}
	`}
    </div>
  `;
}
