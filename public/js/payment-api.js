export async function processPayment(paymentData) {
    const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
    });
    if (!response.ok) throw new Error('Failed to process payment.');
    const result = await response.json();
    if (!result.success) throw new Error(result.data);
    return result.data;
}