import * as fs from "fs";

import { NextFunction } from "express";
import { EncodingType, IRequest, IResponse, RenderType } from "../types";

import config from "../config";
import utils from "../utils/utils";

import morgan, { TokenIndexer } from "morgan";
import Logger from "../logger";

export function authenticator(
	req: IRequest,
	res: IResponse,
	next: NextFunction
) {
	const authToken = req.headers["x-auth-token"];

	if (
		authToken !== config.RENDER_AUTH_SECRET_TOKEN &&
		config.RENDER_AUTH_SECRET_TOKEN !== "-"
	) {
		console.error("Unauthorized request");
		const fileStream = fs.createReadStream("assets/unauthorized.png");
		fileStream.pipe(res);
		return;
	}

	next();
}

export function validator(req: IRequest, res: IResponse, next: NextFunction) {
	req.opt = {
		url: [],
		type: RenderType.PANEL,
		domain: req.query.domain as string,
		encoding: (req.query.encoding as EncodingType) || EncodingType.PNG,
		renderKey: req.query.renderKey as string,
		timeout: +req.query.timeout || config.RENDER_TIMEOUT,
		timezone: (req.query.timezone as string) || config.RENDER_TZ,
		scale: +req.query.deviceScaleFactor || config.RENDER_SCALE,
		height: +req.query.height || config.RENDER_WIDTH,
		width: +req.query.width || config.RENDER_HEIGHT,
		language: req.headers["accept-language"] as string,
	};

	// validate the req.query.url and it must be a http/https protocol
	if (!req.opt.url) {
		console.error("url is required");
		const fileStream = fs.createReadStream("assets/error.png");
		fileStream.pipe(res);
		return;
	}

	if (
		!(req.query.url as string).startsWith("http://") &&
		!(req.query.url as string).startsWith("https://")
	) {
		console.error("url must be a http/https protocol");
		const fileStream = fs.createReadStream("assets/error.png");
		fileStream.pipe(res);
		return;
	}

	const url = new URL(req.query.url as string);

	const isPanel = url.pathname.includes("/d-solo/");
	const isDashboard = url.pathname.includes("/d/");

	if (!isPanel && !isDashboard) {
		console.error("url must be /d or /d-solo", req.query.url);
		const fileStream = fs.createReadStream("assets/error.png");
		fileStream.pipe(res);
		return;
	}

	if (isPanel) {
		req.opt.type = RenderType.PANEL;
	}

	if (isDashboard) {
		req.opt.type = RenderType.DASHBOARD;
	}

	const panelIds = (url.searchParams.get("panelId") as string).split(",");
	for (const panelId of panelIds) {
		const panelURL = url;
		panelURL.searchParams.set("panelId", panelId.trim());
		req.opt.url.push(panelURL.toString().replace("/d/", "/d-solo/"));
	}

	if (req.opt.encoding == EncodingType.PDF) {
		req.opt.width = 794;
		req.opt.height = 1123;

		if (url.searchParams.get("landscape") === "true") {
			req.opt.landscape = true;
			req.opt.width = 1123;
			req.opt.height = 794;
		}

		req.opt.logo = url.searchParams.get("logo");
		req.opt.title = url.searchParams.get("title");
		req.opt.description = url.searchParams.get("description");
	}

	next();
}

// create a middleware that checks the header after the request is processed
export function cleanup(_: IRequest, res: IResponse, next: NextFunction) {
	res.on("finish", () => {
		utils.rmdir(res.folder);
	});
	next();
}

export const logger = () => {
	const log = new Logger("http");
	return morgan(
		(
			tokens: TokenIndexer<IRequest, IResponse>,
			req: IRequest,
			res: IResponse
		) => {
			const args = [
				...["method", tokens.method(req, res)],
				...["handler", req.route.path],
				...["status", res.statusCode],
				...["remote-addr", tokens["remote-addr"](req, res)],
				...["duration", (tokens["response-time"](req, res) || 0) + "ms"],
			];
			if (+tokens.status(req, res) >= 400) {
				log.error("Request completed with failure", ...args);
			} else {
				log.info("Request completed successfully", ...args);
			}
			return undefined;
		}
	);
};
