// const PROVIDERS = {
//   groq: {
//     baseUrl: 'https://api.groq.com/openai/v1',
//     defaultModel: 'qwen/qwen3.6-27b',
//     altModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
//     supportsDetail: false,
//     signupUrl: 'https://console.groq.com/keys',
//     name: 'Groq (Free)',
//   },
//   openai: {
//     baseUrl: 'https://api.openai.com/v1',
//     defaultModel: 'gpt-4o-mini',
//     supportsDetail: true,
//     signupUrl: 'https://platform.openai.com/api-keys',
//     name: 'OpenAI',
//   },
//   gemini: {
//     baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
//     defaultModel: 'gemini-3.5-flash-lite',
//     supportsDetail: false,
//     signupUrl: 'https://aistudio.google.com/apikey',
//     name: 'Google Gemini',
//   },
// };

// class ExtractionError extends Error {
//   constructor(message, statusCode, code) {
//     super(message);
//     this.statusCode = statusCode;
//     this.code = code || 'EXTRACTION_ERROR';
//   }
// }

// class AINotConfiguredError extends Error {
//   constructor() {
//     const provider = process.env.INVOICE_AI_PROVIDER || 'groq';
//     const info = PROVIDERS[provider] || PROVIDERS.groq;
//     const msg =
//       `AI is not configured. Add these to your .env file:\n` +
//       `INVOICE_AI_PROVIDER=${provider}\n` +
//       `INVOICE_AI_API_KEY=your_api_key_here\n` +
//       `\nGet a FREE API key from ${info.name}: ${info.signupUrl}`;
//     super(msg);
//     this.statusCode = 503;
//     this.code = 'AI_NOT_CONFIGURED';
//   }
// }

// const EXTRACTION_SCHEMA = `Extract ALL data from this Indian GST invoice image. Return ONLY valid JSON.

// IMPORTANT: Fill EVERY field. Do not leave any field empty or null if the value is visible in the image.
// - supplierName: full supplier/company name
// - supplierGSTIN: supplier's GST identification number
// - supplierPhone: supplier's phone number
// - supplierEmail: supplier's email if visible
// - billingAddress: buyer/billed-to address
// - shippingAddress: ship-to address if different
// - All monetary values as numbers only (no Rs symbol, no commas)
// - product names exactly as on invoice
// - Determine if CGST+SGST (intra-state) or IGST (inter-state)

// JSON:
// {"invoice":{"invoiceNumber":"","invoiceDate":"YYYY-MM-DD","supplierName":"","supplierGSTIN":"","supplierPhone":"","supplierEmail":"","billingAddress":"","shippingAddress":"","subtotal":0,"discount":0,"cgst":0,"sgst":0,"igst":0,"otherCharges":0,"roundOff":0,"grandTotal":0},"items":[{"productName":"","sku":"","barcode":"","hsnCode":"","quantity":0,"unit":"","purchasePrice":0,"discount":0,"taxRate":0,"taxAmount":0,"lineTotal":0,"confidence":{"productName":0,"sku":0,"quantity":0,"purchasePrice":0,"taxRate":0}}]}`;

// // Read file as base64, with size check for model limits
// function readFileAsBase64(filePath) {
//   const fileBuffer = fs.readFileSync(filePath);
//   // Check raw file size (base64 will be ~33% larger)
//   const maxSizeBytes = 4 * 1024 * 1024; // 4MB raw = ~5.3MB base64
//   if (fileBuffer.length > maxSizeBytes) {
//     throw new ExtractionError(
//       `Image file is too large (${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB). Please use an image under 4MB, or compress it first. You can also use Manual Entry instead.`,
//       503,
//       'FILE_TOO_LARGE'
//     );
//   }
//   return fileBuffer.toString('base64');
// }

// function getMimeType(filePath) {
//   const ext = path.extname(filePath).toLowerCase();
//   const mimeMap = {
//     '.pdf': 'application/pdf',
//     '.jpg': 'image/jpeg',
//     '.jpeg': 'image/jpeg',
//     '.png': 'image/png',
//   };
//   return mimeMap[ext] || 'application/octet-stream';
// }

// function parseAIResponse(text) {
//   let cleaned = text.trim();

//   // Strip Qwen/OpenAI thinking tags: <think>...</think> or 💭...💭
//   cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
//   cleaned = cleaned.replace(/💭[\s\S]*?💭/g, '');

//   // Strip markdown code blocks
//   if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
//   else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
//   if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
//   cleaned = cleaned.trim();

//   // Find the first { and last } to extract just the JSON object
//   const firstBrace = cleaned.indexOf('{');
//   const lastBrace = cleaned.lastIndexOf('}');
//   if (firstBrace !== -1 && lastBrace > firstBrace) {
//     cleaned = cleaned.slice(firstBrace, lastBrace + 1);
//   }

//   return JSON.parse(cleaned);
// }

// // ─── OpenAI-compatible extraction (works for Groq, OpenAI, Gemini) ─
// async function extractWithProvider(base64Data, mimeType, providerKey) {
//   const cfg = PROVIDERS[providerKey];
//   if (!cfg) throw new ExtractionError(`Unknown provider: ${providerKey}`, 503, 'UNKNOWN_PROVIDER');

//   const apiKey = process.env.INVOICE_AI_API_KEY;
//   if (!apiKey) throw new AINotConfiguredError();

//   // Only use INVOICE_AI_MODEL override if it matches the current provider's models
//   // This prevents stale env vars from sending wrong model to wrong provider
//   const envModel = process.env.INVOICE_AI_MODEL;
//   const model = (envModel && providerKey === 'openai') ? envModel : cfg.defaultModel;
//   const baseUrl = (process.env.INVOICE_AI_BASE_URL || cfg.baseUrl).replace(/\/+$/, '');

//   // Build image content
//   const imageContent = {
//     type: 'image_url',
//     image_url: { url: `data:${mimeType};base64,${base64Data}` },
//   };

//   // Only add 'detail' for actual OpenAI
//   if (cfg.supportsDetail && !process.env.INVOICE_AI_BASE_URL) {
//     imageContent.image_url.detail = 'high';
//   }

//   const response = await fetch(`${baseUrl}/chat/completions`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify({
//       model,
//       messages: [
//         { role: 'system', content: EXTRACTION_SCHEMA },
//         {
//           role: 'user',
//           content: [
//             { type: 'text', text: 'Extract invoice data. Return JSON only.' },
//             imageContent,
//           ],
//         },
//       ],
//       max_tokens: 8192,
//       temperature: 0.1,
//     }),
//     signal: AbortSignal.timeout(90000),
//   });

//   if (!response.ok) {
//     const errBody = await response.text().catch(() => '');
//     console.error(`[InvoiceAI] Provider: ${providerKey}, Model: ${model}, Status: ${response.status}`, errBody);

//     // Groq-specific: if primary model fails with 400/422, try alt model
//     if (providerKey === 'groq' && cfg.altModel && model === cfg.defaultModel && (response.status === 400 || response.status === 422)) {
//       console.log(`[InvoiceAI] Retrying with alt model: ${cfg.altModel}`);
//       return extractWithGroqAlt(base64Data, mimeType);
//     }

//     if (response.status === 401) throw new ExtractionError(`Invalid API key for ${cfg.name}. Check INVOICE_AI_API_KEY. Get one at ${cfg.signupUrl}`, 503, 'INVALID_API_KEY');
//     if (response.status === 413) throw new ExtractionError(`Request too large for ${cfg.name}'s free tier (8000 token limit). Try a smaller image or wait 60 seconds. Or use Manual Entry instead.`, 503, 'IMAGE_TOO_LARGE');
//     if (response.status === 429) throw new ExtractionError(`Rate limit reached on ${cfg.name}. Try again in 30 seconds or use a different provider.`, 429, 'RATE_LIMIT');
//     if (response.status === 400 || response.status === 422) throw new ExtractionError(`Model "${model}" not supported or bad request on ${cfg.name}. Try model: ${cfg.altModel || cfg.defaultModel}. Details: ${errBody.slice(0, 200)}`, 503, 'BAD_REQUEST');
//     if (response.status >= 500) throw new ExtractionError(`${cfg.name} server error (${response.status}). Try again later.`, 503, 'PROVIDER_ERROR');
//     throw new ExtractionError(`AI extraction failed (${response.status}): ${errBody.slice(0, 150)}`, 503, 'PROVIDER_ERROR');
//   }

//   const data = await response.json();
//   const content = data.choices?.[0]?.message?.content;
//   if (!content) throw new ExtractionError('AI returned empty response', 503, 'EMPTY_RESPONSE');

//   return parseAIResponse(content);
// }

// // Wrapper for groq alt model retry
// async function extractWithGroqAlt(base64Data, mimeType) {
//   const apiKey = process.env.INVOICE_AI_API_KEY;
//   const baseUrl = (process.env.INVOICE_AI_BASE_URL || PROVIDERS.groq.baseUrl).replace(/\/+$/, '');
//   const model = PROVIDERS.groq.altModel;

//   const imageContent = {
//     type: 'image_url',
//     image_url: { url: `data:${mimeType};base64,${base64Data}` },
//   };

//   const response = await fetch(`${baseUrl}/chat/completions`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify({
//       model,
//       messages: [
//         { role: 'system', content: EXTRACTION_SCHEMA },
//         {
//           role: 'user',
//           content: [
//             { type: 'text', text: 'Extract invoice data. Return JSON only.' },
//             imageContent,
//           ],
//         },
//       ],
//       max_tokens: 8192,
//       temperature: 0.1,
//     }),
//     signal: AbortSignal.timeout(90000),
//   });

//   if (!response.ok) {
//     const errBody = await response.text().catch(() => '');
//     console.error(`[InvoiceAI] Groq alt model failed:`, errBody);
//     throw new ExtractionError(`Both Groq models failed. Try a different provider or use Manual Entry instead. Details: ${errBody.slice(0, 200)}`, 503, 'PROVIDER_ERROR');
//   }

//   const data = await response.json();
//   const content = data.choices?.[0]?.message?.content;
//   if (!content) throw new ExtractionError('AI returned empty response', 503, 'EMPTY_RESPONSE');

//   return parseAIResponse(content);
// }

// // ─── Main extraction entry point ────────────────────────────────
// const extractInvoice = async (filePath) => {
//   if (!fs.existsSync(filePath)) {
//     throw new ExtractionError('Uploaded file not found', 404, 'FILE_NOT_FOUND');
//   }

//   const provider = process.env.INVOICE_AI_PROVIDER || 'groq';

//   // Check if API key exists
//   if (!process.env.INVOICE_AI_API_KEY) {
//     throw new AINotConfiguredError();
//   }

//   const base64Data = readFileAsBase64(filePath);
//   const mimeType = getMimeType(filePath);

//   let result;

//   result = await extractWithProvider(base64Data, mimeType, provider);

//   if (!result || !result.invoice || !result.items) {
//     throw new ExtractionError('AI returned invalid data structure', 503, 'INVALID_STRUCTURE');
//   }

//   if (!result.items || result.items.length === 0) {
//     throw new ExtractionError('No products could be detected in the invoice. Please ensure the invoice contains a clear product table, or use Manual Entry.', 422, 'NO_PRODUCTS');
//   }

//   return result;
// };

// // ─── Get provider info (for frontend setup guide) ───────────────
// const getProviderInfo = () => {
//   const provider = process.env.INVOICE_AI_PROVIDER || 'groq';
//   const cfg = PROVIDERS[provider] || PROVIDERS.groq;
//   const isConfigured = !!process.env.INVOICE_AI_API_KEY;
//   return {
//     provider,
//     configured: isConfigured,
//     providerName: cfg.name,
//     signupUrl: cfg.signupUrl,
//     defaultModel: cfg.defaultModel,
//     model: process.env.INVOICE_AI_MODEL || cfg.defaultModel,
//     allProviders: Object.entries(PROVIDERS).map(([key, val]) => ({
//       key,
//       name: val.name,
//       signupUrl: val.signupUrl,
//       defaultModel: val.defaultModel,
//       isFree: key === 'groq',
//     })),
//   };
// };

// module.exports = { extractInvoice, ExtractionError, AINotConfiguredError, getProviderInfo };
const fs = require('fs');
const path = require('path');

// ─── Provider Configs ───────────────────────────────────────────
const PROVIDERS = {
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'qwen/qwen3.6-27b',
    altModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
    supportsDetail: false,
    signupUrl: 'https://console.groq.com/keys',
    name: 'Groq (Free)',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    supportsDetail: true,
    signupUrl: 'https://platform.openai.com/api-keys',
    name: 'OpenAI',
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-3.5-flash-lite',
    supportsDetail: false,
    signupUrl: 'https://aistudio.google.com/apikey',
    name: 'Google Gemini',
  },
};

class ExtractionError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'EXTRACTION_ERROR';
  }
}

class AINotConfiguredError extends Error {
  constructor() {
    const provider = process.env.INVOICE_AI_PROVIDER || 'groq';
    const info = PROVIDERS[provider] || PROVIDERS.groq;
    const msg =
      `AI is not configured. Add these to your .env file:\n` +
      `INVOICE_AI_PROVIDER=${provider}\n` +
      `INVOICE_AI_API_KEY=your_api_key_here\n` +
      `\nGet a FREE API key from ${info.name}: ${info.signupUrl}`;
    super(msg);
    this.statusCode = 503;
    this.code = 'AI_NOT_CONFIGURED';
  }
}

const EXTRACTION_SCHEMA = `Extract ALL data from this Indian GST invoice image. Return ONLY valid JSON.

IMPORTANT: Fill EVERY field. Do not leave any field empty or null if the value is visible in the image.
- supplierName: full supplier/company name
- supplierGSTIN: supplier's GST identification number
- supplierPhone: supplier's phone number
- supplierEmail: supplier's email if visible
- billingAddress: buyer/billed-to address
- shippingAddress: ship-to address if different
- All monetary values as numbers only (no Rs symbol, no commas)
- product names exactly as on invoice
- Determine if CGST+SGST (intra-state) or IGST (inter-state)

JSON:
{"invoice":{"invoiceNumber":"","invoiceDate":"YYYY-MM-DD","supplierName":"","supplierGSTIN":"","supplierPhone":"","supplierEmail":"","billingAddress":"","shippingAddress":"","subtotal":0,"discount":0,"cgst":0,"sgst":0,"igst":0,"otherCharges":0,"roundOff":0,"grandTotal":0},"items":[{"productName":"","sku":"","barcode":"","hsnCode":"","quantity":0,"unit":"","purchasePrice":0,"discount":0,"taxRate":0,"taxAmount":0,"lineTotal":0,"confidence":{"productName":0,"sku":0,"quantity":0,"purchasePrice":0,"taxRate":0}}]}`;

// Read file as base64, with size check for model limits
function readFileAsBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  // Check raw file size (base64 will be ~33% larger)
  const maxSizeBytes = 4 * 1024 * 1024; // 4MB raw = ~5.3MB base64
  if (fileBuffer.length > maxSizeBytes) {
    throw new ExtractionError(
      `Image file is too large (${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB). Please use an image under 4MB, or compress it first. You can also use Manual Entry instead.`,
      503,
      'FILE_TOO_LARGE'
    );
  }
  return fileBuffer.toString('base64');
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

function parseAIResponse(text) {
  let cleaned = text.trim();

  // Strip Qwen/OpenAI thinking tags: <think>...</think> or 💭...💭
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
  cleaned = cleaned.replace(/💭[\s\S]*?💭/g, '');

  // Strip markdown code blocks
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  // Find the first { and last } to extract just the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

// ─── OpenAI-compatible extraction (works for Groq, OpenAI, Gemini) ─
async function extractWithProvider(base64Data, mimeType, providerKey) {
  const cfg = PROVIDERS[providerKey];
  if (!cfg) throw new ExtractionError(`Unknown provider: ${providerKey}`, 503, 'UNKNOWN_PROVIDER');

  const apiKey = process.env.INVOICE_AI_API_KEY;
  if (!apiKey) throw new AINotConfiguredError();

  // Only use INVOICE_AI_MODEL override if it matches the current provider's models
  // This prevents stale env vars from sending wrong model to wrong provider
  const envModel = process.env.INVOICE_AI_MODEL;
  const model = (envModel && providerKey === 'openai') ? envModel : cfg.defaultModel;
  const baseUrl = (process.env.INVOICE_AI_BASE_URL || cfg.baseUrl).replace(/\/+$/, '');

  // Build image content
  const imageContent = {
    type: 'image_url',
    image_url: { url: `data:${mimeType};base64,${base64Data}` },
  };

  // Only add 'detail' for actual OpenAI
  if (cfg.supportsDetail && !process.env.INVOICE_AI_BASE_URL) {
    imageContent.image_url.detail = 'high';
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: EXTRACTION_SCHEMA },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract invoice data. Return JSON only.' },
            imageContent,
          ],
        },
      ],
      max_tokens: 8192,
      temperature: 0.1,
    }),
    signal: AbortSignal.timeout(90000),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    console.error(`[InvoiceAI] Provider: ${providerKey}, Model: ${model}, Status: ${response.status}`, errBody);

    // Groq-specific: if primary model fails with 400/422, try alt model
    if (providerKey === 'groq' && cfg.altModel && model === cfg.defaultModel && (response.status === 400 || response.status === 422)) {
      console.log(`[InvoiceAI] Retrying with alt model: ${cfg.altModel}`);
      return extractWithGroqAlt(base64Data, mimeType);
    }

    if (response.status === 401) throw new ExtractionError(`Invalid API key for ${cfg.name}. Check INVOICE_AI_API_KEY. Get one at ${cfg.signupUrl}`, 503, 'INVALID_API_KEY');
    if (response.status === 413) throw new ExtractionError(`Request too large for ${cfg.name}'s free tier (8000 token limit). Try a smaller image or wait 60 seconds. Or use Manual Entry instead.`, 503, 'IMAGE_TOO_LARGE');
    if (response.status === 429) throw new ExtractionError(`Rate limit reached on ${cfg.name}. Try again in 30 seconds or use a different provider.`, 429, 'RATE_LIMIT');
    if (response.status === 400 || response.status === 422) throw new ExtractionError(`Model "${model}" not supported or bad request on ${cfg.name}. Try model: ${cfg.altModel || cfg.defaultModel}. Details: ${errBody.slice(0, 200)}`, 503, 'BAD_REQUEST');
    if (response.status >= 500) throw new ExtractionError(`${cfg.name} server error (${response.status}). Try again later.`, 503, 'PROVIDER_ERROR');
    throw new ExtractionError(`AI extraction failed (${response.status}): ${errBody.slice(0, 150)}`, 503, 'PROVIDER_ERROR');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new ExtractionError('AI returned empty response', 503, 'EMPTY_RESPONSE');

  return parseAIResponse(content);
}

// Wrapper for groq alt model retry
async function extractWithGroqAlt(base64Data, mimeType) {
  const apiKey = process.env.INVOICE_AI_API_KEY;
  const baseUrl = (process.env.INVOICE_AI_BASE_URL || PROVIDERS.groq.baseUrl).replace(/\/+$/, '');
  const model = PROVIDERS.groq.altModel;

  const imageContent = {
    type: 'image_url',
    image_url: { url: `data:${mimeType};base64,${base64Data}` },
  };

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: EXTRACTION_SCHEMA },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract invoice data. Return JSON only.' },
            imageContent,
          ],
        },
      ],
      max_tokens: 8192,
      temperature: 0.1,
    }),
    signal: AbortSignal.timeout(90000),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    console.error(`[InvoiceAI] Groq alt model failed:`, errBody);
    throw new ExtractionError(`Both Groq models failed. Try a different provider or use Manual Entry instead. Details: ${errBody.slice(0, 200)}`, 503, 'PROVIDER_ERROR');
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new ExtractionError('AI returned empty response', 503, 'EMPTY_RESPONSE');

  return parseAIResponse(content);
}

// ─── Main extraction entry point ────────────────────────────────
const extractInvoice = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new ExtractionError('Uploaded file not found', 404, 'FILE_NOT_FOUND');
  }

  const provider = process.env.INVOICE_AI_PROVIDER || 'groq';

  // Check if API key exists
  if (!process.env.INVOICE_AI_API_KEY) {
    throw new AINotConfiguredError();
  }

  const base64Data = readFileAsBase64(filePath);
  const mimeType = getMimeType(filePath);

  let result;

  result = await extractWithProvider(base64Data, mimeType, provider);

  if (!result || !result.invoice || !result.items) {
    throw new ExtractionError('AI returned invalid data structure', 503, 'INVALID_STRUCTURE');
  }

  if (!result.items || result.items.length === 0) {
    throw new ExtractionError('No products could be detected in the invoice. Please ensure the invoice contains a clear product table, or use Manual Entry.', 422, 'NO_PRODUCTS');
  }

  // Normalize extracted data (AI may return inconsistent casing, etc.)
  const VALID_UNITS = ['pcs', 'kg', 'ltr', 'm', 'box'];
  for (const item of result.items) {
    if (item.unit) {
      const lowered = item.unit.toLowerCase();
      item.unit = VALID_UNITS.includes(lowered) ? lowered : 'pcs';
    }
    // Ensure numeric fields are numbers
    item.quantity = Number(item.quantity) || 0;
    item.purchasePrice = Number(item.purchasePrice) || 0;
    item.taxRate = Number(item.taxRate) || 0;
    item.taxAmount = Number(item.taxAmount) || 0;
    item.lineTotal = Number(item.lineTotal) || 0;
  }

  // Normalize invoice amounts
  const inv = result.invoice;
  for (const field of ['subtotal', 'discount', 'cgst', 'sgst', 'igst', 'otherCharges', 'roundOff', 'grandTotal']) {
    if (inv[field] != null) inv[field] = Number(inv[field]) || 0;
  }

  return result;
};

// ─── Get provider info (for frontend setup guide) ───────────────
const getProviderInfo = () => {
  const provider = process.env.INVOICE_AI_PROVIDER || 'groq';
  const cfg = PROVIDERS[provider] || PROVIDERS.groq;
  const isConfigured = !!process.env.INVOICE_AI_API_KEY;
  return {
    provider,
    configured: isConfigured,
    providerName: cfg.name,
    signupUrl: cfg.signupUrl,
    defaultModel: cfg.defaultModel,
    model: process.env.INVOICE_AI_MODEL || cfg.defaultModel,
    allProviders: Object.entries(PROVIDERS).map(([key, val]) => ({
      key,
      name: val.name,
      signupUrl: val.signupUrl,
      defaultModel: val.defaultModel,
      isFree: key === 'groq',
    })),
  };
};

module.exports = { extractInvoice, ExtractionError, AINotConfiguredError, getProviderInfo };
