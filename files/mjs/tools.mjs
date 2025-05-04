/*\
title: $:/plugins/bj/simplifai/tools.mjs
type: application/javascript
module-type: library
\*/

//although this module could be removed, I will leave it in case I change to a signal
export async function getTools(tooltid) {
	let toolsModule = tooltid
    return await import (`${toolsModule}`)
}