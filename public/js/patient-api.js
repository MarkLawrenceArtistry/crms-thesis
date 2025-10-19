
export async function searchPatients(searchStr) {
    const response = await fetch(`/api/patients/search?name=${encodeURIComponent(searchStr)}`)
    if(!response.ok) {
        throw new Error('Failed to search patients.')
    }
    
    const result = await response.json()
    if(!result.success) {
        throw new Error(result.data)
    }

    return result.data
}

export async function fetchPatients() {
    const response = await fetch('/api/patients')
    if(!response.ok) {
        throw new Error('Failed to fetch patients.')
    }

    const result = await response.json()
    if(!result.success) {
        throw new Error(result.data)
    }

    return result.data
}

export async function updatePatient(patientData, patientId) {
    const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
    })
    if(!response.ok) {
        throw new Error('Failed to update patient.')
    }

    const result = await response.json()
    if(!result.success) {
        throw new Error(result.data)
    }

    return result.data
}

export async function addPatient(patientData) {
    const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
    })
    if(!response.ok) {
        throw new Error('Failed to add patient.')
    }

    const result = await response.json()
    if(!result.success) {
        throw new Error(result.data)
    }

    return result.data
}

export async function deletePatient(patientId) {
    const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
    if(!response.ok) {
        throw new Error('Failed to delete patient.')
    }

    const result = await response.json()
    if(!result.success) {
        throw new Error(result.data)
    }

    return result.data
}