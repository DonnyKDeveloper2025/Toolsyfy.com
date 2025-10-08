import { GoogleGenAI, GenerateContentResponse, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { Context } from "@netlify/functions";

export const config = {
  path: "/api/generate",
  runtime: "nodejs18.x",
};

// --- Security Constants ---
const MAX_PROMPT_LENGTH = 5000; // Max characters for a prompt to prevent abuse

export default async (req: Request, context: Context): Promise<Response> => {
  // --- 1. CORS (Cross-Origin Resource Sharing) Validation ---
  const whitelist = [
    'https://www.toolsyfy.com', // Production domain
  ];
  if (process.env.URL) {
    whitelist.push(process.env.URL); // Add Netlify's deploy preview URL if it exists
  }

  const requestOrigin = req.headers.get("Origin");
  const corsHeaders: { [key: string]: string } = {};
  let isAllowed = false;

  if (requestOrigin) {
      const originHostname = new URL(requestOrigin).hostname;
      // Allow any localhost or 127.0.0.1 during development, regardless of port
      if (originHostname === 'localhost' || originHostname === '127.0.0.1') {
          isAllowed = true;
      } else if (whitelist.includes(requestOrigin)) {
          isAllowed = true;
      }
  }

  if (isAllowed && requestOrigin) {
    corsHeaders['Access-Control-Allow-Origin'] = requestOrigin;
    corsHeaders['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type';
    corsHeaders['Vary'] = 'Origin';
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
  }
  
  // For non-OPTIONS requests, reject if origin is present but not allowed
  if (requestOrigin && !isAllowed) {
    return new Response(JSON.stringify({ error: "Forbidden: Invalid origin" }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // --- 2. Main API Logic ---
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    const body = await req.json();
    const { contents, config: modelConfig } = body;

    // --- 3. Input Validation ---
    if (!contents || (typeof contents === 'string' && contents.trim() === '')) {
      return new Response(JSON.stringify({ error: '`contents` field is required and cannot be empty.' }), { status: 400, headers: corsHeaders });
    }
    if (typeof contents === 'string' && contents.length > MAX_PROMPT_LENGTH) {
      return new Response(JSON.stringify({ error: `Prompt is too long. Max ${MAX_PROMPT_LENGTH} characters.` }), { status: 400, headers: corsHeaders });
    }

    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // --- 4. Content Moderation ---
    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: modelConfig,
    });
    
    // Normalize response text: prefer response.text, otherwise try common candidate fallbacks.
    const firstCandidate = response.candidates?.[0] as unknown as Record<string, any> | undefined;
    const rawText: string = String(
      response.text ??
        firstCandidate?.content ??
        firstCandidate?.text ??
        firstCandidate?.output?.[0]?.content ??
        ''
    ).trim();

    if (!rawText && response.candidates?.[0]?.finishReason === 'SAFETY') {
      return new Response(JSON.stringify({ error: 'Response blocked due to safety concerns. Please modify your prompt.' }), { status: 400, headers: corsHeaders });
    }
    
    // --- 5. Smart Response Formatting ---
    if (modelConfig?.responseMimeType === "application/json") {
      try {
        const jsonText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
        const jsonResponse = JSON.parse(jsonText);
        return new Response(JSON.stringify(jsonResponse), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (parseError) {
        console.error("Failed to parse AI JSON response:", parseError, "Raw text:", rawText);
        return new Response(JSON.stringify({ text: rawText, error: 'Failed to parse JSON on server' }), { status: 200, headers: corsHeaders });
      }
    } else {
      return new Response(JSON.stringify({ text: rawText }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in /api/generate function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: `Failed to generate content: ${errorMessage}` }), { status: 500, headers: corsHeaders });
  }
};