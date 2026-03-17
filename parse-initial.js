async function main() {

    // Load JSON file
    let rawData;
    const rawDataPath = 'Memability.json'; // This is an export from Google Tasks of "tasks" created by the app Memability/Memz.co in the process of backing up my notes.
    try {
        rawData = (await (await fetch(rawDataPath)).json()).items[0].items; // The only index is the Memability data.
    } catch(error) {
        console.error(`"${rawDataPath}" failed to load!`);
    }

    // Clean the data
    /** Recursively parses through the array and constructs a new array without hierarchy, unneeded properties, or mistaken values.
     *  All operations are in-place.
     * @param {Array<object>} oldData
     * @param {Array<object>} newData
     */
    const cleanData = (oldData, newData) => {
        for(let i = 0; i < oldData.length; null) {
            newData.push({
                id: oldData[i].id,
                id_parent: oldData[i].parent,
                timestamp: oldData[i].updated || '2014-12-31T23:59:59.999999Z',
                title: oldData[i].title || 'untitled',
                text: !oldData[i].notes ? '' : oldData[i].notes.replaceAll('\\\n', '\\n').replaceAll('\\\t', '\\t'), // Escaped sequences need to be normalized before display.
            });
            if(oldData[i].items?.length ?? 0 > 0) {
                cleanData(oldData[i].items, newData);
            }
            oldData.splice(i, 1);
        }
    };
    let cleanedData = [];
    cleanData(rawData, cleanedData)
    rawData = null;

    // Parse the data
    /** Recursively parses through the data and constructs a new data with hierarchy.
     *  All operations are in-place.
     * @param {Array<object>} oldData
     * @param {object} newData
     * @param {string} id
     * @param {string} id_parent
     */
    const parseData = (oldData, newData, id_self = undefined, id_parent = undefined) => {
        for(let i = 0; i < oldData.length; i++) {
            if(id_parent !== oldData[i].id_parent) continue;
            if(id_self !== undefined && id_self !== oldData[i].id) continue;
            const id = oldData[i].id;
            const {timestamp, title, text} = oldData[i];
            newData[id] = {timestamp, title, text, child_count: 0, children: {}};
            oldData.splice(i, 1);
            i--;
            for(let j = 0; j < oldData.length; j++) {
                if(id !== oldData[j].id_parent) continue;
                newData[id].child_count++;
                parseData(oldData, newData[id].children, oldData[j].id, oldData[j].id_parent);
                i = j = 0;
            }
            if(newData[id].child_count === 0) {
                delete newData[id].child_count;
                delete newData[id].children;
            }
        }
    };
    let parsedData = {};
    parseData(cleanedData, parsedData);
    cleanedData = null;

    // Display the data
    console.debug(parsedData);
    /** Recursively parses through the data and constructs HTML to display it.
     * @param {object} data
     * @param {Element} parent
     */
    const displayData = (data, parent, depth = 2) => {
        for(const id of Reflect.ownKeys(data)) {

            const container = document.createElement('div');
            container.setAttribute('id', id)
            container.setAttribute('class', 'container')

            // const timestampContainer = document.createElement('p');
            // timestampContainer.setAttribute('class', 'timestamp')
            // const timestamp = document.createElement('code');
            // timestamp.textContent = data[id].timestamp;
            // timestampContainer.appendChild(timestamp);
            // container.appendChild(timestampContainer);

            const title = document.createElement(`h${depth}`);
            title.setAttribute('class', 'title')
            title.textContent = data[id].title;
            container.appendChild(title);

            const text = document.createElement('pre');
            text.setAttribute('class', 'text')
            text.textContent = data[id].text;
            container.appendChild(text);

            parent.appendChild(container);
            if(data[id].children) displayData(data[id].children, container, depth + 1);
        }
    };
    const output = document.getElementById('output');
    output.replaceChildren();
    displayData(parsedData, output);
}
