export async function fetchServicesForVisit(visitId) {
    const response = await fetch(`/api/visit-services/${visitId}`);
    if (!response.ok) throw new Error('Failed to fetch services for visit.');
    const result = await response.json();
    if (!result.success) throw new Error(result.data);
    return result.data;
}

export async function updateVisitServiceStatus(visitServiceId, newStatus) {
    const response = await fetch(`/api/visit-services/${visitServiceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
    });
    if (!response.ok) throw new Error('Failed to update service status.');
    const result = await response.json();
    if (!result.success) throw new Error(result.data);
    return result.data;
}