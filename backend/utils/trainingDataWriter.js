const fs = require('fs').promises;
const path = require('path');

const TRAINING_DATA_PATH = path.join(__dirname, '../../frontend/src/data/training_data.json');

/**
 * Add a training data entry to the training_data.json file
 * @param {string} name - Template name
 * @param {string} category - Template category
 * @param {object} canvasData - Canvas/scene graph data
 */
async function addTrainingEntry(name, category, canvasData) {
    console.log('[Training Data] Function called with:', { name, category, hasData: !!canvasData });
    try {
        let data = { version: '1.0', entries: [] };

        // Read existing file if it exists
        console.log('[Training Data] Attempting to read from:', TRAINING_DATA_PATH);
        try {
            const fileContent = await fs.readFile(TRAINING_DATA_PATH, 'utf8');
            data = JSON.parse(fileContent);
            console.log('[Training Data] Read existing file, current entries:', data.entries.length);
        } catch (err) {
            // File doesn't exist yet or is invalid, use empty data
            console.log('[Training Data] Creating new training data file. Error:', err.message);
        }

        // Add new entry (only name, category, and canvasData)
        const entry = {
            name,
            category,
            canvasData
        };

        data.entries.push(entry);
        console.log('[Training Data] Added entry, total entries now:', data.entries.length);

        // Ensure directory exists
        const dir = path.dirname(TRAINING_DATA_PATH);
        await fs.mkdir(dir, { recursive: true });
        console.log('[Training Data] Directory ensured:', dir);

        // Write back to file with pretty formatting
        await fs.writeFile(TRAINING_DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
        console.log('[Training Data] Successfully wrote to file');

        console.log(`[Training Data] Added entry: ${name} (${category}) - Total entries: ${data.entries.length}`);
    } catch (error) {
        console.error('[Training Data] Error writing:', error);
        console.error('[Training Data] Error stack:', error.stack);
        // Don't throw - we don't want to fail the save if training data fails
    }
}

module.exports = { addTrainingEntry };
