export function formatCurrency(value: number): string {
  return `${new Intl.NumberFormat('pt-MZ', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}).format(value)} MZN`;

}
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-MZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function cn(...classes: (string | false | undefined | null | 0)[]): string {
  return classes.filter(Boolean).join(' ');
}
