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
    for(const datum of data) {

        // These aren't tasks; they don't need a task_type.
        delete datum.task_type;

        // Escaped sequences need to be normalized before display.
        String(datum.notes).replaceAll('\\\n', '\\n').replaceAll('\\\t', '\\t');

        // The `updated` field is, unfortunately, the same for all of these notes, and wildly far-off of their creation dates.
        delete datum.updated;
        datum.timestamp = '2014-12-31T23:59:59.999999Z'
    }

    // Display the data
    console.log(data);
    for(const datum of data) {
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

        const notes = document.createElement('pre');
        notes.textContent = datum.notes;
        container.appendChild(notes);

        output.appendChild(container);
        const line = document.createElement('hr');
        output.appendChild(line);
    }
}
