import { writable, get } from "svelte/store";

export interface AIModel {
  id: string;
  name: string;
  provider: "openai" | "gemini" | "anthropic" | "custom";
  description: string;
}

export interface AIConfig {
  provider: "openai" | "gemini" | "anthropic" | "custom";
  apiKey: string;
  endpointUrl: string;
  selectedModel: string;
  isConfigured: boolean;
}

export const DEFAULT_AI_MODELS: AIModel[] = [
  { id: "gpt-4o", name: "GPT-4o", provider: "openai", description: "Most capable OpenAI model for complex tasks" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai", description: "Fast, lightweight model for everyday tasks" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "gemini", description: "Google's premium multimodal model" },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "gemini", description: "Google's ultra-fast efficient model" },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "anthropic", description: "Anthropic's most intelligent model" },
  { id: "claude-3-5-haiku", name: "Claude 3.5 Haiku", provider: "anthropic", description: "Anthropic's fastest model" },
  { id: "deepseek-chat", name: "DeepSeek V3", provider: "custom", description: "DeepSeek reasoning & code intelligence" },
  { id: "deepseek-reasoner", name: "DeepSeek R1", provider: "custom", description: "DeepSeek R1 reasoning model" }
];

const STORAGE_KEY = "lumea_ai_config";

const initialConfig: AIConfig = {
  provider: "openai",
  apiKey: "",
  endpointUrl: "https://api.openai.com/v1",
  selectedModel: "gpt-4o-mini",
  isConfigured: false
};

function createAIStore() {
  const { subscribe, set, update } = writable<AIConfig>(initialConfig);

  return {
    subscribe,
    init: () => {
      if (typeof window === "undefined") return;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          set({
            ...parsed,
            isConfigured: !!parsed.apiKey
          });
        }
      } catch (e) {
        console.error("Failed to load AI config from localStorage", e);
      }
    },
    save: (config: Partial<AIConfig>) => {
      update(curr => {
        const updated = {
          ...curr,
          ...config,
          isConfigured: !!(config.apiKey ?? curr.apiKey)
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    },
    reset: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      set(initialConfig);
    }
  };
}

export const aiStore = createAIStore();

export async function testAIConnection(config: Partial<AIConfig>): Promise<{ success: boolean; message: string }> {
  const apiKey = config.apiKey?.trim();
  if (!apiKey) {
    return { success: false, message: "API Key tidak boleh kosong" };
  }

  const endpoint = config.endpointUrl?.trim() || "https://api.openai.com/v1";
  const provider = config.provider || "openai";

  try {
    if (provider === "gemini") {
      const res = await fetch(`${endpoint}/models?key=${apiKey}`);
      if (res.ok) {
        return { success: true, message: "Koneksi Google Gemini API Berhasil!" };
      }
      return { success: false, message: `Error (${res.status}): ${res.statusText}` };
    } else {
      // OpenAI / Custom OpenAI-compatible endpoint
      const res = await fetch(`${endpoint.replace(/\/$/, "")}/models`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });
      if (res.ok) {
        return { success: true, message: "Koneksi AI Provider API Berhasil!" };
      }
      return { success: false, message: `Gagal terhubung (${res.status}): Cek kembali API Key / Endpoint URL.` };
    }
  } catch (err: any) {
    return { success: false, message: `Connection error: ${err.message || "Gagal menghubungi endpoint"}` };
  }
}

export async function generateAPISIXAIRecommendation(prompt: string, contextRoutes: any[] = []): Promise<{
  recommendation: string;
  suggestedRoute?: any;
  suggestedPlugins?: Record<string, any>;
}> {
  const config = get(aiStore);
  if (!config.apiKey) {
    throw new Error("AI API Key belum dikonfigurasi. Silakan atur API Key di menu Settings AI.");
  }

  const systemPrompt = `Anda adalah APISIX Gateway Expert & API Security Consultant. 
Tugas Anda adalah membantu pengguna membuat dan mengoptimalkan konfigurasi APISIX Routes, Upstreams, dan Security Plugins (seperti rate-limiting, key-auth, cors, prometheus, ip-restriction).

Respons Anda HARUS memuat:
1. Penjelasan singkat teknis (1-2 paragraf).
2. Kode konfigurasi JSON rute/plugin APISIX yang siap pakai.

Format JSON APISIX Route:
\`\`\`json
{
  "uri": "/api/v1/resource",
  "name": "nama-rute",
  "methods": ["GET", "POST"],
  "plugins": {
    "limit-req": {
      "rate": 10,
      "burst": 5,
      "rejected_code": 429,
      "key_type": "var",
      "key": "remote_addr"
    }
  },
  "upstream": {
    "type": "roundrobin",
    "nodes": {
      "httpbin.org:80": 1
    }
  }
}
\`\`\``;

  const endpoint = config.endpointUrl.replace(/\/$/, "");

  if (config.provider === "gemini") {
    const url = `${endpoint}/models/${config.selectedModel}:generateContent?key=${config.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nUSER PROMPT: ${prompt}\nCONTEXT ROUTES: ${JSON.stringify(contextRoutes.slice(0, 5))}` }] }
        ]
      })
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Gemini API Error (${res.status})`);
    }
    const data = await res.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada respon dari Gemini.";
    return parseAIReply(replyText);
  } else {
    // OpenAI / Compatible
    const res = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.selectedModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${prompt}\n\nContext existing routes: ${JSON.stringify(contextRoutes.slice(0, 5))}` }
        ],
        temperature: 0.3
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `AI Provider API Error (${res.status})`);
    }

    const data = await res.json();
    const replyText = data.choices?.[0]?.message?.content || "Tidak ada respon dari AI.";
    return parseAIReply(replyText);
  }
}

function parseAIReply(replyText: string): { recommendation: string; suggestedRoute?: any; suggestedPlugins?: Record<string, any> } {
  let jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
  let parsedJson: any = null;

  if (jsonMatch && jsonMatch[1]) {
    try {
      parsedJson = JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.warn("Could not parse JSON block from AI output", e);
    }
  }

  return {
    recommendation: replyText,
    suggestedRoute: parsedJson?.uri ? parsedJson : undefined,
    suggestedPlugins: parsedJson?.plugins || (parsedJson && !parsedJson.uri ? parsedJson : undefined)
  };
}
