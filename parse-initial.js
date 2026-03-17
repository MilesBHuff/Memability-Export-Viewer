////////////////////////////////////////////////////////////////////////////////
const getData = async () => {

    // Load JSON file
    let rawData;
    const rawDataPath = 'Memability.json'; // This is an export from Google Tasks of "tasks" created by the app Memability/Memz.co in the process of backing up my notes.
    try {
        rawData = (await (await fetch(rawDataPath)).json()).items[0].items || []; // The only index is the Memability data.
    } catch(error) {
        console.error(`Failed to load "${rawDataPath}"!`);
    }

    // Clean the data and build a map out of it.
    /** Recursively parses through an Array and constructs a map without hierarchy or unneeded/missing properties.
     * @param {Array<object>} data
     */
    const buildMap = (inputData, outputMap = {}) => {
        for (const datum of inputData) {
            outputMap[datum.id] ={
                parent_id: datum.parent,
                // timestamp: oldData[i].updated || '2014-12-31T23:59:59.999999Z',
                title: datum.title || 'untitled',
                text: !datum.notes ? '' : datum.notes,
            };
            if(datum.items?.length) buildMap(datum.items, outputMap);
        }
        return outputMap;
    };
    const mappedData = buildMap(rawData);
    rawData = null;

    // Build a new Array which uses hierarchy instead of IDs to link nodes.
    const hierarchicalData = [];
    for(const id of Object.keys(mappedData)) {
        const datum = mappedData[id];
        const parent = mappedData[datum.parent_id];
        delete datum.parent; //NOTE: I'm re-using and mutating the original entries from the map to avoid doubling memory usage.

        if(parent) {
            (parent.children ??= []).push(datum);
        } else {
            hierarchicalData.push(datum);
        }
    }

    // Done!
    return hierarchicalData;
};

////////////////////////////////////////////////////////////////////////////////
const displayData = data => {
    console.debug(data);

    /** Recursively parses through the data and constructs HTML to display it.
     * @param {Array<object>} data
     * @param {Element} parent
     */
    const buildDataDisplay = (data, parent, depth = 2) => {
        for(const datum of data) {

            const container = document.createElement('div');
            container.setAttribute('class', 'container')

            // const timestampContainer = document.createElement('p');
            // timestampContainer.setAttribute('class', 'timestamp')
            // const timestamp = document.createElement('code');
            // timestamp.textContent = datum.timestamp;
            // timestampContainer.appendChild(timestamp);
            // container.appendChild(timestampContainer);

            const title = document.createElement(`h${Math.min(depth, 6)}`);
            title.setAttribute('class', 'title')
            title.textContent = datum.title;
            container.appendChild(title);

            const text = document.createElement('pre');
            text.setAttribute('class', 'text')
            text.textContent = datum.text;
            container.appendChild(text);

            parent.appendChild(container);
            if(datum.children) buildDataDisplay(datum.children, container, depth + 1);
        }
    };
    const output = document.getElementById('output');
    output.replaceChildren();
    buildDataDisplay(data, output);
};

////////////////////////////////////////////////////////////////////////////////
const main = async () => displayData(await getData());
