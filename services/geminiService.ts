
import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData } from "../types";

const parseGeminiResponse = (responseText: string): InvoiceData => {
  try {
    // The response might be wrapped in markdown code blocks
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText) as InvoiceData;
  } catch (e) {
    console.error("JSON Parsing Error:", e);
    throw new Error("Falha ao processar resposta da IA.");
  }
};

export const extractInvoiceData = async (fileBase64: string, mimeType: string): Promise<InvoiceData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Schema definition for Type Safety in extraction
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
          document: { type: Type.STRING, description: "CNPJ or CPF unformatted" },
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
          document: { type: Type.STRING, description: "CNPJ or CPF unformatted" },
          address: { type: Type.STRING },
          city: { type: Type.STRING },
          state: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
        }
      },
      description: { type: Type.STRING, description: "Discriminação dos serviços" },
      activityCode: { type: Type.STRING, description: "Código do serviço / CNAE" },
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
            text: `Analise este documento fiscal (NFS-e ou Recibo) brasileiro. 
            Extraia todos os campos possíveis com precisão. 
            Normalizar:
            - Datas para YYYY-MM-DD
            - Valores numéricos (float)
            - Remover formatação de CPF/CNPJ
            Se um campo não existir, retorne null.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (!response.text) {
      throw new Error("No text returned from API");
    }

    const data = parseGeminiResponse(response.text);

    // Validation: Access Key (Chave de Acesso)
    if (data.accessKey) {
      let cleanKey = data.accessKey.replace(/\D/g, '');
      
      // Handle OCR noise where it captures adjacent numbers
      if (cleanKey.length > 44) {
        cleanKey = cleanKey.substring(0, 44);
      }

      data.accessKey = cleanKey;
    }

    return data;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
