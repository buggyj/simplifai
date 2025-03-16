/*\
title: $:/plugins/bj/simplifai/gemini.mjs
type: application/javascript
module-type: library
\*/
const {GoogleGenerativeAI} = await import('https://esm.run/@google/generative-ai') 

const {signal} = await import ("$:/plugins/bj/unchane/preactsignal.mjs")
const {tools,toolHandler} = await import('$:/plugins/bj/simplifai/tools.mjs')
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
      generationConfig: params,
      tools: tools
    });

    return async (message, destination) => {
      try {
        let result = await chat.sendMessage(message);
        console.log(result)
        let responseText = result.response.text();
        let  functionCalls =  result.response.functionCalls()
        // Check for function calls
        if (functionCalls && functionCalls.length > 0) {
		  let responses =[]
          for (const functionCall of functionCalls) {
            const { name, args } = functionCall;
            console.log(`Function called: ${name} with args:`, args);
            
            // Execute the function
            const fResponse = await toolHandler[name](args);
            responses.push({
              functionResponse: {
                name: name,
                response: fResponse
              }
            })
          }
		 // Send function response back to the model
		const functionResponseResult = await chat.sendMessage(responses);
		// Update response text with function call result
		responseText = functionResponseResult.response.text();
        }

        if (destination) destination.title = responseText;
        return false;
      } catch (error) {
        console.error("Error sending message:", error);
        return error;
      }
    };
	}
  let Previous = null 
  //filter out hidden responses (and questions)
  let hist = history.value.filter((entry,index) => {  if (!entry.hidden) Previous=index; return(!entry.hidden)});
  //Previous now contains index (within history) of last active response 
  hist = hist.map(entry=>{return {role: entry.role, parts:entry.parts}}); 
  let lastchat = hist.length; 
  busy.value = true
  const chatWithAI = createChat(API_KEY,hist,sysRole,params);//gemini appends history to 'hist'
  const error  = await chatWithAI(prompt,destination)

  if (error !== false) {
	  busy.value=false
	  return error;
	}

  if (destination) return false;//don't add to history 
  
  let newchat = (history.value.length==0)
  let newhist = [...(hist.slice(lastchat))]//get the latest chat (question and answer)
  //if (Previous) Previous -= 1 //otherwise it is null, a new chat, -1 as we want the last question no response
  newhist = newhist.map(elem => { elem.parent=Previous; return (elem)})
  history.value = [...history.value,...newhist]
  if (newchat) newChatName(prompt,__pwidget);
  busy.value=false
  //return response
  return false
}

