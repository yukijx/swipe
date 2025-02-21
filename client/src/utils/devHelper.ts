export const devLog = (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(...args);
    }
};

export const devAlert = (message: string) => {
    if (process.env.NODE_ENV === 'development') {
        alert(message);
    }
}; 