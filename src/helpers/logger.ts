export const logger = (
    message: any

): void => {
    try {
        console.log(`|${new Date().toLocaleString()}| *** ${typeof message === 'string' ? message : JSON.stringify(message, null, 2)}`)
    } catch (err) {
        console.error(err);
    }

}