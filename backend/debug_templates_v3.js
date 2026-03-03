const http = require('http');

http.get('http://localhost:5000/api/templates/public', (resp) => {
    let data = '';

    resp.on('data', (chunk) => { data += chunk; });

    resp.on('end', () => {
        try {
            const templates = JSON.parse(data);
            const likelyUploads = templates.filter(t => t.canvasData || (t.sceneGraph && !t.sceneGraph.root));

            likelyUploads.forEach(t => {
                console.log("=== Uploaded Template ===");
                const content = t.canvasData || t.sceneGraph;
                if (content && content.backgroundImage) {
                    console.log("Background Image SRC:", content.backgroundImage.src);
                    console.log("Background Image Type:", content.backgroundImage.type);
                } else {
                    console.log("No Background Image");
                }
            });
        } catch (e) { console.error(e); }
    });
});
