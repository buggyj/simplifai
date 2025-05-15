/*\
title: $:/plugins/bj/simplifai/gemini.mjs
type: application/javascript
module-type: library
\*/
const {DynamicRetrievalMode, GoogleGenerativeAI} = await import('https://esm.run/@google/generative-ai') 

const {signal} = await import ("$:/plugins/bj/unchane/preactsignal.mjs")
const {getTools} = await import('$:/plugins/bj/simplifai/tools.mjs')
const {newChatName} = await import('$:/plugins/bj/simplifai/naming.mjs')

const { MODEL_NAME, API_KEY, safetySettings} = await import("$:/plugins/bj/simplifai/setting.mjs");
export const busy = signal (false)
export const Search = signal(false)

export async function runChat(prompt,history,sysRole,toolset,params,prefixes,aModel,__pwidget,addtools,addsystool,destination) {
    let tools,toolHandler;
    if (addtools){
		const api = await getTools(toolset);
		({tools,toolHandler} = api);
		  console.log (tools)
	}
	function createChat(apiKey, history, sysRole, aParams, aModel, buget) {
	  const modelparams = { 
		 model: aModel, 
		 systemInstruction: {
		  parts: [
			{text: sysRole}
		  ]
		},
	  }
	  let params = aParams;
	  if (buget !==null) params.thinkingConfig = { thinkingBudget: buget }
	  let alltools =[];
	  if (addtools) alltools = tools;//app tool 
	  if (addsystool) alltools.push ({googleSearch: {}})
	  if (addtools||addsystool)  modelparams.tools = alltools;
	  
	  
	  const genAI = new GoogleGenerativeAI(apiKey);
	  const model = genAI.getGenerativeModel(modelparams); 
      
    const chatsetup = {
      history,
      safetySettings,
      generationConfig: params
    } 
	//if (addtools) chatsetup.tools = tools;
	console.log(params)
	const chat = model.startChat(chatsetup);
	//-------------------------------------
    return async function send(message, destination){
	  let responses =[], responseText
      try {
        let result = await chat.sendMessage(message,{
				  timeout: 120000 // Pass the abort signal here
				});
        console.log(result)
        responseText = result.response.text();
        let  functionCalls =  result.response.functionCalls()
        // Check for function calls
        if (functionCalls && functionCalls.length > 0) {
		  
          for (const functionCall of functionCalls) {
            const { name, args } = functionCall;
            console.log(`Function called: ${name} with args:`, args);
            
            // Execute the function
            const fResponse = await toolHandler[name](args,prefixes,__pwidget);
            responses.push({
              functionResponse: {
                name: name,
                response: fResponse
              }
            })
          }
		}
      } catch (error) {
		  console.log(error)
        console.error("Error sending message:", error);
        return error;
      }
       if (responses.length > 0) await send (responses) 
      		 // Send function response back to the model
		//const functionResponseResult = await chat.sendMessage(responses);
		// Update response text with function call result
		//responseText = functionResponseResult.response.text();
        
		//immediate (one-off) question - should not call function BJ guru mediation -maybe??
        if (destination) destination.title = responseText;
        return false;
    };
;
	}
	
  function splitModel(str) {
	  const index = str.lastIndexOf('::');
	  if (index === -1) return [str]; // '::' not found
	  return [str.slice(0, index), str.slice(index + 2)];
  }
console.log(aModel," model")
  let buget = null;
  let modelParts = splitModel(aModel)
  if (modelParts.length === 2) {buget=modelParts[1]}
  let Previous = null 
  //filter out hidden responses (and questions)
  let hist = history.value.filter((entry,index) => {  if (!entry.hidden) Previous=index; return(!entry.hidden)});
  //Previous now contains index (within history) of last active response 
  if (Search.value) hist = hist.filter((entry,index) => {  if ("model"===entry.role && entry.parts.some(part => part.functionCall)) {return false}; return true});
  if (Search.value) hist = hist.filter((entry,index) => {  if ("function"===entry.role) {return false}; return true});
  hist = hist.map(entry=>{return {role: entry.role, parts:entry.parts}}); 
  let lastchat = hist.length; 
  busy.value = true
  const chatWithAI = createChat(API_KEY,hist,sysRole,params,modelParts[0],buget);//gemini appends history to 'hist'
  /* the Abort controller seems to return in a promise context and that causes the popup not to work
   * I have changed to a timeout, but I will leave this here in case I want to add a abort button 
   * to the app
  const controller = new AbortController();
  const timeoutSignal = AbortSignal.timeout(3000);
  const combinedSignal = AbortSignal.any([controller.signal, timeoutSignal]);
  
  const error  = await chatWithAI(prompt,destination,combinedSignal)
*/
  const error  = await chatWithAI(prompt,destination,null)
  
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
  if (newchat) newChatName(prompt);
  busy.value=false
  //return response
  return false
}

