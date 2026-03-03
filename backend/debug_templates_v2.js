const http = require('http');

http.get('http://localhost:5000/api/templates/public', (resp) => {
    let data = '';

    resp.on('data', (chunk) => { data += chunk; });

    resp.on('end', () => {
        try {
            const templates = JSON.parse(data);
            console.log("Total Templates:", templates.length);

            // Filter for "interesting" ones (likely the new uploads)
            // We assume defaults have 'root' in sceneGraph.
            const likelyUploads = templates.filter(t => {
                // If it has canvasData OR (sceneGraph but NO root)
                return t.canvasData || (t.sceneGraph && !t.sceneGraph.root);
            });

            console.log("Likely Uploads Found:", likelyUploads.length);

            likelyUploads.forEach(t => {
                console.log("=== Uploaded Template ===");
                console.log("ID:", t._id);
                console.log("Name:", t.name);
                const content = t.canvasData || t.sceneGraph;
                if (typeof content === 'string') {
                    console.log("Content Type: String (Length: " + content.length + ")");
                    console.log("Snippet:", content.substring(0, 100));
                } else {
                    console.log("Content Type: Object");
                    console.log("Keys:", Object.keys(content || {}));
                    if (content && content.objects) {
                        console.log("Object Count:", content.objects.length);
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    });
});
