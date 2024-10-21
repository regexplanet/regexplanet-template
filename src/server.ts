import Fastify, { FastifyInstance } from "fastify";
import { fastifyStatic } from "@fastify/static";
import fs from "node:fs";
import process from "node:process";

import { serverFn } from "./types.js";
import { handleJsonp } from "./handleJsonp.js";
import path from "node:path";
const __dirname = path.dirname(new URL(import.meta.url).pathname);

export const server: serverFn = async (props) => {
    const server: FastifyInstance = Fastify({
        logger: true,
        trustProxy: true,
    });

    server.get("/", async (req, res) => {

        const data: { [key: string]: string } = {
            description: `This is the backend for testing regular expression in ${props.engineName}`,
            h1: `RegexPlanet ${props.engineName}`,
            source: `https://github.com/regexplanet/${props.engineRepo}`,
            testurl: `https://www.regexplanet.com/advanced/${props.engineCode}/index.html`,
            title: `Regexplanet Backend for ${props.engineName}`,
        };

        const raw = fs.readFileSync("./static/_index.html", "utf8");
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

    try {
        server.register(fastifyStatic, {
            root: path.join(__dirname, "../static"),
        });
        const host = process.env.HOSTNAME || "0.0.0.0";
        const port = parseInt(process.env.PORT || "4000");
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
