/**
 * Utility to convert numbers to words in the Indian Numbering System (Lakh, Crore).
 */
export function numberToWords(num: number | string): string {
  if (num === '' || num === null || num === undefined) return '';
  const n = parseInt(num.toString());
  if (isNaN(n)) return '';
  if (n === 0) return 'Zero';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teenDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const doubleDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (num: number): string => {
    if (num < 10) return singleDigits[num];
    if (num < 20) return teenDigits[num - 10];
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    return doubleDigits[tens] + (ones !== 0 ? ' ' + singleDigits[ones] : '');
  };

  const convertThreeDigits = (num: number): string => {
    const hundreds = Math.floor(num / 100);
    const rest = num % 100;
    let res = '';
    if (hundreds !== 0) {
      res += singleDigits[hundreds] + ' Hundred';
    }
    if (rest !== 0) {
      if (res !== '') res += ' and ';
      res += convertTwoDigits(rest);
    }
    return res;
  };

  let result = '';

  // Crores
  const crores = Math.floor(n / 10000000);
  if (crores !== 0) {
    result += (crores < 100 ? convertTwoDigits(crores) : numberToWords(crores)) + ' Crore ';
  }

  // Lakhs
  const lakhs = Math.floor((n % 10000000) / 100000);
  if (lakhs !== 0) {
    result += convertTwoDigits(lakhs) + ' Lakh ';
  }

  // Thousands
  const thousands = Math.floor((n % 100000) / 1000);
  if (thousands !== 0) {
    result += convertTwoDigits(thousands) + ' Thousand ';
  }

  // Hundreds & Below
  const rest = n % 1000;
  if (rest !== 0) {
    result += convertThreeDigits(rest);
  }

  return result.trim();
}
