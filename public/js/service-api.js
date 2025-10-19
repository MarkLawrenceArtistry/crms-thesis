export async function fetchServices() {
    const response = await fetch('/api/services');
    if (!response.ok) throw new Error('Failed to fetch services.');
    const result = await response.json();
    if (!result.success) throw new Error(result.data);
    return result.data;
}

export async function addService(serviceData) {
    const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
    });
    if (!response.ok) throw new Error('Failed to add service.');
    const result = await response.json();
    if (!result.success) throw new Error(result.data);
    return result.data;
}

export async function updateService(id, serviceData) {
    const response = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
    });
    if (!response.ok) throw new Error('Failed to update service.');
    const result = await response.json();
    if (!result.success) throw new Error(result.data);
    return result.data;
}

export async function deleteService(id) {
    const response = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete service.');
    const result = await response.json();
    if (!result.success) throw new Error(result.data);
    return result.data;
}