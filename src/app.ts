import dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import puppeteer from "puppeteer";

import expqueue from "express-queue";
import express from "express";
import morgan from "morgan";

import { generateCSV, generatePDF, generatePNG, generateXLSX } from "./routes";
import { cleanup, validator } from "./middlewares";
import { env } from "process";

const { version: serviceVersion } = require("../package.json");

async function main() {
	const app = express();

	app.use(express.json());
	app.use(morgan("common"));

	const queue = expqueue({ activeLimit: 5, queuedLimit: -1 });

	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	app.use(cleanup);

	app.get("/", queue, (_, res) => {
		res.send("Yet another grafana renderer");
	});

	app.get("/render/version", (_, res) => {
		res.json({ status: "ok", version: serviceVersion });
	});

	app.get("/in-queue", (_, res) => {
		res.json({ queue: queue.queue.getLength() });
	});

	app.get("/render", validator, generatePNG(browser));
	app.get("/render/csv", validator, generateCSV(browser));
	app.get("/render/pdf", validator, generatePDF(browser));
	app.get("/render/xlsx", validator, generateXLSX(browser));

	app.all("*", (_, res) => {
		res.status(200);
		const fileStream = fs.createReadStream("assets/not-found.png");
		fileStream.pipe(res);
	});

	const server = app.listen(+env.PORT, async () => {
		const browserVersion = await browser.version();
		console.log(`Server running on port ${env.PORT}`);
		console.log(`\nBrowser version: ${browserVersion}`);
		console.log(`Service version: ${serviceVersion}`);
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

main();
