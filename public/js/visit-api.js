export async function createVisit(patientId, serviceIds) {
    const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            patient_id: patientId,
            service_ids: serviceIds
        })
    });

    if (!response.ok) {
        throw new Error('Failed to create visit.');
    }

    const result = await response.json();
    if (!result.success) {
        throw new Error(result.data);
    }
    return result.data;
}

export async function fetchVisitDetails(visitId) {
    const response = await fetch(`/api/visits/${visitId}/details`);
    if (!response.ok) throw new Error('Failed to fetch visit details.');
    const result = await response.json();
    if (!result.success) throw new Error(result.data);
    return result.data;
}