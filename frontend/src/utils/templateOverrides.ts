export const applyOverridesToSceneGraph = (sceneGraph: any, overrides: any[], templateId: string) => {
    const override = overrides.find((o: any) => o.templateId === templateId);
    if (!override) return sceneGraph;

    // Deep clone to avoid mutating original data
    const updatedGraph = JSON.parse(JSON.stringify(sceneGraph));

    const processNode = (node: any) => {
        if (node.role && override.layoutOverrides[node.role]) {
            const ov = override.layoutOverrides[node.role];
            // Apply transform
            if (ov.transform) {
                node.transform = {
                    ...node.transform,
                    x: ov.transform.x,
                    y: ov.transform.y,
                    scaleX: ov.transform.scaleX,
                    scaleY: ov.transform.scaleY,
                    rotation: ov.transform.rotation
                };
            }
            // Apply styles
            if (ov.style) {
                Object.keys(ov.style).forEach(key => {
                    node[key] = ov.style[key];
                });
            }
        }

        if (node.children && Array.isArray(node.children)) {
            node.children.forEach(processNode);
        }
    };

    if (updatedGraph.root) {
        processNode(updatedGraph.root);
    }

    return updatedGraph;
};
