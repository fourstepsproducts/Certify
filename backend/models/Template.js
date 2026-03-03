const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: {
        type: String,
        required: [true, 'Please add a template name'],
    },
    // Scene Graph data (new format)
    sceneGraph: {
        type: Object, // Stores the complete Scene Graph structure
        required: false, // Optional for backward compatibility
    },
    // Legacy canvas data (old format - for backward compatibility)
    canvasData: {
        type: Object, // Stores the old Fabric.js JSON object
        required: false,
    },
    // Format version
    dataFormat: {
        type: String,
        enum: ['json', 'sceneGraph'],
        default: 'sceneGraph', // New templates use Scene Graph by default
    },
    // Version for migration tracking
    version: {
        type: String,
        default: '1.0.0',
    },
    thumbnail: {
        type: String, // Store URL or base64 string
    },
    // Category for filtering
    category: {
        type: String,
        enum: ['participation', 'achievement', 'completion', 'award', 'uploaded', 'custom', 'system'],
        default: 'achievement',
    },
    isSystem: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
}, {
    timestamps: true,
});

// Virtual to get the appropriate data based on format
templateSchema.virtual('templateData').get(function () {
    if (this.dataFormat === 'sceneGraph' && this.sceneGraph) {
        return this.sceneGraph;
    }
    return this.canvasData;
});

// Method to convert old format to new format
templateSchema.methods.migrateToSceneGraph = function (sceneGraphConverter) {
    if (this.dataFormat === 'json' && this.canvasData) {
        this.sceneGraph = sceneGraphConverter.jsonToSceneGraph(this.canvasData);
        this.dataFormat = 'sceneGraph';
        this.version = '1.0.0';
        return true;
    }
    return false;
};

module.exports = mongoose.model('Template', templateSchema);
