import {
	FastifyReply,
	FastifyRequest,
} from "fastify";

export function handleJsonp(
	request: FastifyRequest,
	reply: FastifyReply,
	data: object
) {
    const callback = (request.query as { callback?: string })?.["callback"];
    if (callback && /^[$A-Za-z_][0-9A-Za-z_$]*$/.test(callback)) {
        reply.code(200);
        reply.header("Content-Type", "application/javascript");
        reply.send(`${callback}(${JSON.stringify(data)})`);
    } else {
        reply.code(200);
        reply.header("Content-Type", "application/json");
        reply.header("Access-Control-Allow-Origin", "*");
        reply.header("Access-Control-Allow-Methods", "POST, GET");
        reply.header("Access-Control-Max-Age", "604800"); // 1 week
        reply.send(JSON.stringify(data));
    }
}
