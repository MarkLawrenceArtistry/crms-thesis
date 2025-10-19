
export async function loginUser(credentials) {
    const response = await fetch('api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    })

    if(!response.ok) {
        throw new Error('Invalid username or password.')
    }

    const result = await response.json()
    return result;
}