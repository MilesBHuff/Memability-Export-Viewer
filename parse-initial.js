async function main() {
    const dataPath = 'Memability.json';
    try {
        const data = await (await fetch(dataPath)).json();
        console.log(data);
        document.getElementById('output').innerHTML = data;
    } catch(error) {
        console.error(`"${dataPath}" failed to load!`);
    }
}
