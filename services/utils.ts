/**
 * Formats a currency number to BRL (R$)
 */
export const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formats a date string to DD/MM/YYYY
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '--/--/----';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch (e) {
    return dateString;
  }
};

/**
 * Formats CNPJ or CPF
 */
export const formatDocument = (doc: string | null): string => {
  if (!doc) return 'N/A';
  const clean = doc.replace(/\D/g, '');
  
  if (clean.length === 11) { // CPF
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (clean.length === 14) { // CNPJ
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return doc;
};

/**
 * Converts a number to Portuguese words (Extenso)
 * Simplified version for SaaS Demo (Handles up to 999k)
 */
export const numberToWordsPTBR = (amount: number): string => {
  if (!amount) return 'zero reais';

  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  const convertGroup = (n: number): string => {
    let str = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (n === 100) return 'cem';
    
    if (c > 0) {
      str += hundreds[c];
      if (d > 0 || u > 0) str += ' e ';
    }

    if (d === 1) {
      str += teens[u];
    } else {
      if (d > 0) {
        str += tens[d];
        if (u > 0) str += ' e ';
      }
      if (u > 0 && d !== 1) {
        str += units[u];
      }
    }
    return str;
  };

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 100);

  let result = '';

  // Thousands
  const thousands = Math.floor(integerPart / 1000);
  const remainder = integerPart % 1000;

  if (thousands > 0) {
    if (thousands === 1) result += 'mil';
    else result += convertGroup(thousands) + ' mil';
    
    if (remainder > 0) {
      if (remainder < 100 || remainder % 100 === 0) result += ' e ';
      else result += ', ';
    }
  }

  // Hundreds/Units
  if (remainder > 0 || integerPart === 0) {
    result += convertGroup(remainder);
  }

  // Currency Name
  if (integerPart === 1) result += ' real';
  else if (integerPart > 0) result += ' reais';

  // Cents
  if (decimalPart > 0) {
    if (integerPart > 0) result += ' e ';
    result += convertGroup(decimalPart);
    if (decimalPart === 1) result += ' centavo';
    else result += ' centavos';
  }

  return result.trim();
};