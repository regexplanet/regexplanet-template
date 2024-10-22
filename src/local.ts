/*
 * run locally for dev purposed
 */

import process from "node:process";
import { type runTestFn } from "@regexplanet/common";
import { type getVersionFn } from "./types.js";
import { server } from "./server.js";

const getVersion:getVersionFn = () =>
{
    return {
        version: process.version,
    };
}

const runTest:runTestFn = (testInput) => {
    return Promise.resolve({
        success: true,
        html: `<p>Test results would go here for pattern "${testInput.regex}" replaced by ${testInput.replacement}"</p>`,
        message: "Template is running!",
    });
}

server({
    engineCode: "nodejs-local",
    engineName: "Node.js (local)",
    engineRepo: "regexplanet-template",
    getVersion,
    runTest,
});
