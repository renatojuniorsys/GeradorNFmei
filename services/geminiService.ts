
import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData } from "../types";

const parseGeminiResponse = (responseText: string): InvoiceData => {
  try {
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText) as InvoiceData;
  } catch (e) {
    throw new Error("Erro ao interpretar dados. Tente reenviar o arquivo.");
  }
};

export const extractInvoiceData = async (fileBase64: string, mimeType: string): Promise<InvoiceData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const entitySchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      document: { type: Type.STRING },
      municipalRegistration: { type: Type.STRING },
      address: { type: Type.STRING },
      city: { type: Type.STRING },
      state: { type: Type.STRING },
      zipCode: { type: Type.STRING },
      email: { type: Type.STRING },
      phone: { type: Type.STRING }
    },
    required: ["name", "document"]
  };

  const schema = {
    type: Type.OBJECT,
    properties: {
      number: { type: Type.STRING },
      dpsNumber: { type: Type.STRING },
      dpsSeries: { type: Type.STRING },
      issueDate: { type: Type.STRING },
      documentTitle: { type: Type.STRING },
      documentSubtitle: { type: Type.STRING },
      cityIssuer: { type: Type.STRING },
      cityDepartment: { type: Type.STRING },
      cityEmail: { type: Type.STRING },
      provider: entitySchema,
      borrower: entitySchema,
      description: { type: Type.STRING },
      activityCode: { type: Type.STRING },
      values: {
        type: Type.OBJECT,
        properties: { 
          serviceValue: { type: Type.NUMBER }, 
          discount: { type: Type.NUMBER },
          netValue: { type: Type.NUMBER } 
        },
        required: ["serviceValue", "netValue"]
      },
      accessKey: { type: Type.STRING },
      verificationCode: { type: Type.STRING }
    },
    required: ["provider", "borrower", "values", "description", "issueDate"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: mimeType, data: fileBase64 } },
        { text: "Extraia TODOS os dados desta NFS-e brasileira. Foque especialmente no CABEÇALHO institucional. IMPORTANTE: Extraia o Número da NFS-e, Competência, Número da DPS e Série da DPS. Extraia também a DATA e o HORÁRIO exato de emissão (ex: 01/05/2026 14:30). Identifique também o título do documento, o Município emissor, a Secretaria e o e-mail da prefeitura. Extraia dados de Prestador e Tomador (CNPJ, Endereço, CEP, E-mail, Telefone). Retorne apenas JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return parseGeminiResponse(response.text);
};

export const generateAiLogo = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: "Modern corporate logo for invoice system, minimalist, indigo colors, high resolution, white background" }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
  }
  throw new Error("Falha ao gerar imagem.");
};
