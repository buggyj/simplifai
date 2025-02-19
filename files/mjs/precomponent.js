<script>
class MyPre extends HTMLElement {
  constructor() {
	super();
	this.attachShadow({ mode: "open" });

	this.shadowRoot.innerHTML = `
	  <style>
		:host {
		  display: block;
		  position: relative;
		  font-family: monospace;
		}

		pre {
		  background: #f4f4f4;
		  padding: 10px;
		  border-radius: 5px;
		  white-space: pre-wrap;
		  position: relative;
		}

		.copy-btn {
		  position: absolute;
		  top: 5px;
		  right: 5px;
		  background: #4CAF50;
		  color: white;
		  border: none;
		  padding: 5px 10px;
		  font-size: 12px;
		  cursor: pointer;
		  border-radius: 5px;
		}

		.copy-btn:hover {
		  background: #45a049;
		}
	  </style>
	  <div><slot></slot></div>
	  <button class="copy-btn">Copy</button>
	`;
  }

  connectedCallback() {
	this.shadowRoot.querySelector(".copy-btn").addEventListener("click", () => this.copyToClipboard());
  }

  copyToClipboard() {
	const text = this.innerText.trim(); // Get the content inside <my-pre>
	navigator.clipboard.writeText(text).then(() => {
	  const btn = this.shadowRoot.querySelector(".copy-btn");
	  btn.textContent = "Copied!";
	  setTimeout(() => (btn.textContent = "Copy"), 1500);
	}).catch(err => console.error("Copy failed", err));
  }
}

customElements.define("my-pre", MyPre);
</script>
