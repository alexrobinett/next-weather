// help me write a formatter to remove any trailing numbers after a period

export function removeTrailingNumbers(input: string): string {
  return input.replace(/\.\d+$/, "");
}