/*\
title: $:/plugins/bj/simplifai/tools.mjs
type: application/javascript
module-type: library
\*/

const {getTextReference,setTextReference} = await import('$:/plugins/bj/unchane/store.js')
const {createtiddler} = await import ("$:/plugins/bj/unchane/utils.mjs");
const {parseStringArray} = await import ("$:/plugins/bj/unchane/storeutils.js")

export const tools = [

  {
    functionDeclarations: [
      {
        name: "readTiddler",
        description: "Read the contents of tiddler",
        parameters: {
          type: "OBJECT",
          properties: {
            title: {
              type: "STRING",
              description: "name of the tiddler to read"
            }
          },
          required: ["title"]
        }
      },
      {
        name: "writeTiddler",
        description: "Write to a existing tiddler or a new tiddler",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { 
              type: "STRING", 
              description: "name of the tiddler" 
            },
            text: { 
              type: "STRING", 
              description: "The text the tiddler to write" 
            }                
          },
          required: ["title", "text"]
        }
	  },
      {
        name: "createTiddler",
        description: "create a tiddler using a template",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { 
              type: "STRING", 
              description: "The name of the tiddler" 
            },
            template: { 
              type: "STRING", 
              description: "The name of the template" 
            }                
          },
          required: ["title"]
        }
      },
      {
        name: "launchTiddler",
        description: "opens a tiddler within the tiddlywiki",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { 
              type: "STRING", 
              description: "The name of the tiddler" 
            }              
          },
          required: ["title"]
        }
      }
    ]
  }
];

function prefix(str, prefixeslist) {
  if (prefixeslist === null) return true; 
  let prefixes = parseStringArray(prefixeslist);
  for (let i = 0; i < prefixes.length; i++) {
    if (str.startsWith(prefixes[i])) {
      return true;
    }
  }
  return false;
}

function getTemplate(urlOrPath) {
  let tmpl = null;

  if (!urlOrPath) {
    return null;
  }

  const parts = urlOrPath.split('.');
  if (parts.length <= 1) {
    return null; // No dot, no extension
  }

  const lastPart = parts.pop();
  if (!lastPart) {
    return null; // Trailing dot
  }

  // Check if the last part contains a path separator (e.g., / or \)
  if (lastPart.includes('/') || lastPart.includes('\\')) {
    return null; // It's part of the path, not an extension
  }
  if (lastPart === "mjs") tmpl = "$:/plugins/bj/simplifai/template.mjs"
  return tmpl ;
}
export const toolHandler = {
	readTiddler: async ({title},pfix) => {
		if (!prefix(title,pfix.read)) return{ status:"error",error: `Failed to read tiddler ${title}`};
		try {
		console.log(`read ${title}`)//console.log(`reading: ${title}`);
		  return {status: "success",text:getTextReference(`${title}!!text`)}

		} catch (error) {
		  console.error("Error fetching tiddler: "+ error);
		  return { status:"error",error: `Failed to find tiddler ${title}` };
		}
	},
	writeTiddler: async ({title, text },pfix) => {console.log(`writing`);
		if (!prefix(title,pfix.write)) return{ status:"error",error: `Failed to write tiddler ${title}`};
		try {
            let fext, exists = getTextReference(`${title}!!text`,null)
            //create if not existing with file extension template
            if (exists === null) {
			  await toolHandler.createTiddler({title,template:""},pfix)
            }
			console.log(`writing: ${title}, with ${text}`);
			setTextReference(`${title}!!text`, text);
			return {
			  status: "success",
			  message: `Successfully updated tiddler "${title}"`,
			  tiddler: {
				title: title
			  }
			};
		} catch (error) {
		console.error("Error writing tiddler: " + error);
		return { status:"error", error: `Failed to write tiddler ${title}` };
		}
	},
	createTiddler: async ({title, template},pfix) => { console.log(`creating`);
		if (!prefix(title,pfix.write)) return {status:"error",error: `Failed to create tiddler ${title}`};
		try {
			let fext, templ = template
			if (!templ) {
				templ = getTemplate(title)
			}
			console.log(`creating: ${title} with template ${templ}`);
			createtiddler({$basetitle:title,$template:templ});
			return {
			  status: "success",
			  message: `Successfully created tiddler "${title}"`,
			  tiddler: {
				title: title
			  }
			};
		} catch (error) {
		console.error("Error writing tiddler: " + error);
		return {status:"error", error: `Failed to create tiddler ${title}` };
		}
	},
	launchTiddler: async ({title},notused,__pwidget) => {
		try {
		console.log(`launch ${title}`)//console.log(`reading: ${title}`);
		__pwidget.dispatchEvent({type: 'tm-navigate', navigateTo: title});
		  return {status: "success"}

		} catch (error) {
		  console.error("Error fetching tiddler: "+ error);
		  return { status:"error",error: `Failed to find tiddler ${title}` };
		}
	}
};

    


