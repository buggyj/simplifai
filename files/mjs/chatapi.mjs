/*\
title: $:/plugins/bj/simplifai/chatapi.mjs
type: application/javascript
module-type: library
\*/

export class OpenAI {
  constructor({ baseURL = "https://api.openai.com", apiKey = "" } = {}) {
    this.baseURL = baseURL.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.chat = {
      completions: {
        create: (params) => this._chatComplete(params)
      }
    };
  }

  async _chatComplete({ model, messages, temperature, max_tokens, ...rest }) {
    const base = this.baseURL.replace(/\/v1$/, "");
    const response = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { "Authorization": `Bearer ${this.apiKey}` } : {})
      },
      body: JSON.stringify({
        model,
        messages,
        ...(temperature !== undefined ? { temperature } : {}),
        ...(max_tokens !== undefined ? { max_tokens } : {}),
        ...rest,
        stream: false
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

