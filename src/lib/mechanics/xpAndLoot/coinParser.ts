export function parseCoinsToGoldNumber(coins: any): number {
  if (typeof coins === 'number') return coins;
  if (!coins) return 0;
  const str = String(coins).replace(',', '.');
  const match = str.match(/\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

export function parseCostToGold(costStr?: string): number {
  if (!costStr) return 1;
  let str = String(costStr).trim();

  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  } else if (str.includes('.')) {
    const parts = str.split('.');
    const decimalPart = parts[parts.length - 1].replace(/[^\d]/g, '');
    const firstPart = parts[0].replace(/[^\d]/g, '');

    if (firstPart === '0') {
      // keep the dot
    } else if (decimalPart.length === 3) {
      str = str.replace(/\./g, '');
    }
  }

  const match = str.match(/(\d+(?:\.\d+)?)\s*(PO|PP|PC|PL|PE)?/i);
  if (!match) return 1;
  const val = parseFloat(match[1]);
  const unit = (match[2] || 'PO').toUpperCase();

  if (unit === 'PL') return val * 10;
  if (unit === 'PO') return val;
  if (unit === 'PE') return val * 0.5;
  if (unit === 'PP') return val * 0.1;
  if (unit === 'PC') return val * 0.01;
  return val;
}
