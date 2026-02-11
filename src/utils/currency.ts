export function formatCurrency(value: number, currencyCode: string = 'EUR'): string {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
        }).format(value / 100);
    } catch (error) {
        console.error(`Error formatting currency: ${currencyCode}`, error);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
        }).format(value / 100);
    }
}
