
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
        },
        required: ["name", "document"]
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
        },
        required: ["name"]
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
        },
        required: ["serviceValue", "netValue"]
      }
    },
    required: ["provider", "borrower", "values", "description", "issueDate"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          {
            text: `Aja como um especialista em fiscal brasileiro (NFS-e). 
            Sua tarefa é ler esta Nota Fiscal de Serviço e extrair os dados com precisão absoluta.
            
            REGRAS CRÍTICAS:
            1. IDENTIFICAÇÃO: Não confunda Prestador (quem emite/vende) com Tomador (quem paga/compra).
            2. NÚMEROS: Remova formatação de CNPJ/CPF e CEP (apenas dígitos).
            3. VALORES: Use ponto para decimais.
            4. NULOS: Se um campo não existir, use null em vez de strings vazias ou "null".
            5. DESCRIÇÃO: Capture todo o texto da seção 'Discriminação dos Serviços'.
            
            Pense passo a passo antes de preencher o JSON para garantir que nomes e documentos não fiquem invertidos.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 4096 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA.");

    const data = parseGeminiResponse(text);

    if (data.accessKey) {
      data.accessKey = data.accessKey.replace(/\D/g, '').substring(0, 44);
    }

    return data;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

/**
 * Generates a professional logo using Gemini 2.5 Flash Image
 */
export const generateAiLogo = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const prompt = `Crie um logo profissional e moderno para o aplicativo 'MEI-GeradorNf'. 
  O logo deve ser inspirado no símbolo oficial da NFS-e brasileira: 
  1. Deve conter um mapa do Brasil estilizado em tons de azul suave e moderno.
  2. Um círculo elegante (verde esmeralda ou dourado) com a letra 'e' branca estilizada no centro, cruzando o mapa.
  3. Estilo 'premium corporate', clean, transmitindo confiança e eficiência tecnológica.
  4. Fundo branco puro ou transparente. 
  5. Tipografia minimalista se houver texto.
  O resultado deve parecer um ícone de aplicativo SaaS de alto nível.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("Nenhuma imagem gerada.");
  } catch (error) {
    console.error("Logo Generation Error:", error);
    throw new Error("Falha ao gerar o logo com IA.");
  }
};
