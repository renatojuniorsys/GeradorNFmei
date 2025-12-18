import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData } from "../types";

const parseGeminiResponse = (responseText: string): InvoiceData => {
  try {
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText) as InvoiceData;
  } catch (e) {
    console.error("JSON Parsing Error:", e);
    throw new Error("Erro ao interpretar os dados da nota. Tente reenviar o arquivo.");
  }
};

export const extractInvoiceData = async (fileBase64: string, mimeType: string): Promise<InvoiceData> => {
  // A variável process.env.API_KEY é substituída pelo valor real pelo Vite durante o build
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY não configurada. Verifique os segredos no painel do Netlify.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const schema = {
    type: Type.OBJECT,
    properties: {
      number: { type: Type.STRING, description: "Número da Nota Fiscal" },
      series: { type: Type.STRING, description: "Série da nota" },
      accessKey: { type: Type.STRING, description: "Chave de acesso de 44 dígitos" },
      issueDate: { type: Type.STRING, description: "Data de emissão formato YYYY-MM-DD" },
      verificationCode: { type: Type.STRING, description: "Código de verificação" },
      provider: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          document: { type: Type.STRING, description: "CNPJ ou CPF (apenas dígitos)" },
          address: { type: Type.STRING },
          city: { type: Type.STRING },
          state: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
        }
      },
      borrower: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          document: { type: Type.STRING, description: "CNPJ ou CPF (apenas dígitos)" },
          address: { type: Type.STRING },
          city: { type: Type.STRING },
          state: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
        }
      },
      description: { type: Type.STRING, description: "Texto completo da discriminação do serviço" },
      activityCode: { type: Type.STRING, description: "Código de atividade/serviço" },
      values: {
        type: Type.OBJECT,
        properties: {
          serviceValue: { type: Type.NUMBER },
          discount: { type: Type.NUMBER },
          netValue: { type: Type.NUMBER },
          taxAmount: { type: Type.NUMBER }
        }
      }
    },
    required: ["provider", "borrower", "values", "description", "issueDate"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: `Atue como um OCR semântico para NFS-e do Brasil. Extraia os dados seguindo fielmente as regras fiscais. 
            Datas em YYYY-MM-DD. Valores em float. Campos inexistentes como null. 
            Não formate documentos (apenas números).`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Resposta vazia da inteligência artificial.");
    }

    const data = parseGeminiResponse(text);

    if (data.accessKey) {
      data.accessKey = data.accessKey.replace(/\D/g, '').substring(0, 44);
    }

    return data;

  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("API key")) {
       throw new Error("Erro de autenticação na API do Google. Verifique se a sua chave está ativa e possui créditos/cotas disponíveis.");
    }
    throw error;
  }
};