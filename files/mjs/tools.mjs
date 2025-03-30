/*\
title: $:/plugins/bj/simplifai/tools.mjs
type: application/javascript
module-type: library
\*/

const {getTextReference,setTextReference} = await import('$:/plugins/bj/unchane/store.js')
const {createtiddler} = await import ("$:/plugins/bj/unchane/utils.mjs");
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
        description: "Write to an existing tiddler",
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
          required: ["title", "template"]
        }
      }
    ]
  }
];
function getFileExtension(urlOrPath) {
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

  return lastPart;
}
export const toolHandler = {
	readTiddler: async ({title}) => {
		try {
		console.log(`read ${title}`)//console.log(`reading: ${title}`);
		  return {status: "success",text:getTextReference(`${title}!!text`)}

		} catch (error) {
		  console.error("Error fetching tiddler: "+ error);
		  return { status:"error",error: `Failed to find tiddler ${title}` };
		}
	},
	writeTiddler: async ({title, text }) => {
		try {
            let fext, exists = getTextReference(`${title}!!text`,null)
            //create if not existing with file extension template
            if (exists === null) {
			  await toolHandler.createTiddler({title,template:""})
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
	createTiddler: async ({title, template}) => {
		try {
			let fext, templ = template
			if (template==="") {
				fext = getFileExtension(title)
				if (fext === "mjs") templ = "template.mjs"
			}
			console.log(`creating: ${title} with template ${tmpl}`);
			createtiddler({$basetitle:title,$template:template});
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
	}
};

    


