/*\
title: $:/plugins/bj/simplifai/setting.mjs
type: application/javascript
module-type: library
\*/
const {signal,computed} = await import ("$:/plugins/bj/unchane/preactsignal.mjs")
const {HarmCategory, HarmBlockThreshold} = await import('https://esm.run/@google/generative-ai') 
export const {aiType} = await import ("$:/plugins/bj/simplifai/signals.mjs")

export const MODEL_NAME = "gemini-2.0-flash";
export const API_KEYS = {claude:signal(""),gemini:signal("")};
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
	  temperature: 0.9
	}
	

export const API_KEY = computed(() =>
  API_KEYS[aiType.value]
);
