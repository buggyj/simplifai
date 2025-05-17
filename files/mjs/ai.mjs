/*\
title: $:/plugins/bj/simplifai/ai.mjs
type: application/javascript
module-type: library
\*/
const {signal,computed} = await import ("$:/plugins/bj/unchane/preactsignal.mjs")
const {runChat:geminiRunChat,Search:geminiSearch} = await import ("$:/plugins/bj/simplifai/gemini.mjs")
const {runChat:claudeRunChat,Search:cluadeSearch} = await import ("$:/plugins/bj/simplifai/claude.mjs")
export const {busy,Search,aiType} = await import ("$:/plugins/bj/simplifai/signals.mjs")


export function runChat(...args) {
  if (aiType.value === 'gemini') return geminiRunChat(...args);
  return claudeRunChat(...args);
}


