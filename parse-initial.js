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
    /** Recursively parses through an Array and constructs a new array without hierarchy, unneeded properties, or mistaken values.
     * @param {Array<object>} data
     */
    const cleanData = data => {
        for(const datum of data) {
            cleanedData.push({
                id: datum.id,
                id_parent: datum.parent,
                // timestamp: oldData[i].updated || '2014-12-31T23:59:59.999999Z',
                title: datum.title || 'untitled',
                text: !datum.notes ? '' : datum.notes.replaceAll('\\\n', '\\n').replaceAll('\\\t', '\\t'),
            });
            if(datum.items?.length) cleanData(datum.items);
        }
    };
    const cleanedData = [];
    cleanData(rawData);
    rawData = null;

    // Build a map-by-ID of the cleaned data
    const map = {};
    for(const datum of cleanedData) {
        map[datum.id] = {
            // timestamp: datum.timestamp,
            title: datum.title,
            text: datum.text,
        };
    }

    // Build a new Array which uses hierarchy instead of IDs to link nodes.
    const simplifiedData = [];
    for(const datum of cleanedData) {
        const child = map[datum.id];
        const parent = datum.id_parent in map ? map[datum.id_parent] : null;

        if(parent) {
            if(!parent.children) parent.children = [];
            parent.children.push(child);
        } else {
            simplifiedData.push(child);
        }
    }

    // Display the data
    console.debug(simplifiedData);
    /** Recursively parses through the data and constructs HTML to display it.
     * @param {Array<object>} data
     * @param {Element} parent
     */
    const displayData = (data, parent, depth = 2) => {
        for(const datum of data) {

            const container = document.createElement('div');
            container.setAttribute('class', 'container')

            // const timestampContainer = document.createElement('p');
            // timestampContainer.setAttribute('class', 'timestamp')
            // const timestamp = document.createElement('code');
            // timestamp.textContent = datum.timestamp;
            // timestampContainer.appendChild(timestamp);
            // container.appendChild(timestampContainer);

            const title = document.createElement(`h${depth < 6 ? depth : 6}`);
            title.setAttribute('class', 'title')
            title.textContent = datum.title;
            container.appendChild(title);

            const text = document.createElement('pre');
            text.setAttribute('class', 'text')
            text.textContent = datum.text;
            container.appendChild(text);

            parent.appendChild(container);
            if(datum.children) displayData(datum.children, container, depth + 1);
        }
    };
    const output = document.getElementById('output');
    output.replaceChildren();
    displayData(simplifiedData, output);
}
