


export async function fetchAllAppointments() {
    const response = await fetch('/api/appointments')
    if(!response.ok) {
        throw new Error('Failed to fetch appointments.')
    }

    const result = await response.json()
    if(!result.success) {
        throw new Error(result.data)
    }

    return result.data
}