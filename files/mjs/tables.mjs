/*\
title: $:/plugins/bj/simplifai/tables.mjs
type: application/javascript
module-type: library
\*/
 const { signal, useComputed, useSignal, render,html} =  await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs")

const {parseStringArray,stringifyList} = await import ("$:/plugins/bj/tiddlywiki-preact/storeutils.js")
const {init} = await import ("$:/plugins/bj/tiddlywiki-preact/towidget.mjs")

function mssg(tid) {return `<$action-sendmessage $message="tm-modal" $param="$:/plugins/bj/simplifai/edittagfile" title="edit" message="${tid}"/>`}
function mssgClose(){return `<$action-sendmessage $message="tm-close-tiddler"/>`}
export function tables({ hashtagData, selectedHashtags, __pwidget }) {
	console.log("tables")
	const {dispatchEvent, invokeActionString} = init(__pwidget)
  // Convert string to array
  const selectedHashtagsArray = useComputed(() => {
      return parseStringArray(selectedHashtags.value); 
  });


  const handleHashtagClick = (hashtag) => {
    const isSelected = selectedHashtagsArray.value.includes(hashtag);

    if (isSelected) {
      selectedHashtags.value = stringifyList(selectedHashtagsArray.value.filter((h) => h !== hashtag)); // Update string

    } else {
      selectedHashtags.value = stringifyList([...selectedHashtagsArray.value, hashtag]); 

    }
  };
return html`
    <div>
      ${Object.entries(hashtagData).map(([categoryName, categoryData], index) => html`
        <div key=${categoryName}><br/>
          <h3 style="color:blue;" onclick=${() => {invokeActionString(mssg(categoryName));invokeActionString(mssgClose())}} title=${categoryName}>${categoryData.name}</h3><br/>
          <table style="margin-right:auto;margin-left:0px">
            <tbody>
              ${Object.entries(categoryData.values).map(([subcategoryName, hashtags]) => html`
                <tr key=${subcategoryName} style="text-align: left;">
                  <th>${subcategoryName}:</th>
                  <td>
                    ${(parseStringArray(hashtags)).map((hashtag) => {
                      const isSelected = selectedHashtagsArray.value.includes(hashtag);
                      return html`
                        <button
                          key=${hashtag}
                          style=${{
                            backgroundColor: isSelected ? 'lightgreen' : 'white',
                            marginRight: '5px',
                            padding: '5px',
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                          onClick=${() => handleHashtagClick(hashtag)}
                        >
                          ${hashtag}
                        </button>
                      `;
                    })}
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      `)}

    </div>
  `;
}