/*
 * run locally for dev purposed
 */

import process from "node:process";
import { type getVersionFn, type runTestFn } from "./types.js";
import { server } from "./server.js";

const getVersion:getVersionFn = () =>
{
    return {
        version: process.version,
    };
}

const runTest:runTestFn = (testInput) => {
    return {
        success: true,
        html: "<p>Test resuls would go here",
        message: "Template is running!",
    };
}

server({
    engineCode: "nodejs",
    engineName: "Node.js",
    engineRepo: "regexplanet-nodejs",
    getVersion,
    runTest,
});
