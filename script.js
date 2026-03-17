globalThis.memability = {
    defaultTimestamp: (new Date()).toISOString().replace('Z', '000Z'),
    skipRemoved: true,
};
const localizeDatetime = datetime => new Date(datetime).toLocaleString('en-CA', {dateStyle: 'short', timeStyle: 'short', hour12: false}).replace(',', ''); // `en-CA` used in order to get Y-M-D.

////////////////////////////////////////////////////////////////////////////////
const getData = async () => {

    // Load JSON file
    let rawData;
    const rawDataPath = 'Memability.json'; // This is an export from Google Tasks of "tasks" created by the app Memability/Memz.co in the process of backing up my notes.
    try {
        rawData = (await (await fetch(rawDataPath)).json()).items?.[0]?.items || []; // The only index is the Memability data.
    } catch(error) {
        console.error(`Failed to load "${rawDataPath}"!`, error);
    }

    // Clean the data and build a map out of it.
    /** Recursively parses through an Array and constructs a map without hierarchy or unneeded/missing properties.
     * @param {Array<object>} data
     */
    const buildMap = (inputData, outputMap = {}) => {
        for(const datum of inputData) {
            if(outputMap[datum.id] != null) {
                console.warn(`"${datum.id}" is not a unique ID — data will be lost!`)
                continue;
            }
            outputMap[datum.id] = {
                parent_id: datum.parent,
                updated: localizeDatetime(datum.updated || globalThis.memability.defaultTimestamp),
                created: localizeDatetime(datum.created || globalThis.memability.defaultTimestamp),
                title: datum.title || 'untitled',
                text: !datum.notes ? '' : String(datum.notes).replaceAll('&nbsp;', ' ').replaceAll(' ', ' ').replaceAll('<br/>', '\n'), // When Memability became Memz.co, it mangled several characters; we have to fix these.
                removed: datum.removed != null ? localizeDatetime(datum.removed) : (datum.deleted ? localizeDatetime(globalThis.memability.defaultTimestamp) : undefined),
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
        if(datum.parent_id && (parent == null || parent == '')) console.warn(`"${datum.parent_id}" is not a valid parent ID!`);
        delete datum.parent_id; //NOTE: I'm re-using and mutating the original entries from the map to avoid doubling memory usage.

        if(parent) {
            (parent.children ??= []).push(datum);
        } else {
            hierarchicalData.push(datum);
        }
    }

    // Remove `/` entry, if present, then return.
    if(hierarchicalData.length === 0) return [];
    if(hierarchicalData.length > 1 || !hierarchicalData[0].children || hierarchicalData[0].children.length === 0) return hierarchicalData;
    const trimmedData = [];
    for(const datum of hierarchicalData[0].children) trimmedData.push(datum);
    return trimmedData;
};

////////////////////////////////////////////////////////////////////////////////
const displayData = data => {
    console.debug(data);

    /** Recursively parses through the data and constructs HTML to display it.
     * @param {Array<object>} data
     * @param {Element} parent
     * @param {number} depth (Note: Starts at `2` because page title is `1`.)
     */
    const buildDataDisplay = (data, parent, depth = 2) => {
        for(const datum of data) {
            let removedClass = '';
            if(datum.removed) {
                if(globalThis.memability.skipRemoved) continue;
                removedClass = ' deleted';
            }

            const container = document.createElement('div');
            container.setAttribute('class', 'container')

            const title = document.createElement(`h${Math.min(depth, 6)}`);
            title.setAttribute('class', `title${removedClass}`)
            title.textContent = datum.title;
            container.appendChild(title);

            const text = document.createElement('pre');
            text.setAttribute('class', `text${removedClass}`)
            text.textContent = datum.text;
            container.appendChild(text);

            const timestampContainer = document.createElement('p');
            timestampContainer.setAttribute('class', 'timestamp')
            const timestamp = document.createElement('code');
            timestamp.textContent = (datum.removed ? `Deleted ${datum.removed} | ` : '') + (datum.updated !== datum.created ? `Updated ${datum.updated} | ` : '') + `Created ${datum.created}`;
            timestampContainer.appendChild(timestamp);
            container.appendChild(timestampContainer);

            parent.appendChild(container);
            if(datum.children) buildDataDisplay(datum.children, container, depth + 1);
        }
    };
    const output = document.getElementById('output');
    output.replaceChildren();
    const fragment = document.createDocumentFragment();
    buildDataDisplay(data, fragment);
    output.appendChild(fragment);
};

////////////////////////////////////////////////////////////////////////////////
const main = async () => {
    let data = [];
    try {
        data = await getData();
    } catch(error) {
        console.error(`Failed to get data!`, error);
    }
    displayData(data);
};
