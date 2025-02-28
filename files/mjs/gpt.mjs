/*\
title: $:/plugins/bj/simplifai/gpt.mjs
type: application/javascript
module-type: library
\*/
 
 const { signal } = await import ("$:/plugins/bj/unchane/preactsignal.mjs");
const { API_KEY } = await import("$:/plugins/bj/simplifai/setting.mjs");

export async function runChat(prompt, history) {
    function createChat(apiKey, history) {
        return async (message) => {
            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "gpt-3.5-turbo", // or gpt-3.5-turbo
                        messages: [...history, { role: "user", content: message }],
                    })
                });
                                
                if (!response.ok) {
                    if (response.status === 403) {
                        throw new Error("403 Forbidden: Invalid API key or insufficient permissions.");
                    } else if (response.status === 401) {
                        throw new Error("401 Unauthorized: Check your API key.");
                    } else if (response.status === 429) {
                        throw new Error("429 Too Many Requests: Rate limit exceeded.");
                    } else {
                        throw new Error(`Error ${response.status}: ${response.statusText}`);
                    }
                }
                
                const data = await response.json();
                return data.choices[0].message.content;
            } catch (error) {
                console.error("Error sending message:", error);
                return "*****chatbot failed to respond*******";
            }
        }
    }

    var hist = [...history.value];
    const chatWithAI = createChat(API_KEY, hist);
    const response = await chatWithAI(prompt);
    history.value = [...hist, { role: "user", content: prompt }, { role: "assistant", content: response }];
    return response;
}
