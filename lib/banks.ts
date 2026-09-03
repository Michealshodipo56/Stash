export interface Bank {
  name: string;
  code: string;
  category?: "commercial" | "digital" | "mfb" | "psb";
}

/**
 * Comprehensive list of Nigerian deposit money banks, merchant banks,
 * licensed digital/neobanks, microfinance banks, and payment service banks.
 */
export const NIGERIAN_BANKS: Bank[] = [
  { name: "Access Bank", code: "044", category: "commercial" },
  { name: "Access Bank (Diamond)", code: "063", category: "commercial" },
  { name: "ALAT by Wema", code: "035A", category: "digital" },
  { name: "Bowen Microfinance Bank", code: "50931", category: "mfb" },
  { name: "Carbon", code: "565", category: "digital" },
  { name: "Citibank Nigeria", code: "023", category: "commercial" },
  { name: "Dot Microfinance Bank", code: "501", category: "digital" },
  { name: "Ecobank Nigeria", code: "050", category: "commercial" },
  { name: "Eyowo", code: "50126", category: "digital" },
  { name: "FairMoney Microfinance Bank", code: "51318", category: "digital" },
  { name: "Fidelity Bank", code: "070", category: "commercial" },
  { name: "First Bank of Nigeria", code: "011", category: "commercial" },
  { name: "First City Monument Bank (FCMB)", code: "214", category: "commercial" },
  { name: "Globus Bank", code: "00103", category: "commercial" },
  { name: "Gomoney", code: "100022", category: "digital" },
  { name: "Guaranty Trust Bank (GTBank)", code: "058", category: "commercial" },
  { name: "Heritage Bank", code: "030", category: "commercial" },
  { name: "Hope Payment Service Bank", code: "120002", category: "psb" },
  { name: "Jaiz Bank", code: "301", category: "commercial" },
  { name: "Keystone Bank", code: "082", category: "commercial" },
  { name: "Kuda Bank", code: "50211", category: "digital" },
  { name: "LAPO Microfinance Bank", code: "50550", category: "mfb" },
  { name: "Lotus Bank", code: "303", category: "commercial" },
  { name: "Mint Finex MFB", code: "50304", category: "digital" },
  { name: "Moniepoint Microfinance Bank", code: "50515", category: "digital" },
  { name: "MoMo Payment Service Bank (MTN)", code: "120003", category: "psb" },
  { name: "MoneyMaster PSB (Glo)", code: "120005", category: "psb" },
  { name: "OPay Digital Services (PayCom)", code: "999992", category: "digital" },
  { name: "Optimus Bank", code: "107", category: "commercial" },
  { name: "PalmPay", code: "999991", category: "digital" },
  { name: "Parallex Bank", code: "104", category: "commercial" },
  { name: "Parkway / ReadyCash", code: "311", category: "digital" },
  { name: "Polaris Bank", code: "076", category: "commercial" },
  { name: "PremiumTrust Bank", code: "105", category: "commercial" },
  { name: "Providus Bank", code: "101", category: "commercial" },
  { name: "Raven Bank", code: "51353", category: "digital" },
  { name: "Rubies MFB", code: "125", category: "digital" },
  { name: "Safe Haven Microfinance Bank", code: "51113", category: "mfb" },
  { name: "Signature Bank", code: "106", category: "commercial" },
  { name: "SmartCash Payment Service Bank (Airtel)", code: "120004", category: "psb" },
  { name: "Sparkle Microfinance Bank", code: "51310", category: "digital" },
  { name: "Stanbic IBTC Bank", code: "221", category: "commercial" },
  { name: "Standard Chartered Bank", code: "068", category: "commercial" },
  { name: "Sterling Bank", code: "232", category: "commercial" },
  { name: "SunTrust Bank", code: "100", category: "commercial" },
  { name: "TAJBank", code: "302", category: "commercial" },
  { name: "Tangerine Money", code: "51269", category: "digital" },
  { name: "Titan Trust Bank", code: "102", category: "commercial" },
  { name: "Union Bank of Nigeria", code: "032", category: "commercial" },
  { name: "United Bank for Africa (UBA)", code: "033", category: "commercial" },
  { name: "Unity Bank", code: "215", category: "commercial" },
  { name: "VFD Microfinance Bank", code: "566", category: "digital" },
  { name: "Wema Bank", code: "035", category: "commercial" },
  { name: "Zenith Bank", code: "057", category: "commercial" },
];

export function getBankByCode(code: string): Bank | undefined {
  return NIGERIAN_BANKS.find((b) => b.code === code);
}

export function getBankByName(name: string): Bank | undefined {
  return NIGERIAN_BANKS.find((b) => b.name.toLowerCase() === name.toLowerCase());
}
