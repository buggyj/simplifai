/*\
title: $:/plugins/bj/aiclone/gemini.mjs
type: application/javascript
module-type: library
\*/
const {GoogleGenerativeAI} = await import('https://esm.run/@google/generative-ai') 

const {signal} = await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs")
const {init} = await import ("$:/plugins/bj/tiddlywiki-preact/towidget.mjs")

const { MODEL_NAME, API_KEY, safetySettings ,generationConfig} = await import("$:/plugins/bj/aiclone/setting.mjs");

export async function runChat(prompt,history,__pwidget) {
    const {invokeActionString} = init(__pwidget)
    const makeTitle= function(prompt) {
        if (!prompt.length) return "New Chat";
        let title = "";
        let words = prompt.match(/\b\w{1,}\b/g) || []; 
        for (let word of words) {
            if ((title + " " + word).trim().length > 40) break;
            title = (title + " " + word).trim();
        }
        return title.length ? title.charAt(0).toUpperCase() + title.slice(1) : "New Chat";
    }
       
     const doNewChat = function(prompt) {
             let title = makeTitle(prompt)
             // create a unique title from the returned title
             // by checking if title exist and if so appending a number
            invokeActionString(`<$action-sendmessage $message="tm-rename-tiddler" from="$:/temp/bj/newChat" to="""${title}""" renameInTags="no" renameInLists="no"/>`)
             // rename $:/temp/bj/newChat to the title
             invokeActionString(`<$action-setfield $tiddler="$:/temp/bj/aiclone/CurrentGeminiChat" text="""${title}"""/>`)
     }
	function createChat(apiKey, history) {
	
	  const genAI = new GoogleGenerativeAI(apiKey);
	
	  const model = genAI.getGenerativeModel({ 
		  model: MODEL_NAME 
		  //systemInstructionparts: [{ text: "" }],	role:"model"] - Maybe add later
	  }); 
      
	  const chat = model.startChat({
	    history,
	    safetySettings,
	    generationConfig
	  });

	  return async (message) => {
	    try {
	      const result = await chat.sendMessage(message);
	      const response =  result.response;
	      return response.text();
	    } catch (error) {
	      console.error("Error sending message:", error);
	      return "*****chatbot failed to respond*******";
	    }
	  }
	}

var hist = [...history.value]

  const chatWithAI = createChat(API_KEY,hist );//gemini appends history to 'hist'
  const response  = await chatWithAI(prompt)
  //const response = [...history.value,{"role": "user", "parts": [{"text": prompt}]},{"role": "model", "parts": [{"text": result.response.text()}]}];
  //console.log(history.value)
  let newchat = (history.value.length==0)
  history.value = hist
  if (newchat) doNewChat(prompt);
  //return response
  
}
// there needs to be away to initialise with role and history

