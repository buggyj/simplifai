/*\
title: $:/plugins/bj/aiclone/setting.mjs
type: application/javascript
module-type: library
\*/
const {signal} = await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs")
const {HarmCategory, HarmBlockThreshold} = await import('https://esm.run/@google/generative-ai') 
const key = "";

export const MODEL_NAME = "gemini-1.5-pro";
export const API_KEY = signal(key);
export const useHistLen = 10;
export const safetySettings = [
	  {
	    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
	    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
	  },
	  {
	    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
	    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
	  }
	]
	
export const generationConfig = {
	  temperature: 0.9,
	  topK: 1,
	  topP: 1,
	  maxOutputTokens: 2048,
	}
