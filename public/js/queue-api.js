export async function fetchQueues(queueType) {
    const response = await fetch(`/api/queues?type=${queueType}`);
    if (!response.ok) throw new Error('Failed to fetch queues.');
    const result = await response.json();
    if (!result.success) throw new Error(result.data);
    return result.data;
}

export async function callNext(queueType, counterNumber) {
    const response = await fetch('/api/queues/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            queue_type: queueType,
            counter_number: counterNumber
        })
    });

    if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.data || 'Failed to call next patient.');
    }

    const result = await response.json();
    if (!result.success) {
        throw new Error(result.data);
    }
    return result.data;
}