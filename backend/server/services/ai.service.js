/**
 * AI Document Analysis Service
 *
 * Generic service for analyzing financial documents using a Vision Language Model.
 * Uses the OpenAI-compatible API exposed by Hugging Face inference endpoints
 * (Qwen2.5-VL or similar).
 *
 * Designed for extensibility: accepts a documentType parameter so the same
 * service can handle receipts, invoices, bills, and tax documents.
 */

const OpenAI = require('openai');
const { buildSystemPrompt, buildUserPrompt } = require('../prompts/receiptPrompt');

// Lazy-initialized OpenAI client — avoids crashing at startup if HF env vars aren't set yet
let client = null;

/**
 * Get or create the OpenAI client pointed at the Hugging Face endpoint.
 * Lazy init ensures the app doesn't crash if env vars are missing at startup.
 */
const getClient = () => {
  if (!client) {
    if (!process.env.HF_API_KEY) {
      throw new Error('HF_API_KEY environment variable is not set. Cannot call AI service.');
    }
    client = new OpenAI({
      baseURL: process.env.HF_API_URL,
      apiKey: process.env.HF_API_KEY,
    });
  }
  return client;
};

/**
 * Analyze a financial document image using the Vision Language Model.
 *
 * Sends the image as a base64 data URL so the VLM doesn't need to fetch
 * from an external URL (which fails with private S3 buckets).
 *
 * @param {Object} options
 * @param {Buffer} options.imageBuffer - The raw image buffer from multer
 * @param {string} options.mimeType    - MIME type of the image (e.g. 'image/jpeg')
 * @param {string} [options.documentType='receipt'] - Type of document for prompt selection
 * @returns {Object} Parsed JSON object with extracted financial data
 * @throws {Error} On AI timeout, invalid response, or API errors
 */
const analyzeDocument = async ({ imageBuffer, mimeType, documentType = 'receipt' }) => {
  try {
    const modelName = process.env.HF_MODEL_NAME || 'Qwen/Qwen2.5-VL-72B-Instruct';
    const systemPrompt = buildSystemPrompt(documentType);
    const userPrompt = buildUserPrompt(documentType);

    // Convert image buffer to base64 data URL for inline embedding
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const response = await getClient().chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.1, // Low temperature for deterministic extraction
    });

    const rawContent = response.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('AI returned an empty response. No receipt data could be extracted.');
    }

    // Strip markdown code fences if the model wraps the JSON in them
    const cleanedContent = rawContent
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // Parse the JSON response
    let parsed;
    try {
      parsed = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('AI returned invalid JSON:', cleanedContent);
      throw new Error(
        'AI returned malformed JSON. The receipt may be unclear or unreadable.'
      );
    }

    return parsed;
  } catch (error) {
    // Handle specific error types
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      throw new Error('AI service timed out. Please try again.');
    }

    if (error.status === 429) {
      throw new Error('AI service rate limit reached. Please try again later.');
    }

    if (error.status === 503) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }

    // Re-throw if it's already a descriptive error from above
    if (error.message.includes('AI returned')) {
      throw error;
    }

    console.error('AI service error:', error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

module.exports = { analyzeDocument };

