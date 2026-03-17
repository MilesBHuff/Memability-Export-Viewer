async function main() {
    let data;

    // Load JSON file
    const dataPath = 'Memability.json'; // This is an export from Google Tasks of "tasks" created by the app Memability/Memz.co in the process of backing up my notes.
    try {
        data = (await (await fetch(dataPath)).json()).items[0].items; // The only index is the Memability data.
    } catch(error) {
        console.error(`"${dataPath}" failed to load!`);
    }

    // Clean the data
    let cleanData = [];
    for(const datum of data) {
        cleanData.push({
            timestamp: '2014-12-31T23:59:59.999999Z', // The `updated` field is, unfortunately, the same for all of these notes, and wildly far-off of their creation dates; so I'm giving everything a reasonably representative timestamp.
            title: datum.title ?? '',
            text: !datum.notes ? '' : datum.notes.replaceAll('\\\n', '\\n').replaceAll('\\\t', '\\t'), // Escaped sequences need to be normalized before display.
        });
    }
    data = undefined;

    // Display the data
    console.log(cleanData);
    for(const datum of cleanData) {
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
