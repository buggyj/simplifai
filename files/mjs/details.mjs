/*\
title: $:/plugins/bj/simplifai/details.mjs
type: application/javascript
module-type: library
\*/

const {html} = await import ("$:/plugins/bj/unchane/preactsignal.mjs");

const {ibutton}=await import("$:/plugins/bj/simplifai/iconbutton.mjs")
const marked = await import ("$:/plugins/bj/plugins/marked/markdown.js");


export function start({history}) { 
history = JSON.parse(history)
	return html`
		 ${history.map(
          (message, index) => html`
              <!-- Display User or Bot Icon -->
              ${message.role === "user"
                ? html`	
                <div class="result-title">
	              <${ibutton} name="user_icon" alt="" />
	              <p>${message.parts[0].text}</p>
	            </div>`
                : html` 
                <div class="result-data">
	              <${ibutton} name="gemini_icon" alt="" />
                      ${message.parts.map(
                      (part, i) => html`<p key=${i} dangerouslySetInnerHTML=${{ __html: marked(part.text )}}></p>`)}
	            </div>`
              }`  
          )//history.value.map
       }
  `;
}

