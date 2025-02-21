/*\
title: $:/plugins/bj/simplifai/tables.mjs
type: application/javascript
module-type: library
\*/
 const { signal, useComputed, useSignal, render,html} =  await import ("$:/plugins/bj/tiddlywiki-preact/preactsignal.mjs")

const {parseStringArray,stringifyList} = await import ("$:/plugins/bj/tiddlywiki-preact/storeutils.js")

export function tables({ hashtagData, selectedHashtags }) {

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
      <h2>Hashtags</h2>
      ${Object.entries(hashtagData).map(([categoryName, categoryData], index) => html`
        <div key=${categoryName}>
          <h3>${categoryName}</h3>
          <table>
            <tbody>
              ${Object.entries(categoryData).map(([subcategoryName, hashtags]) => html`
                <tr key=${subcategoryName}>
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