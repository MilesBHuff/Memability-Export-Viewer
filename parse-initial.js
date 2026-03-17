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
    let cleanedData = [];
    const cleanData = data => {
        for(const datum of data) {
            cleanedData.push({
                id: datum.id,
                id_parent: datum.parent,
                timestamp: '2014-12-31T23:59:59.999999Z', // The `updated` field is, unfortunately, the same for all of these notes, and wildly far-off of their creation dates; so I'm giving everything a reasonably representative timestamp.
                title: datum.title ?? '',
                text: !datum.notes ? '' : datum.notes.replaceAll('\\\n', '\\n').replaceAll('\\\t', '\\t'), // Escaped sequences need to be normalized before display.
            });
            if(datum.items?.length ?? 0 > 0) {
                cleanData(datum.items)
            }
        }
    };
    cleanData(rawData)

    // Display the data
    console.log(cleanedData);
    for(const datum of cleanedData) {
        const output = document.getElementById('output');

        const container = document.createElement('div');
        container.setAttribute('id', datum.id)

        const timestampContainer = document.createElement('p');
        const timestamp = document.createElement('code');
        timestamp.textContent = datum.timestamp;
        timestampContainer.appendChild(timestamp);
        container.appendChild(timestampContainer);

        const title = document.createElement('h2');
        title.textContent = datum.title;
        container.appendChild(title);

        const text = document.createElement('pre');
        text.textContent = datum.text;
        container.appendChild(text);

        output.appendChild(container);
        const line = document.createElement('hr');
        output.appendChild(line);
    }
}
