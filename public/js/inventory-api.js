

export async function searchMedicine(searchStr) {
    const response = await fetch(`/api/medicines/search?name=${encodeURIComponent(searchStr)}`)
    if(!response.ok) {
        throw new Error('Failed to search medicines.')
    }
    
    const result = await response.json()
    if(!result.success) {
        throw new Error(result.data)
    }

    return result.data
}

export async function fetchMedicines() {
    const response = await fetch('/api/medicines')
    if(!response.ok) {
        throw new Error('Failed to fetch medicines.')
    }

    const result = await response.json()
    if(!result.success) {
        throw new Error(result.data)
    }

    return result.data
}

export async function addMedicine(medicineData) {
    const response = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicineData)
    })
    if(!response.ok) {
        throw new Error('Failed to add medicine.')
    }

    const result = await response.json()
    if(!result.success) {
        throw new Error(result.data)
    }

    return result.data
}

export async function deleteMedicine(medicineId) {
    const response = await fetch(`/api/medicines/${medicineId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
    if(!response.ok) {
        throw new Error('Failed to delete medicine.')
    }

    const result = await response.json()
    if(!result.success) {
        throw new Error(result.data)
    }

    return result.data
}

export async function updateMedicine(medicineId, medicineData) {
    const response = await fetch(`/api/medicines/${medicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicineData)
    })
    if(!response.ok) {
        throw new Error('Failed to update medicine.')
    }
    
    const result = await response.json()
    if(!result.success) {
        throw new Error(result.data)
    }

    return result.data
}