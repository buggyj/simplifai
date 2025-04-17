/*\
title: $:/plugins/bj/simplifai/tables.mjs
type: application/javascript
module-type: library
\*/
const { signal, useComputed, useSignal, render,html} =  await import ("$:/plugins/bj/unchane/preactsignal.mjs")

const {parseStringArray,stringifyList} = await import ("$:/plugins/bj/unchane/storeutils.js")
const {init} = await import ("$:/plugins/bj/unchane/towidget.mjs")

function mssg(tid,sendmessage) {sendmessage({$message:"tm-modal", $param:"$:/plugins/bj/simplifai/edittagfile", title:"edit", message:tid})}
function mssgClose(sendmessage){sendmessage({$message:"tm-close-tiddler"})}
export function tables({ hashtagData, selectedHashtags, __pwidget }) {
	const {sendmessage} = init(__pwidget)
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
        <div key=${categoryName}>
          <h3 	style="color:blue;cursor: pointer;" 
				onclick=${() => {mssg(categoryName,sendmessage);mssgClose(sendmessage)}} 
				title="edit tags"
		   >
		     ${categoryData.name}
		   </h3>
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
