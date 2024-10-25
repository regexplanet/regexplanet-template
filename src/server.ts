import Fastify, { FastifyInstance } from "fastify";
import { fastifyFormbody } from "@fastify/formbody"
import { fastifyStatic } from "@fastify/static";
import fs from "node:fs";
import process from "node:process";

import { serverFn } from "./types.js";
import { handleJsonp } from "./handleJsonp.js";
import path from "node:path";
import { TestInput } from "@regexplanet/common";
const __dirname = path.dirname(new URL(import.meta.url).pathname);

function getArray(value:string|string[]|undefined): string[] {
    if (value === undefined) {
        return [];
    } else if (Array.isArray(value)) {
        return value;
    }
    return [value];
}

export const server: serverFn = async (props) => {
    const server: FastifyInstance = Fastify({
        logger: true,
        trustProxy: true,
    });

    server.register(fastifyFormbody);

    server.get("/", async (req, res) => {

        const data: { [key: string]: string } = {
            description: `This is the backend for testing regular expression in ${props.engineName}`,
            h1: `RegexPlanet ${props.engineName}`,
            source: `https://github.com/regexplanet/${props.engineRepo}`,
            testurl: `https://www.regexplanet.com/advanced/${props.engineCode}/index.html`,
            title: `Regexplanet Backend for ${props.engineName}`,
        };

        const raw = fs.readFileSync(path.join(__dirname, "../static/_index.html"), "utf8");
        const cooked = raw.replace(/{{(\w+)}}/g, (match, key) => {
            return data[key] || match;
        });

        res.header("Content-Type", "text/html; charset=utf-8");
        res.send(cooked);
    });

    server.get("/status.json", async (req, res) => {
        const data = {
            commit: process.env.COMMIT || "(not set)",
            fastify: `${server.version}`,
            lastmod: process.env.LASTMOD || "(not set)",
            node: `${process.version}`,
            success: true,
            tech: `NodeJS ${process.version}`,
            timestamp: new Date().toISOString(),
            ...props.getVersion(),
        };
        handleJsonp(req, res, data);
    });

    server.all("/test.json", async (req, res) => {
        console.log(req.method, req.url);

        let testInput:TestInput|null = null;
        if (req.method === "POST") {
            if (req.headers["content-type"] === "application/json") {
                testInput = req.body as TestInput;
            } else if (req.headers["content-type"] === "application/x-www-form-urlencoded") {
                const data = req.body as { [key: string]: string|string[]|undefined };
                testInput = {
                    regex: data.regex as string,
                    replacement: data.replacement as string,
                    engine: data.engine as string,
                    options: getArray(data.option),
                    inputs: getArray(data.input),
                };
            }
        } else if (req.method === "GET") {
            const searchParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
            testInput = {
                engine: searchParams.get("engine") || "unknown",
                regex: searchParams.get("regex") || "",
                replacement: searchParams.get("replacement") || "",
                options: searchParams.getAll("option") as string[],
                inputs: searchParams.getAll("input") as string[],
            };
        } else {
            handleJsonp(req, res, {
                message: "Invalid method",
                success: false,
            });
            return
        }
        if (!testInput || !testInput.regex || !testInput.regex.length) {
            handleJsonp(req, res, {
                message: "No regex provided",
                success: false,
            });
            return;
        }

        const testOutput = await props.runTest(testInput);

        handleJsonp(req, res, testOutput);
    });

    try {
        server.register(fastifyStatic, {
            root: path.join(__dirname, "../static"),
        });
        const host = process.env.HOSTNAME || "0.0.0.0";
        const port = parseInt(process.env.PORT || "5000");
        await server.listen({
            host,
            listenTextResolver: (address) => {
                return `server listening on ${address}`;
            },
            port,
        });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
