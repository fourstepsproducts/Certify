const mongoose = require('mongoose');

const templateLayoutSchema = new mongoose.Schema({
    templateId: {
        type: String,
        required: true,
        unique: true, // Only one layout override per template
    },
    layoutOverrides: {
        type: Object,
        required: true,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('TemplateLayout', templateLayoutSchema);
