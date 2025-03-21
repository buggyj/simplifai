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
        description: "Get the contents of specific tiddler",
        parameters: {
          type: "OBJECT",
          properties: {
            title: {
              type: "STRING",
              description: "title of the tiddler to read"
            }
          },
          required: ["title"]
        }
      },
      {
        name: "writeTiddler",
        description: "Modify an existing specific tiddler",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { 
              type: "STRING", 
              description: "The title of the tiddler" 
            },
            content: { 
              type: "STRING", 
              description: "The text content of the tiddler to write" 
            }                
          },
          required: ["title"]
        }
	  },
      {
        name: "createTiddler",
        description: "create a tiddler by copying a template tiddler",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { 
              type: "STRING", 
              description: "The title of the tiddler" 
            },
            template: { 
              type: "STRING", 
              description: "The title of the template tiddler" 
            }                
          },
          required: ["title", "template"]
        }
      }
    ]
  }
];

export const toolHandler = {
	readTiddler: async ({title}) => {
		try {
		console.log(title)//console.log(`reading: ${title}`);
		  return {text:getTextReference(`${title}!!text`)}

		} catch (error) {
		  console.error("Error fetching tiddler: "+ error);
		  return { error: `Failed to find tiddler ${title}` };
		}
	},
	writeTiddler: async ({title, content}) => {
		try {
			console.log(`writing: ${title}`);
			setTextReference(`${title}!!text`, content);
			return {
			  success: true,
			  message: `Successfully updated tiddler "${title}"`,
			  tiddler: {
				title: title
			  }
			};
		} catch (error) {
		console.error("Error writing tiddler: " + error);
		return { error: `Failed to write tiddler ${title}` };
		}
	},
	createTiddler: async ({title, template}) => {
		try {
			console.log(`creating: ${title}`);
			createtiddler({$basetitle:title,$template:template});
			return {
			  success: true,
			  message: `Successfully created tiddler "${title}"`,
			  tiddler: {
				title: title
			  }
			};
		} catch (error) {
		console.error("Error writing tiddler: " + error);
		return { error: `Failed to create tiddler ${title}` };
		}
	}
};

    


