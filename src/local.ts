/*
 * run locally for dev purposed
 */

import process from "node:process";
import { runTest } from "@regexplanet/common";
import { type getVersionFn } from "./types.js";
import { server } from "./server.js";

const getVersion:getVersionFn = () =>
{
    return {
        version: process.version,
    };
}

server({
    engineCode: "nodejs-local",
    engineName: "Node.js (local)",
    engineRepo: "regexplanet-template",
    getVersion,
    runTest,
});
