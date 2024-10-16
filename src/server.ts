import Fastify, { FastifyInstance } from "fastify";
import { fastifyStatic } from "@fastify/static";
import fs from "node:fs";
import process from "node:process";

import { getVersion } from "./getVersion.js";
import { handleJsonp } from "./handleJsonp.js";
import path from "node:path";
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const server: FastifyInstance = Fastify({
    logger: true,
    trustProxy: true,
});

server.get("/", async (req, res) => {
    const packageData = JSON.parse(fs.readFileSync("./package.json", "utf8"));

    const data: { [key: string]: string } = {
        name: packageData.name,
        description: packageData.description,
        homepage: packageData.homepage,
        source: packageData.repository.url
            .replace(/^git[+]/, "")
            .replace(/[.]git$/, ""),
        //LATER: funding?
    };

    const raw = fs.readFileSync('./static/_index.html', 'utf8');
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
        ...getVersion(),
    };
    handleJsonp(req, res, data);
});

const start = async () => {
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

start();
