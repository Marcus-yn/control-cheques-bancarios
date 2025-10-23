import { 
  Building2, 
  Landmark, 
  University, 
  CreditCard, 
  Banknote,
  Wallet,
  PiggyBank,
  Coins
} from 'lucide-react';

export const BankIcons = {
  'BAM': Building2,
  'BI': University,
  'BAC': Landmark,
  'BANRURAL': PiggyBank,
  'GYT': CreditCard,
  'PROMERICA': Banknote,
  'AZTECA': Wallet,
  'INTERNACIONAL': Building2,
  'VIVIBANCO': Coins,
  'CHN': University,
  'INMOBILIARIO': Landmark,
  'CITIBANK': CreditCard,
  'DEFAULT': Building2
};

export const StatusIcons = {
  'PENDIENTE': '🕒',
  'COBRADO': '✅',
  'ANULADO': '❌',
  'PROCESANDO': '⏳'
};

export const getRandomBankIcon = () => {
  const icons = Object.values(BankIcons);
  return icons[Math.floor(Math.random() * icons.length)];
};

export const getBankIcon = (bankName: string) => {
  if (!bankName || typeof bankName !== 'string') {
    return BankIcons.DEFAULT;
  }
  const upperName = bankName.toUpperCase();
  if (upperName.includes('INDUSTRIAL')) return BankIcons.BI;
  if (upperName.includes('AMERICA')) return BankIcons.BAC;
  if (upperName.includes('RURAL')) return BankIcons.BANRURAL;
  if (upperName.includes('AGROMERCANTIL')) return BankIcons.BAM;
  if (upperName.includes('G&T') || upperName.includes('CONTINENTAL')) return BankIcons.GYT;
  if (upperName.includes('PROMERICA')) return BankIcons.PROMERICA;
  if (upperName.includes('AZTECA')) return BankIcons.AZTECA;
  if (upperName.includes('INTERNACIONAL')) return BankIcons.INTERNACIONAL;
  if (upperName.includes('VIVI')) return BankIcons.VIVIBANCO;
  if (upperName.includes('CHN')) return BankIcons.CHN;
  if (upperName.includes('INMOBILIARIO')) return BankIcons.INMOBILIARIO;
  if (upperName.includes('CITI')) return BankIcons.CITIBANK;
  return BankIcons.DEFAULT;
};