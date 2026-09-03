/*\
title: $:/plugins/bj/simplifai/geministub.mjs
type: application/javascript
module-type: library
\*/



export function DynamicRetrievalMode () {}

export class GoogleGenerativeAI {
  constructor({ baseURL = "", apiKey = "" } = {}) {
    this.getGenerativeModel = function (){
      return {startChat:function(){return{sendMessage:function(){throw new Error('on internet')}}}}
    };
  }
}


