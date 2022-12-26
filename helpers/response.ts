export const response = (statusCode: number, body: unknown) => ({
    statusCode,
    body: typeof body === 'string' ? body : JSON.stringify(body)
})
