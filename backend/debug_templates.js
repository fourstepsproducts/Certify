const http = require('http');

http.get('http://localhost:5000/api/templates/public', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        try {
            const templates = JSON.parse(data);
            console.log("Templates found:", templates.length);
            templates.forEach(t => {
                console.log("ID:", t._id);
                console.log("Name:", t.name);
                console.log("Has sceneGraph:", !!t.sceneGraph);
                console.log("Has canvasData:", !!t.canvasData);
                if (t.canvasData) {
                    console.log("canvasData type:", typeof t.canvasData);
                    if (typeof t.canvasData === 'string') {
                        console.log("canvasData (snippet):", t.canvasData.substring(0, 100));
                    } else {
                        console.log("canvasData keys:", Object.keys(t.canvasData));
                    }
                }
                if (t.sceneGraph) {
                    console.log("sceneGraph keys:", Object.keys(t.sceneGraph));
                }
                console.log("-------------------");
            });
        } catch (e) {
            console.error("Parse error:", e);
            console.log("Raw data:", data);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
