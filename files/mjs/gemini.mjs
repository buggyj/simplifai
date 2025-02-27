/*\
title: $:/plugins/bj/simplifai/gemini.mjs
type: application/javascript
module-type: library
\*/
const {GoogleGenerativeAI} = await import('https://esm.run/@google/generative-ai') 

const {signal} = await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs")
const {init} = await import ("$:/plugins/bj/tiddlywiki-preact/towidget.mjs")

const {getTextReference} = await import('$:/plugins/bj/tiddlywiki-preact/store.js')
const {newChatName} = await import('$:/plugins/bj/simplifai/naming.mjs')

const { MODEL_NAME, API_KEY, safetySettings} = await import("$:/plugins/bj/simplifai/setting.mjs");
export const busy = signal (false)

export async function runChat(prompt,history,sysRole,params,__pwidget,destination) {
     
	function createChat(apiKey, history, sysRole, params) {
	  const genAI = new GoogleGenerativeAI(apiKey);
	  const model = genAI.getGenerativeModel({ 
		 model: MODEL_NAME,
		 systemInstruction: {
		  parts: [
			{text: sysRole}
		  ]
		},
	  }); 
      
	  const chat = model.startChat({
	    history,
	    safetySettings,
	    params
	  });

	  return async (message,destination) => {
	    try {
	      const result = await chat.sendMessage(message);
	      if (destination) destination.title =result.response.text()
	      return false
	    } catch (error) {
	      console.error("Error sending message:", error);
	      return error
	    }
	  }
	}
  let Previous = null 
  let hist = history.value.filter((entry,index) => {  if (!entry.hidden) Previous=index; return(!entry.hidden)});
  hist = hist.map(entry=>{return {role: entry.role, parts:entry.parts}}); 
  let lastchat = hist.length; console.log('last ' + lastchat)
  busy.value=true
  const chatWithAI = createChat(API_KEY,hist,sysRole,params);//gemini appends history to 'hist'
  const error  = await chatWithAI(prompt,destination)
  //const response = [...history.value,{"role": "user", "parts": [{"text": prompt}]},{"role": "model", "parts": [{"text": result.response.text()}]}];
  //console.log(history.value)
  if (error !== false) {
	  busy.value=false
	  return error;
	}
  if (destination) return false;
  let newchat = (history.value.length==0)
  let newhist = [...(hist.slice(lastchat))]
  if (Previous) Previous -= 1 //otherwise it is null, a new chat
  newhist = newhist.map(elem => { elem.parent=Previous; return (elem)})
  history.value = [...history.value,...newhist]
  if (newchat) newChatName(prompt,__pwidget);
  busy.value=false
  //return response
  return false
}
// there needs to be away to initialise with role and history

