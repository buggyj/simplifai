/*\
title: $:/plugins/bj/simplifai/claude.mjs
type: application/javascript
module-type: library
\*/
const {Anthropic} = await import('https://esm.run/@anthropic-ai/sdk')

const {signal} = await import ("$:/plugins/bj/unchane/preactsignal.mjs")
const {getTools} = await import('$:/plugins/bj/simplifai/tools.mjs')
const {newChatName} = await import('$:/plugins/bj/simplifai/naming.mjs')

const {API_KEY} = await import("$:/plugins/bj/simplifai/setting.mjs");
export const {busy,Search} = await import ("$:/plugins/bj/simplifai/signals.mjs")



export async function runChat(prompt, history, sysRole, toolset, params, prefixes, aModel, __pwidget, addtools, addsystool, destination) {
    let tools, toolHandler;
    if (addtools) {
        const api = await getTools(toolset);
        ({tools, toolHandler} = api);
        console.log(tools)
    }
    
    // Helper function to convert history format from Gemini to Anthropic
    function convertHistoryToAnthropicFormat(history) {
        return history.map(entry => {
            if (entry.role === "model") {
                return {
                    role: "assistant",
                    content: entry.parts.map(part => {
                        if (part.text) return part.text;
                        if (part.functionCall) {
                            return {
                                type: "tool_use",
                                tool_use: {
                                    name: part.functionCall.name,
                                    input: JSON.stringify(part.functionCall.args)
                                }
                            };
                        }
                        return "";
                    }).join("")
                };
            } else if (entry.role === "user") {
                return {
                    role: "user",
                    content: entry.parts.map(part => part.text || "").join("")
                };
            } else if (entry.role === "function") {
                return {
                    role: "user",
                    content: entry.parts.map(part => part.text || "").join(""),
                    name: entry.name
                };
            }
            return null;
        }).filter(entry => entry !== null);
    }

    function createChat(apiKey, convertedHistory, sysRole, aParams, aModel, budget) {
        const anthropic = new Anthropic({
            apiKey: apiKey,dangerouslyAllowBrowser: true
        });
        
        // Initialize configuration
        const modelparams = {
            model: aModel,
            system: sysRole,
        };
        
        let alltools = [];
        if (addtools) alltools = convertToolsToAnthropicFormat(tools[0].functionDeclarations); // Convert tools to Anthropic format
        if (addsystool) alltools.push(createAnthropicSearchTool()); // Add search tool in Anthropic format
        console.log(alltools)
        // Add tools to parameters if needed
        if (alltools.length > 0) {
            modelparams.tools = alltools;
        }
        
        // Add additional parameters
        if (params.temperature) modelparams.temperature = params.temperature;
        if (params.maxOutputTokens) modelparams.max_tokens = params.maxOutputTokens;
        if (params.topP) modelparams.top_p = params.topP;
        if (params.topK) modelparams.top_k = params.topK;
        if (budget !== null) modelparams.thinking_budget = parseFloat(budget);
        
        // Return a function that handles sending messages to Claude
        return async function send(message, destination) {
            let responses = [], responseText;
            try {
                // Prepare messages for the API call
                const messages = [...convertedHistory];
                
                // Handle different message types
                if (typeof message === 'string') {
                    // Simple text message
                    const userMessage = { role: "user", content: message };
                    messages.push(userMessage);
                    convertedHistory.push(userMessage); // Update the convertedHistory
                } else if (Array.isArray(message)) {
                    // Function responses
                    for (const funcResponse of message) {
                        if (funcResponse.functionResponse) {
                            const toolMessage = {
                                role: "user",
                                content:[{
									content: funcResponse.functionResponse.response.text,
									"tool_use_id":funcResponse.functionResponse.id,
									type:"tool_result"
								}]

                            };
                            messages.push(toolMessage);
                            convertedHistory.push(toolMessage); 
                        }
                    }
                }
                
               
                const result = await anthropic.messages.create({
                    ...modelparams,
                    messages: messages,
                    max_tokens: 8192
                });
                
                console.log(result);
                responseText = extractTextFromAnthropicResponse(result);
                
                // Create assistant message and add to convertedHistory
                const assistantMessage = {
                    role: "assistant",
                    content: responseText
                };
                convertedHistory.push(assistantMessage);
                
                // Handle tool calls (Anthropic equivalent of function calls)
                if (result.content && result.content.some(item => item.type === 'tool_use')) {
                    const toolCalls = result.content.filter(item => item.type === 'tool_use');
                    
                    
                    for (const toolCall of toolCalls) {
                        const { name, input,id } = toolCall;
                        console.log(`Tool called: ${name} with args:`, input);
                        convertedHistory.push({
                                role: "assistant",
                                content: [
                                    {
                                        type: "tool_use",
                                        id: toolCall.id,
                                        name: toolCall.name,
                                        input: toolCall.input
                                    }
                                ]
                            });
                        // Execute the tool function
                        const toolResponse = await toolHandler[name](input, prefixes,"claude", __pwidget);
                        responses.push({
                            functionResponse: {
                                name: name,
                                id,id,
                                response: toolResponse
                            }
                        });
                    }
                }
            } catch (error) {
                console.log(error);
                console.error("Error sending message:", error);
                return error;
            }
            
            if (responses.length > 0) await send(responses);
            
            if (destination) destination.title = responseText;
            return false;
        };
    }
    
    function convertHistoryToAnthropicFormat(history) {
        return history.map(entry => {
            if (entry.role === "model") {
                let current = {
                    role: "assistant",
                    content: entry.parts.map(part => {
                        if (part.text) return part.text;
                        if (part.functionCall) {
                            return "";
                            /*{
                                type: "tool_use",
                                tool_use: {
                                    name: part.functionCall.name,
                                    input: part.functionCall.args
                                }
                            };*/
                        }
                        return "";
                    }).join("")
                };
                if (current.content === "") return null;
                return current;
            } else if (entry.role === "user") {
                return {
                    role: "user",
                    content: entry.parts.map(part => part.text || "").join("")
                };
            } else if (entry.role === "function") {
                return null;/*{
                    role: "user",
                    content: entry.parts.map(part => part.text || "").join(""),
                    name: entry.name
                };*/
            }
            return null;
        }).filter(entry => entry !== null);
    }
    
    function convertToolsToAnthropicFormat(tools) {
        return tools.map(tool => {
            
            return {
                name: tool.name,
                description: tool.description,
                input_schema: tool.parameters
            };
        });
    }
    

    
    function createAnthropicSearchTool() {
        return {
            name: "googleSearch",
            description: "Search the web for information",
            input_schema: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query"
                    }
                },
                required: ["query"]
            }
        };
    }
    
    function extractTextFromAnthropicResponse(response) {
        if (!response.content) return "";
        
        return response.content
            .filter(item => item.type === 'text')
            .map(item => item.text)
            .join("");
    }
    
    function convertAnthropicToGeminiFormat(anthHistory) {
        return anthHistory.map(entry => {
            if (entry.role === "assistant") {
                const parts = [];
                if (typeof entry.content === 'string') {
                    parts.push({ text: entry.content });
                } else
                // Handle tool calls if present
                if (entry.content[0].type ="tool_use") {
                        parts.push({
                            functionCall: {
                                name: entry.content[0].name,
                                args: entry.content[0].input
                            }
                        });
                }
                return { role: "model", parts };
            } else if (entry.role === "user") {
				if (typeof entry.content === 'string') {
					return {
						role: "user",
						parts: [{ text: entry.content }]
					};
				} else return {	
					role:"function",
					parts: [{
					"functionResponse": {
					  "name": "notknown",
					  "response": {
						"status": "success",
						"text": entry.content[0].content
					  }
					}
				  }]
				}
            } 
            return null;
        }).filter(entry => entry !== null);
    }

    // Parse model name and budget
    let [modelName, budget] = [aModel,null];
    
    // Keep track of the last active response
    let Previous = null;
    
    // Filter out hidden responses and questions
    let hist = history.value.filter((entry, index) => {
        if (!entry.hidden) Previous = index;
        return (!entry.hidden);
    });
    
    if (Search.value) {
        hist = hist.filter((entry, index) => {
            if ("model" === entry.role && entry.parts.some(part => part.functionCall)) {
                return false;
            }
            return true;
        });
    }
    
    if (Search.value) {
        hist = hist.filter((entry, index) => {
            if ("function" === entry.role) {
                return false;
            }
            return true;
        });
    }
    
    // Map history entries to the required format
    hist = hist.map(entry => {
        return { role: entry.role, parts: entry.parts };
    });
    
    // Convert history to Anthropic format before creating the chat
    const convertedHistory = convertHistoryToAnthropicFormat(hist);
    
    let lastchat = convertedHistory.length;
    busy.value = true;
    
    const chatWithAI = createChat(API_KEY, convertedHistory, sysRole, params, modelName, budget);
    
    // Send message and handle response
    const error = await chatWithAI(prompt, destination, null);
    
    if (error !== false) {
        busy.value = false;
        return error;
    }

    if (destination) return false; // Don't add to history
    
    let newchat = (history.value.length == 0);
    
    // Convert the updated convertedHistory back to Gemini format for the new history entries
    // We only want the new entries that were added during this conversation
    const geminiFormatHistory = convertAnthropicToGeminiFormat(convertedHistory.slice(lastchat));
    
    // Add parent references to new history entries
    const newhist = geminiFormatHistory.map(elem => {
        elem.parent = Previous;
        return elem;
    });
    
    history.value = [...history.value, ...newhist];
    if (newchat) newChatName(prompt);
    busy.value = false;
    
    return false;
    

}