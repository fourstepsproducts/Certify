const Registration = require('../models/Registration');
const transporter = require('../utils/mailer');
// Explicitly import the Node.js CommonJS build of Fabric to avoid browser environment errors
const { StaticCanvas } = require('fabric/node');
const { createCanvas } = require('canvas');

// Helper to get value from registration data based on column mapping
const getValueForColumn = (registration, column) => {
    if (!column) return '';

    // Handle standard fields
    if (column === 'name') return registration.name || '';
    if (column === 'email') return registration.email || '';
    if (column === 'phoneNumber') return registration.phoneNumber || '';
    if (column === 'date') return new Date().toLocaleDateString();

    // Handle custom fields (custom.xyz)
    if (column.startsWith('custom.')) {
        const key = column.split('.')[1];
        // customData is a Map, so use .get()
        return registration.customData.get(key) || '';
    }

    return '';
};

const sendDataDrivenEmails = async (req, res) => {
    try {
        const { moduleId, emailConfig, canvasData, fieldMappings } = req.body;

        if (!moduleId || !emailConfig || !canvasData) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Fetch Eligible Recipients
        const recipients = await Registration.find({ moduleId });

        if (recipients.length === 0) {
            return res.status(404).json({ message: 'No eligible recipients found for this module.' });
        }

        console.log(`Starting batch email for ${recipients.length} recipients. Module: ${moduleId}`);

        // 2. Setup Canvas (Base Template)
        // For Fabric 7.x in Node.js, we don't need to pass a canvas element manually
        // fabric/node handles it. Passing null as the first argument.
        const canvas = new StaticCanvas(null, {
            width: canvasData.width || 800,
            height: canvasData.height || 600
        });

        let sentCount = 0;
        let errors = [];

        // Loop through recipients
        for (const recipient of recipients) {
            // Reload canvas state for each user to ensure clean state
            // Optimization: Load once, get objects reference, update text.
            // But simpler implementation first: Load fresh.
            try {
                await canvas.loadFromJSON(canvasData);
            } catch (e) {
                console.error('Error loading JSON into canvas:', e);
                errors.push({ email: recipient.email, error: 'Failed to render design' });
                continue;
            }

            // 3. Update Text Fields
            const objects = canvas.getObjects();
            // Recursively update text objects (handling groups is harder, but let's try flat first or simple recursion)

            const updateObjects = (objs) => {
                objs.forEach(obj => {
                    // Check if this object has a mapping
                    const mapping = fieldMappings[obj.id || obj._id]; // Frontend sends both or one
                    if (mapping) {
                        // Get value
                        const value = getValueForColumn(recipient, mapping);
                        // Update text
                        if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
                            obj.set('text', String(value));
                        }
                    }

                    // Handle Groups
                    if (obj.type === 'group' && obj.getObjects) {
                        updateObjects(obj.getObjects());
                    }
                });
            };

            updateObjects(objects);

            canvas.renderAll();

            // 4. Generate Image
            const dataUrl = canvas.toDataURL({
                format: 'png',
                quality: 1,
                multiplier: 1 // High res?
            });
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

            // 5. Send Email
            try {
                await transporter.sendMail({
                    from: emailConfig.fromEmail || process.env.EMAIL_USER,
                    to: recipient.email,
                    subject: emailConfig.subject,
                    text: emailConfig.body,
                    attachments: [
                        {
                            filename: 'certificate.png',
                            content: base64Data,
                            encoding: 'base64'
                        }
                    ]
                });
                sentCount++;
                console.log(`Sent to ${recipient.email}`);
            } catch (err) {
                console.error(`Failed to send to ${recipient.email}:`, err);
                errors.push({ email: recipient.email, error: err.message });
            }
        }

        res.status(200).json({
            message: 'Batch processing complete',
            count: sentCount,
            total: recipients.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Batch email error details:', error);
        console.error('Stack:', error.stack);
        try {
            const fs = require('fs');
            fs.appendFileSync('error.log', `${new Date().toISOString()} Error: ${error.message}\nStack: ${error.stack}\n\n`);
        } catch (fsErr) {
            console.error('Failed to write to log file:', fsErr);
        }
        res.status(500).json({ message: 'Internal server error processing emails', error: error.message, stack: error.stack });
    }
};

module.exports = {
    sendDataDrivenEmails
};
