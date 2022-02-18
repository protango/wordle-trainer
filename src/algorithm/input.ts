import readline from 'readline';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

export async function prompt(query: string, validator?: (input: string) => string | undefined): Promise<string>{
    let result: string | undefined;
    do {
        result = await new Promise<string>((resolve) => rl.question(query, resolve));
        const errorMessage = validator && validator(result);
        if (errorMessage) {
            console.error(errorMessage);
            result = undefined;
        }
    } while (!result);
    return result;
}