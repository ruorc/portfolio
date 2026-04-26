export async function getHash(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simulate network latency
export async function simulateLatency() {
    await new Promise(resolve => setTimeout(resolve, 1000));
}
