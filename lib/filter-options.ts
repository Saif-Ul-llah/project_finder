// Shared filter option lists for the Opportunities and Suggestions pages.
// Kept as plain arrays (not backend-driven) since these are fixed, known
// vocabularies — same reasoning as MODELS_BY_PROVIDER in the API keys page.

// Currency filtering matches the literal symbol stored as the prefix of
// budget_raw (e.g. "$50 - $100", "₹12500"). Symbols aren't unique per
// currency (e.g. "$" covers USD/CAD/AUD/SGD as stored by the source
// platforms), so this filters by symbol, not a resolved currency code.
export const CURRENCIES: { label: string; value: string }[] = [
  { label: 'All Currencies', value: '' },
  { label: 'USD ($)', value: '$' },
  { label: 'GBP (£)', value: '£' },
  { label: 'EUR (€)', value: '€' },
  { label: 'INR (₹)', value: '₹' },
  { label: 'PKR (₨)', value: '₨' },
  { label: 'JPY/CNY (¥)', value: '¥' },
  { label: 'KRW (₩)', value: '₩' },
  { label: 'NGN (₦)', value: '₦' },
  { label: 'PHP (₱)', value: '₱' },
  { label: 'VND (₫)', value: '₫' },
  { label: 'THB (฿)', value: '฿' },
  { label: 'UAH (₴)', value: '₴' },
  { label: 'TRY (₺)', value: '₺' },
  { label: 'ILS (₪)', value: '₪' },
  { label: 'RUB (₽)', value: '₽' },
  { label: 'BRL (R$)', value: 'R$' },
  { label: 'AUD (A$)', value: 'A$' },
  { label: 'CAD (C$)', value: 'C$' },
  { label: 'SGD (S$)', value: 'S$' },
  { label: 'HKD (HK$)', value: 'HK$' },
  { label: 'NZD (NZ$)', value: 'NZ$' },
  { label: 'MXN (Mex$)', value: 'Mex$' },
  { label: 'ZAR (R)', value: 'R' },
  { label: 'IDR (Rp)', value: 'Rp' },
  { label: 'CHF', value: 'CHF' },
];

export const EXPERIENCE_LEVELS: { label: string; value: string }[] = [
  { label: 'All Experience Levels', value: '' },
  { label: 'Entry', value: 'Entry' },
  { label: 'Intermediate', value: 'Intermediate' },
  { label: 'Expert', value: 'Expert' },
];

// Matched with icontains against time_duration, which often combines
// duration + hours/week (e.g. "1 to 3 months, Less than 30 hrs/week") — so
// a substring match is what actually works here, not an exact match.
export const PROJECT_LENGTHS: { label: string; value: string }[] = [
  { label: 'All Durations', value: '' },
  { label: 'Less than 1 month', value: 'Less than 1 month' },
  { label: '1 to 3 months', value: '1 to 3 months' },
  { label: '3 to 6 months', value: '3 to 6 months' },
  { label: 'More than 6 months', value: 'More than 6 months' },
];

// Project type acts as a keyword filter against title + description.
// Values are sent to the backend as ?project_type=<value> and matched
// with icontains so jobs mentioning "ERP" or "CRM" are surfaced.
export const PROJECT_TYPES: { label: string; value: string }[] = [
  { label: 'All Types', value: '' },
  { label: 'ERP', value: 'ERP' },
  { label: 'CRM', value: 'CRM' },
  { label: 'E-Commerce', value: 'e-commerce' },
  { label: 'SaaS / Web App', value: 'SaaS' },
  { label: 'Mobile App', value: 'mobile app' },
  { label: 'Data Analytics / BI', value: 'analytics' },
  { label: 'AI / ML', value: 'machine learning' },
  { label: 'Automation / Scraping', value: 'automation' },
  { label: 'API Integration', value: 'API integration' },
  { label: 'DevOps / Infrastructure', value: 'DevOps' },
];

// Tech stack is matched with icontains against the tech_stack JSONField
// stored as a JSON array of strings (e.g. ["Django", "PostgreSQL"]).
export const TECH_STACKS: { label: string; value: string }[] = [
  { label: 'All Tech Stacks', value: '' },
  { label: 'Django', value: 'Django' },
  { label: 'MS Dynamics', value: 'Dynamics' },
  { label: 'Odoo', value: 'Odoo' },
  { label: 'SAP', value: 'SAP' },
  { label: 'React', value: 'React' },
  { label: 'Next.js', value: 'Next.js' },
  { label: 'Node.js', value: 'Node.js' },
  { label: 'Python', value: 'Python' },
  { label: 'Laravel / PHP', value: 'Laravel' },
  { label: 'Vue.js', value: 'Vue' },
  { label: 'Flutter', value: 'Flutter' },
  { label: 'WordPress', value: 'WordPress' },
  { label: 'Shopify', value: 'Shopify' },
  { label: 'PostgreSQL', value: 'PostgreSQL' },
  { label: 'MongoDB', value: 'MongoDB' },
  { label: 'AWS', value: 'AWS' },
  { label: 'Docker / Kubernetes', value: 'Docker' },
  { label: 'Salesforce', value: 'Salesforce' },
  { label: 'Power BI', value: 'Power BI' },
];
