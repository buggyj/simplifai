/*\
title: $:/plugins/bj/simplifai/gpt.mjs
type: application/javascript
module-type: library
\*/
//import OpenAI from 'https://esm.run/openai';
const {OpenAI} = await import("$:/plugins/bj/simplifai/chatapi.mjs")
//const {OpenAI} = await import("https://cdn.jsdelivr.net/npm/groq-sdk/+esm")
console.log('OpenAI',OpenAI)

const {signal} = await import("$:/plugins/bj/unchane/preactsignal.mjs")
const {getTools} = await import('$:/plugins/bj/simplifai/tools.mjs')
const {newChatName} = await import('$:/plugins/bj/simplifai/naming.mjs')

const {API_KEY} = await import("$:/plugins/bj/simplifai/setting.mjs");
export const {busy, Search} = await import("$:/plugins/bj/simplifai/signals.mjs")

const {openType} = await import ("$:/plugins/bj/simplifai/signals.mjs")

export async function runChat(prompt, history, sysRole, toolset, params, prefixes, aModel, __pwidget, addtools, addsystool, destination) {
    let tools, toolHandler;
    if (addtools) {
        const api = await getTools(toolset);
        ({tools, toolHandler} = api);
        console.log(tools);
    }

    // Convert Gemini-format history to OpenAI format
    function convertHistoryToOpenAIFormat(history) {
        return history.map(entry => {
            if (entry.role === "model") {
                const content = entry.parts
                    .map(part => (part.text ? part.text : ""))
                    .join("");
                if (!content) return null;
                return { role: "assistant", content };
            } else if (entry.role === "user") {
                return {
                    role: "user",
                    content: entry.parts.map(part => part.text || "").join("")
                };
            } else if (entry.role === "function") {
                // Skip legacy function entries
                return null;
            }
            return null;
        }).filter(entry => entry !== null);
    }

    function convertToolsToOpenAIFormat(toolDeclarations) {
        return toolDeclarations.map(tool => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters
            }
        }));
    }

    function createOpenAISearchTool() {
        return {
            type: "function",
            function: {
                name: "googleSearch",
                description: "Search the web for information",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query"
                        }
                    },
                    required: ["query"]
                }
            }
        };
    }

    function createChat(apiKeyVal, convertedHistory, sysRole, params, aModel) {
		const openvals = {
            apiKey: apiKeyVal.value,
            dangerouslyAllowBrowser: true
        }
        console.log ('openType.value',openType.value);
		if (openType.value === 'groq') {
			openvals.baseURL = "https://api.groq.com/openai/v1";
			//openvals["reasoning_format"] =  "hidden";
			 openvals.stream = false;
		}
		const openai = new OpenAI(openvals);
        // Build request params
        const modelparams = {
            model: aModel,
           "reasoning_format":"parsed"
        };

        // System message prepended to messages array (OpenAI style)
        const systemMessage = { role: "system", content: sysRole };

        // Build tools list
        let alltools = [];
        if (addtools) alltools = convertToolsToOpenAIFormat(tools[0].functionDeclarations);
        if (addsystool) alltools.push(createOpenAISearchTool());
        console.log(alltools);

        if (alltools.length > 0) modelparams.tools = alltools;

        if (params.temperature !== undefined) modelparams.temperature = params.temperature;
        if (params.maxOutputTokens !== undefined) modelparams.max_tokens = params.maxOutputTokens;
        if (params.topP !== undefined) modelparams.top_p = params.topP;
        // Note: OpenAI doesn't support topK natively

        return async function send(message, destination) {
            let responses = [];
            let responseText = "";

            try {
                // Build the messages array
                const messages = [systemMessage, ...convertedHistory];

                if (typeof message === 'string') {
                    const userMessage = { role: "user", content: message };
                    messages.push(userMessage);
                    convertedHistory.push(userMessage);
                } else if (Array.isArray(message)) {
                    // Tool results — in OpenAI format: role "tool" with tool_call_id
                    for (const funcResponse of message) {
                        if (funcResponse.functionResponse) {
							 const toolMessage = {
							  role: "tool",
							  tool_call_id: funcResponse.functionResponse.id,
							  content:
								typeof funcResponse.functionResponse.response === "string"
								  ? funcResponse.functionResponse.response
								  : JSON.stringify(funcResponse.functionResponse.response ?? {})
							};
                            messages.push(toolMessage);
                            convertedHistory.push(toolMessage);
                        }
                    }
                }

                const result = await openai.chat.completions.create({
                    ...modelparams,
                    messages
                });

                console.log(result);

                const choice = result.choices[0];
                const assistantMessage = choice.message;

                // Extract text content
                responseText = assistantMessage.content || "";

                // Add assistant message (including tool_calls if present) to history
                convertedHistory.push(assistantMessage);

                // Handle tool calls
                if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
                    for (const toolCall of assistantMessage.tool_calls) {
                        const name = toolCall.function.name;
                        const id = toolCall.id;
                        let input;
                        try {
                            input = JSON.parse(toolCall.function.arguments);
                        } catch {
                            input = toolCall.function.arguments;
                        }

                        console.log(`Tool called: ${name} with args:`, input);

                        const toolResponse = await toolHandler[name](input, prefixes, "openai", __pwidget);
                        responses.push({
                            functionResponse: {
                                name,
                                id,
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

    // Convert OpenAI history back to Gemini format (for storage in history.value)
    function convertOpenAIToGeminiFormat(openAIHistory) {
        return openAIHistory.map(entry => {
            if (entry.role === "assistant") {
                const parts = [];

                if (entry.content) parts.push({ text: entry.content });

                if (entry.tool_calls && entry.tool_calls.length > 0) {
                    for (const toolCall of entry.tool_calls) {
                        let args;
                        try {
                            args = JSON.parse(toolCall.function.arguments);
                        } catch {
                            args = toolCall.function.arguments;
                        }
                        parts.push({
                            functionCall: {
                                name: toolCall.function.name,
                                args
                            }
                        });
                    }
                }

                if (parts.length === 0) return null;
                return { role: "model", parts };

            } else if (entry.role === "user") {
                return {
                    role: "user",
                    parts: [{ text: entry.content || "" }]
                };
            } else if (entry.role === "tool") {
                return {
                    role: "function",
                    parts: [{
                        functionResponse: {
                            name: "unknown",
                            response: {
                                status: "success",
                                text: entry.content
                            }
                        }
                    }]
                };
            }
            return null;
        }).filter(entry => entry !== null);
    }

    // Filter history
    let hist = history.value.filter((entry, index) => !entry.hidden);
    let Previous = null;
    history.value.forEach((entry, index) => {
        if (!entry.hidden) Previous = index;
    });

    if (Search.value) {
        hist = hist.filter(entry => {
            if (entry.role === "model" && entry.parts.some(p => p.functionCall)) return false;
            if (entry.role === "function") return false;
            return true;
        });
    }

    hist = hist.map(entry => ({ role: entry.role, parts: entry.parts }));

    const convertedHistory = convertHistoryToOpenAIFormat(hist);
    let lastchat = convertedHistory.length;

    busy.value = true;

    const chatWithAI = createChat(API_KEY, convertedHistory, sysRole, params, aModel);
    const error = await chatWithAI(prompt, destination);

    if (error !== false) {
        busy.value = false;
        return error;
    }

    if (destination) return false;

    let newchat = history.value.length === 0;

    const geminiFormatHistory = convertOpenAIToGeminiFormat(convertedHistory.slice(lastchat));
    const newhist = geminiFormatHistory.map(elem => {
        elem.parent = Previous;
        return elem;
    });

    history.value = [...history.value, ...newhist];
    if (newchat) newChatName(prompt);
    busy.value = false;

    return false;
}