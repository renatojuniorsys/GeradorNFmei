
export interface EntityData {
  name: string | null;
  document: string | null; // CPF or CNPJ
  address: string | null;
  city: string | null;
  state: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface InvoiceValues {
  serviceValue: number;
  discount: number;
  netValue: number;
  taxAmount?: number;
}

export interface InvoiceData {
  number: string | null;
  series: string | null;
  accessKey: string | null;
  issueDate: string | null; // ISO Date string YYYY-MM-DD
  verificationCode: string | null;
  
  provider: EntityData; // Prestador
  borrower: EntityData; // Tomador
  
  description: string | null;
  activityCode: string | null;
  
  values: InvoiceValues;
  annotations?: string; // Base64 image data of the canvas layer
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  data: InvoiceData;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  PROCESSING = 'PROCESSING',
  PREVIEW = 'PREVIEW',
  ERROR = 'ERROR',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY'
}

export type TabView = 'INVOICE' | 'RECEIPT';

// Auth Types
export type UserRole = 'ADMIN' | 'OPERATOR';

export interface User {
  id: string;
  name: string;
  password?: string; // Stored for frontend demo purposes
  role: UserRole;
}

export interface PdfMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface AppSettings {
  logoUrl: string | null;
  qrCodeUrl: string | null;
  signatureUrl: string | null;
  pdfMargins?: PdfMargins;
}
