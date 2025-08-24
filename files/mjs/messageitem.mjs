/*\
title: $:/plugins/bj/simplifai/messageitem.mjs
type: application/javascript
module-type: library
\*/

const {html, render, useContext, useState, useRef, useEffect, signal} = await import ("$:/plugins/bj/unchane/preactsignal.mjs");
const marked = await import('$:/plugins/bj/plugins/marked/markdown.js');
const {setTextReference} = await import('$:/plugins/bj/unchane/store.js');
const {newTiddler} = await import ("$:/plugins/bj/unchane/utils.mjs");

const {ibutton} = await import("$:/plugins/bj/simplifai/iconbutton.mjs");
const {busy,runChat,aiType} = await import ("$:/plugins/bj/simplifai/ai.mjs")
const {API_KEY,generationConfig,MODEL_NAME} = await import("$:/plugins/bj/simplifai/setting.mjs"); 
const {init} = await import ("$:/plugins/bj/unchane/towidget.mjs")

//duplicate code
let  nokey = {$message:"tm-modal", $param:"$:/plugins/bj/simplifai/nokeyModal", title:"", message:""}

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

export function MessageItem({ message, index, lastMessageRef, history, __pwidget}) {
  const {sendmessage} = init(__pwidget)
  const onNoKey = () => {sendmessage(nokey)}
  
  function onlyPathToRoot(historyold, lastRole, notCurrent) {
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
    
    if (notCurrent) { 
	  const intaStart = findIntaStart(currentRole);
      
      // unhide roles in this interaction
      //unHideIntaRoles(intaStart);
      
      // Move to the parent interaction
      const parentIndex = history[intaStart].parent;
      currentRole = parentIndex; 
	}
    console.log(currentRole)
    while (currentRole !== null && currentRole !== undefined) {
      // Find the start of the interaction containing currentRole
      const intaStart = findIntaStart(currentRole);
      
      // unhide roles in this interaction
      unHideIntaRoles(intaStart);
      
      // Move to the parent interaction
      const parentIndex = history[intaStart].parent;
      currentRole = parentIndex;
      console.log(currentRole)
    }
    
    return history;
  }
  
    function findIntaStart(history,roleIndex) {
      let currentIndex = roleIndex;
      // Move backward until we find a user-role or reach the beginning
      while (currentIndex > 0 && history[currentIndex].role !== 'user') {
        currentIndex--;
      }
      
      return currentIndex;
    }

    function getInta(history,startRoleIndex) {
      var inta = [history[startRoleIndex]];
      let currentIndex = startRoleIndex + 1;
      
      // Continue until we find another user or reach the end
      while (currentIndex < history.length && history[currentIndex].role !== 'user') {
        inta.push(history[currentIndex]);
        currentIndex++;
      }
      
      return inta;
    }
    function getIntaReroot(history,startRoleIndex) {
	  var prev = null, inta = [{...history[startRoleIndex],parent:null}];
      let currentIndex = startRoleIndex + 1, newpos=0;
     
      // Continue until we find another user or reach the end
      while (currentIndex < history.length) {
		 if (history[currentIndex].hidden) {
			 currentIndex++;
			 continue;
		 }  
		  
		if (history[currentIndex].role === 'user') {
			prev = newpos;
		}
        inta.push({...history[currentIndex],parent:prev});
		newpos++;
        currentIndex++;
      }
      
      return inta;
    }
  function headTree(historysig, nodeId) {  
	var history = historysig.value;
   
    // Find the start of the interaction
    var startNodeId = findIntaStart(history,nodeId);
    
    // Get the current interaction
    var currentInta = getIntaReroot(history,startNodeId);

    return currentInta;
  }
	  
  function subTree(historysig, nodeId) {
    var history = historysig.value;
    

    // Find the start of the interaction
    var startNodeId = findIntaStart(history,nodeId);
    
    // Get the current interaction
    var currentInta = getInta(history,startNodeId);
    
    // If there's a parent, recursively get the parent's subtree and append current inta
    if (history[startNodeId].parent !== null && history[startNodeId].parent !== undefined) {
      let {parentSubtree,newparent} = subTree(historysig, history[startNodeId].parent);
      currentInta.forEach(obj => {
		  obj.parent = newparent;
		});
	  
	  let start = parentSubtree?parentSubtree.length:0;//will be first location in currentIntra
      return {parentSubtree:parentSubtree.concat(currentInta),newparent:start};
    }
    
    // If no parent, just return the current interaction
    return {parentSubtree:currentInta, newparent:0};
  }
   
  function toClipBoard(parts) {
    let text = '';
    for (let item = 0; item < parts.length - 1; item++) text += (parts[item]).text + ' ';
    text += (parts[parts.length-1]).text;
    navigator.clipboard.writeText(text);
  }
  //invokeSummarize not currently used
  async function  invokeSummarize(prompt,history){
	const summary={title:""}//title is not a good name.. it is the response of the AI
	if (!API_KEY.value){onNoKey();return} 
	const error = await runChat(prompt,{value:history},"","",generationConfig,"",MODEL_NAME,__pwidget,false,false,summary)
	if (error) return ""; 
	busy.value=false;console.log (summary.title)
	return  summary.title
  }

  let makeSummaryPrompt = "extact the useful infomation in this chat in 500 words, concentrate on positive technical details and examples. Do not mention failures "
  return html`
    <div key=${index} ref=${index === history.value.length - 1 ? lastMessageRef : null}>
      ${message.role === "user" ? html`
        <div class="result-title" class=${!message.hidden ? '' : 'noshow'}>#${index}#
          <${ibutton} name="user_icon" alt="" style="cursor: pointer;" onclick=${() => { history.value = onlyPathToRoot(history, index);}} title="last" />
          <${ibutton} name="copy_icon" alt="copy request" style="width:12px;margin:4px;cursor: pointer;" title="copy" onClick=${() => toClipBoard(message.parts)} />
          <${ibutton} name="bud_icon" alt="bud chat"  style="width:12px;margin:4px;cursor: pointer;" onclick=${() => { 
            var base = __pwidget.toTiddlers['history'],newtitle;
            newtitle = newTiddler({basetitle:base,template:base,fields:{text:JSON.stringify(subTree(history, index).parentSubtree)}});
            setTextReference("$:/temp/bj/simplifai/CurrentGeminiChat",newtitle);
          }} title="clone" />
          ${(!message.hidden) && html`
			  <${ibutton} name="hat_icon" alt="top chat"  style="width:12px;margin:4px;cursor: pointer;" onclick=${() => { 
				let base = __pwidget.toTiddlers['history'],newtitle;
				//let summary = invokeSummarize(makeSummaryPrompt,subTree(history, index))
				//console.log(summary)
				newtitle = newTiddler({basetitle:base,template:base,fields:{text:JSON.stringify(headTree(history, index))}});
				setTextReference("$:/temp/bj/simplifai/CurrentGeminiChat",newtitle);
			  }} title="newchat with last" />
          `}
          <p style="cursor: pointer;" onclick=${() => { history.value = onlyPathToRoot(history, index, true);}}>${message.parts[0].text}</p>

        </div>
      ` : html`
        ${message.parts.some(part => part.text) ? html`
          <div class="result-data" style=${{ display: !message.hidden ? 'block' : 'none' }}>
            <${ibutton} name=${aiType.value==="gemini"?"gemini_icon":"spokes_icon"} alt="" />
            <${ibutton} name="copy_icon" alt="copy reply" style="width:12px;margin:4px;cursor: pointer;" title="copy" onClick=${() => toClipBoard(message.parts)} />
            ${message.parts.map((part, i) => {if (part.text) return html`<${MarkdownRenderer} key=${i} markdown=${part.text} />`})}
          </div>
        ` : ''}
      `}
    </div>
  `;
}