import process from "node:process";

export function getVersion(): { [key: string]: string } {
    return {
        version: process.version, //TEMPLATE: use version from the regex engine
    };
}
