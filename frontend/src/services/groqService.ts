/**
 * Groq AI Service
 * Handles communication with the Groq API for AI-powered certificate generation
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GroqRequest {
    messages: GroqMessage[];
    model: string;
    temperature?: number;
    max_tokens?: number;
}

interface GroqResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

const ELABORATION_SYSTEM_PROMPT = `You are a Senior Creative Director for a high-end design agency.
Your goal is to transform a user's request into a PIXEL-PERFECT design specification for a certificate.
Your specification must be strictly visual and precise, ensuring professional aesthetics.

GUIDELINES FOR PERFECTION:
1. LAYOUT & COMPOSITION (Standard 800x600 canvas):
   - BORDERS: Always define a border style (e.g., Gold, Ornamental, Minimalist). Borders usually inset by 20-40px.
   - HEADER: The Title ("Certificate of Achievement") MUST be centered at top (y: 100-150px).
   - BODY: Recipient Name MUST be the visual focal point (large, centered, y: 250-300px).
   - REASON: Award description text usually below name (y: 350-400px).
     - IMPORTANT: The description text MUST be "auto-expanded" if the user input is short. Write a professional 1-2 sentence reason.
     - Example: If user says "best coder", you write "For demonstrating exceptional coding skills and technical leadership in the 2024 Global Hackathon."
   - FOOTER: Signatures and Date must be aligned at bottom (y: 450-500px).
     - DYNAMIC SIGNATURES:
       - 1 Signature: Date on Left, Signature on Right.
       - 2 Signatures: Date Center, Sig1 Left, Sig2 Right.
       - 3 Signatures: Distribute evenly (Sig1 Left, Sig2 Center, Sig3 Right). Explicitly mention "Three distinct signature lines".
   - DYNAMIC BORDERS & SHAPES:
     - DO NOT just use straight side bars. Use angled/rotated shapes (e.g., a blue rectangle rotated 45 degrees).
     - Layer multiple shapes (2-3) with different opacities to create depth (e.g., "sliding" effects).
     - Place these primarily on corners or one side, but keep it BALANCED.
     - OPTIONAL: Only add these if they enhance the design. Do not force them if a minimal look is better.

2. CONTEXT & THEME ANALYSIS (Detailed Relevance):
   - ANALYZE the user's request to determine the theme (Corporate, Academic, Tech, Sports, Kids, etc.).
   - FOR CORPORATE: Use clean lines, minimal borders, navy/grey/silver. No squiggly shapes.
   - FOR ACADEMIC: Use classic heavy borders, serif fonts, gold seals, crest-like shapes.
   - FOR TECH/CODING: Use geometric patterns, hex codes like #00FF00 or Neon Blue, monospaced fonts.
   - FOR SPORTS: Use dynamic lines, bold colors (red/gold), and strong fonts.
   - DO NOT add random shapes (like triangles or stars) unless they fit the theme perfectly.

3. COLOR HARMONY (Use Hex Codes):
   - Generate a sophisticated palette matching the theme.
   - Backgrounds should be White (#FFFFFF), Cream (#FFFDD0), or extremely light tints.

4. TYPOGRAPHY:
   - Match font choice to the theme (e.g., Courier for Coding, Great Vibes for Weddings).

EXAMPLE INPUT: "Modern tech leadership award"
EXAMPLE OUTPUT: "Design a futuristic certificate with a 'Cyber-Security' aesthetic.
Theme: Tech/Modern. Palette: Deep Midnight Blue (#0a192f) and Neon Cyan (#64ffda).
Background: Very faint hexagonal grid pattern watermarks (opacity 0.03).
Layout Dynamics:
- Main Border: Minimalist thin Cyan line strokeWidth 2, inset 30px.
- Dynamic Shape 1 (Top Right): A large Midnight Blue rectangle rotated 45 degrees (angle: 45) sliding in from the top right corner (x=600, y=-100) to create a sharp header accent.
- Dynamic Shape 2 (Bottom Left): A matching Cyan shape (opacity 0.2) entering from bottom left.
- Layering: A semi-transparent dark overlay (opacity 0.1) on the left side (width 200px) but skewed (skewX: -10) for motion.
Title: 'CERTIFICATE OF ACHIEVEMENT' in 'Orbitron' or modern Sans, Bold, size 46, Midnight Blue, centered y=100.
Recipient Name: 'John Doe' in clean, tracking-wide Sans-serif, size 65, Gold/Cyan gradient fill, centered y=280.
Description: 'For demonstrating outstanding technical leadership and innovative problem-solving in deploying the Q4 Cloud Architecture.' (Auto-expanded).
Divider: A neon line width 300px centered y=360.
Footer: 3 Signatures Layout.
- 'Director' at x=150 (Left).
- 'CTO' at x=400 (Center).
- 'Lead Architect' at x=650 (Right)."`;

const SYSTEM_PROMPT = `You are an expert certificate designer that generates Fabric.js canvasData JSON for certificates. When a user describes a certificate they want, you must respond with ONLY valid JSON in the following structure which exactly matches the project's training data format:

{
  "version": "1.0",
  "entries": [
    {
      "name": "Certificate Name",
      "category": "achievement",
      "canvasData": {
        "version": "6.0.0",
        "objects": [
          {
            "type": "Rect",
            "version": "6.0.0",
            "originX": "left",
            "originY": "top",
            "left": 20,
            "top": 20,
            "width": 760,
            "height": 560,
            "fill": "transparent",
            "stroke": "#2C3E50",
            "strokeWidth": 4,
            "strokeDashArray": null,
            "strokeLineCap": "butt",
            "strokeDashOffset": 0,
            "strokeLineJoin": "miter",
            "strokeUniform": false,
            "strokeMiterLimit": 4,
            "scaleX": 1,
            "scaleY": 1,
            "angle": 0,
            "flipX": false,
            "flipY": false,
            "opacity": 1,
            "shadow": null,
            "visible": true,
            "backgroundColor": "",
            "fillRule": "nonzero",
            "paintFirst": "fill",
            "globalCompositeOperation": "source-over",
            "skewX": 0,
            "skewY": 0,
            "rx": 0,
            "ry": 0
          }
        ],
        "background": "#FFFFFF",
        "width": 800,
        "height": 600,
        "backgroundColor": "#FFFFFF"
      }
    }
  ]
}

CRITICAL ELEMENT REQUIREMENTS - INCLUDE ALL PROPERTIES FOR EACH TYPE:

1. Textbox (Text Elements):
{
  "fontSize": <size>,
  "fontWeight": <weight>,
  "fontFamily": "<font>",
  "fontStyle": "normal",
  "lineHeight": 1.16,
  "text": "<content>",
  "charSpacing": 0,
  "textAlign": "center",
  "styles": [],
  "pathStartOffset": 0,
  "pathSide": "left",
  "pathAlign": "baseline",
  "underline": false,
  "overline": false,
  "linethrough": false,
  "textBackgroundColor": "",
  "direction": "ltr",
  "minWidth": 20,
  "splitByGrapheme": false,
  "_id": "text_<unique_id>",
  "type": "Textbox",
  "version": "6.0.0",
  "originX": "center",
  "originY": "top",
  "left": <x>,
  "top": <y>,
  "width": <width>,
  "height": <height>,
  "fill": "<color>",
  "stroke": null,
  "strokeWidth": 1,
  "strokeDashArray": null,
  "strokeLineCap": "butt",
  "strokeDashOffset": 0,
  "strokeLineJoin": "miter",
  "strokeUniform": false,
  "strokeMiterLimit": 4,
  "scaleX": 1,
  "scaleY": 1,
  "angle": 0,
  "flipX": false,
  "flipY": false,
  "opacity": 1,
  "shadow": null,
  "visible": true,
  "backgroundColor": "",
  "fillRule": "nonzero",
  "paintFirst": "fill",
  "globalCompositeOperation": "source-over",
  "skewX": 0,
  "skewY": 0
}

2. Rect (Borders/Shapes):
{
  "rx": <radius>,
  "ry": <radius>,
  "type": "Rect",
  "version": "6.0.0",
  "originX": "left",
  "originY": "top",
  "left": <x>,
  "top": <y>,
  "width": <width>,
  "height": <height>,
  "fill": "<color>",
  "stroke": "<color>",
  "strokeWidth": <width>,
  "strokeDashArray": null,
  "strokeLineCap": "butt",
  "strokeDashOffset": 0,
  "strokeLineJoin": "miter",
  "strokeUniform": false,
  "strokeMiterLimit": 4,
  "scaleX": 1,
  "scaleY": 1,
  "angle": 0,
  "flipX": false,
  "flipY": false,
  "opacity": 1,
  "shadow": null,
  "visible": true,
  "backgroundColor": "",
  "fillRule": "nonzero",
  "paintFirst": "fill",
  "globalCompositeOperation": "source-over",
  "skewX": 0,
  "skewY": 0
}

3. Line:
{
  "type": "Line",
  "version": "6.0.0",
  "originX": "left",
  "originY": "top",
  "left": <x>,
  "top": <y>,
  "width": <width>,
  "height": 0,
  "fill": "rgb(0,0,0)",
  "stroke": "<color>",
  "strokeWidth": <width>,
  "strokeDashArray": null,
  "strokeLineCap": "butt",
  "strokeDashOffset": 0,
  "strokeLineJoin": "miter",
  "strokeUniform": false,
  "strokeMiterLimit": 4,
  "scaleX": 1,
  "scaleY": 1,
  "angle": 0,
  "flipX": false,
  "flipY": false,
  "opacity": 1,
  "shadow": null,
  "visible": true,
  "backgroundColor": "",
  "fillRule": "nonzero",
  "paintFirst": "fill",
  "globalCompositeOperation": "source-over",
  "skewX": 0,
  "skewY": 0,
  "x1": <-width/2>,
  "x2": <width/2>,
  "y1": 0,
  "y2": 0
}

4. Circle:
{
  "radius": <radius>,
  "startAngle": 0,
  "endAngle": 360,
  "counterClockwise": false,
  "type": "Circle",
  "version": "6.0.0",
  "originX": "left",
  "originY": "top",
  "left": <x>,
  "top": <y>,
  "width": <diameter>,
  "height": <diameter>,
  "fill": "<color>",
  "stroke": null,
  "strokeWidth": 0,
  "strokeDashArray": null,
  "strokeLineCap": "butt",
  "strokeDashOffset": 0,
  "strokeLineJoin": "miter",
  "strokeUniform": false,
  "strokeMiterLimit": 4,
  "scaleX": 1,
  "scaleY": 1,
  "angle": 0,
  "flipX": false,
  "flipY": false,
  "opacity": <0-1>,
  "shadow": null,
  "visible": true,
  "backgroundColor": "",
  "fillRule": "nonzero",
  "paintFirst": "fill",
  "globalCompositeOperation": "source-over",
  "skewX": 0,
  "skewY": 0
}

IMPORTANT DESIGN RULES (YOU MUST FOLLOW):
1. CENTER ALIGNMENT: 
   - For centered center text, set "originX": "center", "left": 400.
   - For left aligned text (dates), set "originX": "left", "left": 50-100.
   - For right aligned text (signatures), set "originX": "left", "left": 550-600.
2. VERTICAL SPACING (y-coordinates):
   - Title: 80-150
   - Subtitle: 160-200
   - Recipient Name: 250-320
   - Description: 350-420
3. FOOTER LAYOUTS (Dynamic):
   - 1 Signature: Date aligned Left (x=100), Signature aligned Right (x=600).
   - 2 Signatures: Sig1 Left (x=150), Sig2 Right (x=650). Date can be Center bottom.
   - 3 Signatures: ALIGN AT y=500. Sig1 Left (x=150), Sig2 Center (x=400), Sig3 Right (x=650).
   - Signatures allow for titles like "Principal", "Director", "Teacher" below the line.
4. HIERARCHY:
   - Title FontSize: 40-60
   - Name FontSize: 50-80
   - Body FontSize: 16-24
4. DYNAMIC SHAPES (Borders/Panels):
   - Avoid boring straight rectangles.
   - Use "angle": 45 or -45 to create diagonal cuts.
   - Use "skewX": 20 to create sliding effects.
   - Layering: Place a dark shape (opacity 1) and a lighter shape (opacity 0.3) slightly offset to create depth.
5. DECORATIONS:
   - Use 'Circle' or 'Rect' with low opacity (0.05-0.1) as background watermarks.
   - Use multiple 'Line' elements for underlining titles.
6. NO OVERLAPPING: Ensure text elements have sufficient vertical spacing.
7. MANDATORY FIELDS: Every certificate MUST have: Title, Recipient Name (placeholder), Body Text, Date Line, Signature Line.
8. CANVAS BOUNDARIES (CRITICAL):
   - Canvas Size is ALWAYS 800x600.
   - SAFE ZONE: Keep all essential text within x=50 to x=750.
   - PREVENT OVERFLOW: For the Description Textbox, you MUST set "width": 600 and "splitByGrapheme": false to ensure wrapping.
   - Do NOT place any element's "left" < 0 or > 800.
   - Do NOT place any element's "top" < 0 or > 600.
`;

/**
 * Generate a certificate scene graph from a user prompt
 */
export async function generateCertificate(prompt: string): Promise<any> {
    if (!prompt || prompt.trim().length === 0) {
        throw new Error('Prompt cannot be empty');
    }

    if (prompt.length > 2000) {
        throw new Error('Prompt is too long. Please keep it under 2000 characters.');
    }

    try {
        // Step 1: Elaborate the prompt for better results
        console.log('Elaborating prompt:', prompt);
        const elaboratedPrompt = await elaboratePrompt(prompt);
        console.log('Elaborated prompt:', elaboratedPrompt);

        // Step 2: Generate JSON using the elaborated prompt
        const requestBody: GroqRequest = {
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    // Combine original prompt with elaboration for context
                    content: `User Request: "${prompt}"\n\nDetailed Visual Specification: ${elaboratedPrompt}\n\nBased on this specification, generate the exact Fabric.js JSON.`,
                },
            ],
            temperature: 0.7,
            max_tokens: 12000,
        };

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Groq API error:', errorText);

            if (response.status === 400 || response.status === 401) {
                throw new Error('Invalid API key. Please verify your Groq API key is correct and active.');
            } else if (response.status === 403) {
                throw new Error('Access forbidden. Please check your Groq API key permissions.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a few moments.');
            } else if (response.status === 500) {
                throw new Error('Groq API server error. Please try again later.');
            } else {
                throw new Error(`API request failed with status ${response.status}`);
            }
        }

        const data: GroqResponse = await response.json();

        if (!data.choices || data.choices.length === 0) {
            throw new Error('No response received from Groq API');
        }

        const content = data.choices[0].message.content.trim();

        // Try to extract JSON if it's wrapped in markdown code blocks
        let jsonContent = content;
        const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
            jsonContent = jsonMatch[1].trim();
        }

        // Parse and validate the JSON
        try {
            const rawData = JSON.parse(jsonContent);
            let certificateData = rawData;

            // Handle the nested entries structure if present
            if (rawData.entries && Array.isArray(rawData.entries) && rawData.entries.length > 0) {
                certificateData = rawData.entries[0];
            }

            // Basic validation for Fabric.js canvasData format
            if (!certificateData.canvasData || !certificateData.canvasData.objects) {
                throw new Error('Invalid certificate structure: missing canvasData or objects');
            }

            return certificateData;
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Raw content:', content);
            throw new Error('Failed to parse certificate JSON. The AI response was not valid JSON.');
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while generating the certificate');
    }
}

/**
 * Validate a Fabric.js canvasData structure
 */
export function validateSceneGraph(certificateData: any): boolean {
    if (!certificateData || typeof certificateData !== 'object') {
        return false;
    }

    if (!certificateData.canvasData || typeof certificateData.canvasData !== 'object') {
        return false;
    }

    if (!Array.isArray(certificateData.canvasData.objects)) {
        return false;
    }

    if (!certificateData.canvasData.width || !certificateData.canvasData.height) {
        return false;
    }

    return true;
}

/**
 * Elaborate a simple user prompt into a detailed visual description
 */
async function elaboratePrompt(prompt: string): Promise<string> {
    const requestBody: GroqRequest = {
        model: 'llama-3.3-70b-versatile',
        messages: [
            {
                role: 'system',
                content: ELABORATION_SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0.7,
        max_tokens: 1000,
    };

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.warn('Elaboration failed, using original prompt');
            return prompt;
        }

        const data: GroqResponse = await response.json();
        return data.choices?.[0]?.message?.content || prompt;
    } catch (error) {
        console.warn('Elaboration error:', error);
        return prompt;
    }
}
