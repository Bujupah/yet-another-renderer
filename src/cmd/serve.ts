import * as fs from "fs";
import puppeteer from "puppeteer";

import expqueue from "express-queue";
import express from "express";
import morgan from "morgan";

import { generatePNG } from "../api/routes";
import { authenticator, cleanup, validator } from "../api/middlewares";

import config from "../config";

export async function serve() {
	if (!fs.existsSync(".tmp")) {
		fs.mkdirSync(".tmp");
	}

	const app = express();

	app.use(express.json());
	app.use(morgan("common"));

	const queue = expqueue({
		activeLimit: config.RENDER_CONCURRENCY,
		queuedLimit: config.RENDER_QUEUE_LIMIT,
	});

	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-gpu"],
	});

	app.use(cleanup);
	app.use(queue);

	app.get("/", (_, res) => {
		res.send("Yet another grafana renderer");
	});

	app.get("/render/version", (_, res) => {
		res.json({ status: "ok", version: config.APP_VERSION });
	});

	app.get("/render", authenticator, validator, generatePNG(browser));

	app.get("/in-queue", (_, res) => {
		res.json({ queue: queue.queue.getLength() });
	});

	app.all("*", (_, res) => {
		res.status(200);
		const fileStream = fs.createReadStream("assets/not-found.png");
		fileStream.pipe(res);
	});

	const server = app.listen(config.RENDER_PORT, async () => {
		const browserVersion = await browser.version();
		console.log(`> Server port: ${config.RENDER_PORT}`);
		console.log(`> Server version: ${config.APP_VERSION}`);
		console.log(`> Request Concurrency: ${config.RENDER_CONCURRENCY}`);
		console.log(`> Request Queue limit: ${config.RENDER_QUEUE_LIMIT}`);
		console.log(`> Browser version: ${browserVersion}`);
		console.log("\n\nPress Ctrl+C to exit...");
	});

	async function closeApp({ exitCode = 0 }) {
		console.log("Shutting down browser...");
		await browser.close();

		console.log("Shutting down server...");
		server.close();

		console.log("Exiting...");
		process.exit(exitCode);
	}

	process.on("SIGINT", async () => {
		await closeApp({ exitCode: 0 });
	});

	process.on("unhandledRejection", async (err) => {
		console.error("Unhandled Rejection", err);
		await closeApp({ exitCode: 1 });
	});
}
