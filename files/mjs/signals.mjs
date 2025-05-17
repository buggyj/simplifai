/*\
title: $:/plugins/bj/simplifai/signals.mjs
type: application/javascript
module-type: library
\*/

const {signal} = await import ("$:/plugins/bj/unchane/preactsignal.mjs")

export const busy = signal(false);

export const Search = signal(false)

export const aiType = signal("gemini");
