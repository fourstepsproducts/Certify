const asyncHandler = require('express-async-handler');
const CertificateQueue = require('../models/CertificateQueue');
const Registration = require('../models/Registration');
const Feedback = require('../models/Feedback');
const Module = require('../models/Module');
const Template = require('../models/Template');
const nodemailer = require('nodemailer');

const generateSerialNumber = (format, counter, data = {}) => {
    // Legacy fallback
    if (!format || format.length === 0) {
        return (data.prefix || '') + String(counter).padStart(3, '0');
    }

    const d = new Date();

    let hasCounter = false;
    const result = format.map(token => {
        switch (token.type) {
            case 'text':
                return token.value || '';
            case 'separator':
                return token.value || '-';
            case 'year':
                return (token.value === 'YY') ? String(d.getFullYear()).slice(-2) : String(d.getFullYear());
            case 'month':
                if (token.value === 'Name') return d.toLocaleString('default', { month: 'long' });
                return String(d.getMonth() + 1).padStart(2, '0');
            case 'date':
                // Simple date parts if used generically
                if (token.value === 'DD') return String(d.getDate()).padStart(2, '0');
                if (token.value === 'MM') return String(d.getMonth() + 1).padStart(2, '0');
                if (token.value === 'YYYY') return String(d.getFullYear());
                return new Date().toLocaleDateString();
            case 'counter':
                hasCounter = true;
                return String(counter).padStart(token.length || 3, '0');
            case 'dynamic':
                if (token.key === 'name' && data.name) {
                    return data.name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
                }
                return '';
            default: return '';
        }
    }).join('');

    if (!hasCounter) {
        return result + String(counter).padStart(3, '0');
    }

    return result;
};

// @desc    Match emails and create certificate queue
// @route   POST /api/certificates/match/:moduleId
// @access  Private
const matchEmails = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;

    // Verify module exists and user owns it
    const module = await Module.findById(moduleId);
    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    if (module.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    // Get all registrations and feedback for this module
    const registrations = await Registration.find({ moduleId });
    const feedbacks = await Feedback.find({ moduleId });

    // Maps for fast lookup
    const regMap = new Map();
    registrations.forEach(r => regMap.set(r.email.toLowerCase(), r));

    const feedbackMap = new Map();
    feedbacks.forEach(f => feedbackMap.set(f.email.toLowerCase(), f));

    // Get all unique emails
    const allEmails = new Set([...regMap.keys(), ...feedbackMap.keys()]);

    console.log('--- Match Emails Debug ---');
    console.log('Module ID:', moduleId);
    console.log('Registrations found:', registrations.length, registrations.map(r => r.email));
    console.log('Feedbacks found:', feedbacks.length, feedbacks.map(f => f.email));
    console.log('All Unique Emails:', Array.from(allEmails));

    // Clear existing queue for this module
    await CertificateQueue.deleteMany({ moduleId });

    // Create queue items
    const queueItems = [];
    for (const email of allEmails) {
        const reg = regMap.get(email);
        const hasFeedback = feedbackMap.has(email);
        const hasReg = !!reg;

        let status = 'ineligible';
        if (hasReg && hasFeedback) {
            status = 'eligible';
        } else if (hasReg) {
            status = 'pending';
        }

        // Determine name and details
        let name = 'Not Registered';
        let phoneNumber = undefined;

        if (hasReg) {
            name = reg.name;
            phoneNumber = reg.phoneNumber;
        }

        queueItems.push({
            moduleId,
            email,
            name,
            phoneNumber,
            status
        });
        console.log(`Email: ${email} -> Status: ${status}`);
    }

    // Bulk insert queue items
    if (queueItems.length > 0) {
        await CertificateQueue.insertMany(queueItems);
    }

    const eligibleCount = queueItems.filter(item => item.status === 'eligible').length;
    const pendingCount = queueItems.filter(item => item.status === 'pending').length;
    const ineligibleCount = queueItems.filter(item => item.status === 'ineligible').length;

    res.json({
        message: 'Email matching completed',
        eligibleCount,
        pendingCount,
        ineligibleCount,
        totalRegistrations: registrations.length,
        totalFeedback: feedbacks.length
    });
});

// @desc    Get certificate queue for a module
// @route   GET /api/certificates/queue/:moduleId
// @access  Private
const getQueue = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;
    const { status } = req.query; // Optional filter: eligible, ineligible, sent

    // Verify module exists and user owns it
    const module = await Module.findById(moduleId);
    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    if (module.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const filter = { moduleId };
    if (status) {
        filter.status = status;
    }

    const queue = await CertificateQueue.find(filter)
        .sort({ createdAt: -1 });

    res.json(queue);
});

// @desc    Send certificates to eligible users
// @route   POST /api/certificates/send
// @access  Private
const sendCertificates = asyncHandler(async (req, res) => {
    const { moduleId, templateId } = req.body;

    if (!moduleId || !templateId) {
        res.status(400);
        throw new Error('Module ID and Template ID are required');
    }

    // Verify module exists and user owns it
    const module = await Module.findById(moduleId);
    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    if (module.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    // Verify template exists
    const template = await Template.findById(templateId);
    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }

    // Get all eligible queue items
    const eligibleItems = await CertificateQueue.find({
        moduleId,
        status: 'eligible'
    });

    if (eligibleItems.length === 0) {
        res.status(400);
        throw new Error('No eligible users found');
    }

    // Hydrate data for mapping (Registrations & Feedback)
    const registrations = await Registration.find({ moduleId });
    const feedbacks = await Feedback.find({ moduleId });

    const regMap = new Map();
    registrations.forEach(r => regMap.set(r.email.toLowerCase(), r));

    const feedbackMap = new Map();
    feedbacks.forEach(f => feedbackMap.set(f.email.toLowerCase(), f));

    // Resolve Field Mappings
    const fieldMapping = module.certificateConfig?.fieldMapping || {};
    const hasMapping = fieldMapping && Object.keys(fieldMapping).length > 0;

    // Configure email transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Send certificates
    let successCount = 0;
    let failCount = 0;

    for (const item of eligibleItems) {
        try {
            // Build dynamic URL params
            let urlParams = `template=${templateId}&name=${encodeURIComponent(item.name)}`;

            // Generate Certificate Number if not already present
            let certNum = item.certificateNumber;
            if (!certNum) {
                // Determine sequence number
                // We use serialCounter from module + successCount + 1 (since we are processing)
                const currentSeq = (module.certificateConfig?.serialCounter || 0) + successCount + 1;
                certNum = generateSerialNumber(
                    module.certificateConfig?.serialFormat,
                    currentSeq,
                    {
                        prefix: module.certificateConfig?.certNumberPrefix, // Legacy fallback
                        name: item.name
                    }
                );
            }

            urlParams += `&certNumber=${encodeURIComponent(certNum)}`;

            if (hasMapping) {
                const reg = regMap.get(item.email.toLowerCase());
                const feedback = feedbackMap.get(item.email.toLowerCase());

                for (const [objectId, sourceKey] of fieldMapping.entries()) {
                    let value = '';

                    // Data resolution logic
                    if (sourceKey === 'name') value = item.name;
                    else if (sourceKey === 'email') value = item.email;
                    else if (sourceKey === 'phoneNumber') value = item.phoneNumber || '';
                    else if (sourceKey === 'date') value = new Date().toLocaleDateString();
                    else if (sourceKey === 'submittedAt') value = reg?.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '';
                    else if (sourceKey.startsWith('custom.') && reg?.customData) {
                        const customKey = sourceKey.replace('custom.', '');
                        value = reg.customData.get(customKey) || '';
                    }
                    else if (sourceKey === 'feedback.feedback' && feedback) value = feedback.feedback || '';

                    if (value) {
                        urlParams += `&data_${objectId}=${encodeURIComponent(value)}`;
                    }
                }
            }

            const certLink = `${process.env.FRONTEND_URL}/editor?${urlParams}`;

            // Create email content
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: item.email,
                subject: `Your Certificate for ${module.name}`,
                html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Congratulations, ${item.name}!</h1>
              </div>
              <div class="content">
                <p>Dear ${item.name},</p>
                <p>Congratulations on successfully completing <strong>${module.name}</strong>!</p>
                <p>We're thrilled to award you this certificate of completion. Your dedication and participation have been outstanding.</p>
                <p>You can access and download your certificate using the link below:</p>
                <p style="text-align: center;">
                  <a href="${certLink}" class="button">
                    View Your Certificate
                  </a>
                </p>
                <p>Thank you for being a part of this journey!</p>
                <p>Best regards,<br><strong>CertifyPro Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
          </html>
        `
            };

            await transporter.sendMail(mailOptions);

            // Update queue item status
            await CertificateQueue.findByIdAndUpdate(item._id, {
                status: 'sent',
                sentAt: new Date(),
                templateId,
                certificateNumber: certNum // Save the generated number permanently
            });

            successCount++;
        } catch (error) {
            console.error(`Failed to send certificate to ${item.email}:`, error);
            failCount++;
        }
    }

    // Update Module Counter
    if (successCount > 0) {
        await Module.findByIdAndUpdate(moduleId, {
            $inc: { 'certificateConfig.serialCounter': successCount }
        });
    }

    res.json({
        message: 'Certificate sending completed',
        successCount,
        failCount,
        totalEligible: eligibleItems.length
    });
});

// @desc    Get eligible students for bulk certificate generation
// @route   GET /api/certificates/eligible/:moduleId
// @access  Private
const getEligibleStudents = asyncHandler(async (req, res) => {
    const { moduleId } = req.params;

    // Verify module exists and user owns it
    const module = await Module.findById(moduleId);
    if (!module) {
        res.status(404);
        throw new Error('Module not found');
    }

    if (module.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    // Get all eligible queue items
    const eligibleItems = await CertificateQueue.find({
        moduleId,
        status: 'eligible'
    });

    if (eligibleItems.length === 0) {
        return res.json({
            data: [],
            columns: [],
            count: 0
        });
    }

    // Hydrate data for mapping (Registrations & Feedback)
    const registrations = await Registration.find({ moduleId });
    const feedbacks = await Feedback.find({ moduleId });

    const regMap = new Map();
    registrations.forEach(r => regMap.set(r.email.toLowerCase(), r));

    const feedbackMap = new Map();
    feedbacks.forEach(f => feedbackMap.set(f.email.toLowerCase(), f));

    // Get registration link to determine custom fields
    const RegistrationLink = require('../models/RegistrationLink');
    const regLink = await RegistrationLink.findOne({ moduleId });
    const customFields = regLink?.customFields || [];

    // Build columns array - ONLY from Registration Form schema
    const columns = [
        'name',
        'email',
        'phoneNumber',
        'date',  // Current date helper
        'certificateNumber', // Unique serial
        ...customFields.map(f => `custom.${f.id}`)
    ];
    const currentPrefix = module.certificateConfig?.certNumberPrefix || '';

    // Format data for bulk engine
    const data = eligibleItems.map((item, index) => {
        const reg = regMap.get(item.email.toLowerCase());
        const feedback = feedbackMap.get(item.email.toLowerCase());

        // Determine Certificate Number (Preview)
        const format = module.certificateConfig?.serialFormat;
        const currentCounter = module.certificateConfig?.serialCounter || 0;

        // If item already has a number (e.g. sent), use it. Else preview next.
        // Since this is 'eligible' (unprocessed), we preview.
        const previewCounter = currentCounter + index + 1;

        const certNum = generateSerialNumber(
            format,
            previewCounter,
            {
                prefix: currentPrefix,
                name: item.name
            }
        );

        const row = {
            name: item.name,
            email: item.email,
            phoneNumber: item.phoneNumber || '',
            submittedAt: reg?.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '',
            date: new Date().toLocaleDateString(),
            certificateNumber: certNum
        };

        // Add custom field data
        customFields.forEach(field => {
            const key = `custom.${field.id}`;
            row[key] = reg?.customData?.get(field.id) || '';
        });

        return row;
    });

    // Build friendly column labels metadata
    const columnsMetadata = {
        'name': { label: 'Full Name', type: 'standard' },
        'email': { label: 'Email Address', type: 'standard' },
        'phoneNumber': { label: 'Phone Number', type: 'standard' },
        'date': { label: 'Current Date', type: 'date' },
        'certificateNumber': { label: 'Certificate Number', type: 'serial' }
    };

    // Add custom field labels
    customFields.forEach(field => {
        const key = `custom.${field.id}`;
        columnsMetadata[key] = {
            label: field.label || field.id,
            type: 'custom'
        };
    });

    res.json({
        data,
        columns,
        columnsMetadata,
        count: eligibleItems.length
    });
});

module.exports = {
    matchEmails,
    getQueue,
    sendCertificates,
    getEligibleStudents
};
