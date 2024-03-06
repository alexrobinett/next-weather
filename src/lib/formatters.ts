
export function removeTrailingNumbers(input: string): string {
    if (!input) return "";
    const regex = /\.\d+/;
    return input.replace(regex, "");
}

