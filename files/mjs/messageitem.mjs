/*\
title: $:/plugins/bj/simplifai/messageitem.mjs
type: application/javascript
module-type: library
\*/

const {html, render, useContext, useState, useRef, useEffect, signal} = await import ("$:/plugins/bj/unchane/preactsignal.mjs");
const marked = await import('$:/plugins/bj/plugins/marked/markdown.js');
const {setTextReference} = await import('$:/plugins/bj/unchane/store.js');
const {newTiddler} = await import ("$:/plugins/bj/unchane/utils.mjs");

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

export function MessageItem({ message, index, lastMessageRef, history, ibutton, __pwidget}) {
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
   
  function toClipBoard(parts) {
    let text = '';
    for (let item = 0; item < parts.length - 1; item++) text += (parts[item]).text + ' ';
    text += (parts[parts.length-1]).text;
    navigator.clipboard.writeText(text);
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
            setTextReference("$:/temp/bj/simplifai/CurrentGeminiChat",newtitle);
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