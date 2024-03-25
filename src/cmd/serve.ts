import * as fs from "fs";
import puppeteer from "puppeteer";

import expqueue from "express-queue";
import express from "express";

import { generate } from "../api/routes";
import { authenticator, cleanup, logger, validator } from "../api/middlewares";

import config from "../config";
import utils from "../utils/utils";
import Logger from "../logger";
import { PageInfo } from "../types";

const log = new Logger(`server`);

export async function serve() {
	utils.mkdir(".tmp", () => {
		log.debug("Temporary folder is created");
	});

	const app = express();

	app.use(express.json());
	app.use(logger());

	const queue = expqueue({
		activeLimit: config.RENDER_CONCURRENCY,
		queuedLimit: config.RENDER_QUEUE_LIMIT,
	});

	log.debug("Launching browser");
	const browser = await puppeteer.launch({
		headless: "shell",
		args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
	});

	app.use(cleanup);
	app.use(queue);

	app.get("/", (_, res) => {
		res.status(200).send("Yet another grafana renderer");
	});

	app.get("/render/version", (_, res) => {
		res.status(200).json({ status: "ok", version: config.APP_VERSION });
	});

	app.get("/render", authenticator, validator, generate(browser));

	app.get("/get-queue", (_, res) => {
		res.status(200).json({ queue: queue.queue.getLength() });
	});

	app.get("/get-browsers", async (_, res) => {
		const contexts = browser.browserContexts();
		const ids = contexts.length;
		const pages: PageInfo = {};

		for (let i = 0; i < ids; i++) {
			const context = contexts[i];
			const id = context.id;

			const targets = await context.pages();
			const metrics = [];
			for (let j = 0; j < targets.length; j++) {
				const target = targets[j];
				const info = await target.metrics();
				metrics.push({
					timestamp: new Date((Date as any)(info.Timestamp)),
					documents: info.Documents,
					frames: info.Frames,
					jsEvents: info.JSEventListeners,
					scriptDuration: info.ScriptDuration,
					taskDuration: info.TaskDuration,
					jsHeapUsedSize: info.JSHeapUsedSize,
					jsHeapTotalSize: info.JSHeapTotalSize,
				});
			}

			pages[`${id ?? "master"}`] = {
				url: targets.map((e) => e.url()),
				metrics: metrics,
			};
		}

		res.status(200).json({
			master: contexts.length > 0 ? "ok" : "down",
			length: contexts.length - 1,
			pages: pages,
		});
	});

	app.all("*", (_, res) => {
		const fileStream = fs.createReadStream("assets/not-found.png");
		fileStream.pipe(res.status(200));
	});

	const server = app.listen(config.RENDER_PORT, async () => {
		const browserVersion = await browser.version();
		log.debug(
			"Starting server",
			...["port", config.RENDER_PORT],
			...["version", config.APP_VERSION],
			...["concurrency_limit", config.RENDER_CONCURRENCY],
			...["queue_limit", config.RENDER_QUEUE_LIMIT],
			...["browser", browserVersion]
		);
		// log.debug(`> Server port: ${config.RENDER_PORT}`);
		// log.debug(`> Server version: ${config.APP_VERSION}`);
		// log.debug(`> Request Concurrency: ${config.RENDER_CONCURRENCY}`);
		// log.debug(`> Request Queue limit: ${config.RENDER_QUEUE_LIMIT}`);
		// log.debug(`> Browser version: ${browserVersion}`);
		// log.debug("\n\nPress Ctrl+C to exit...");
	});

	async function closeApp({ exitCode = 0 }) {
		log.warn("Shutting down browser...");
		await browser.close();

		log.warn("Shutting down server...");
		server.close();

		log.warn("Exiting...");
		process.exit(exitCode);
	}

	process.on("SIGINT", async () => {
		await closeApp({ exitCode: 0 });
	});

	process.on("unhandledRejection", async (err: Error) => {
		log.error("Unhandled Rejection", "error", err.message, "stack", err.stack);
		await closeApp({ exitCode: 1 });
	});
}
