import config from "../config";

import * as fs from "fs";
import { NextFunction } from "express";
import { IRequest, IResponse, RenderType } from "../types";

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
		type: (req.query.type as RenderType) || RenderType.PNG,
		url: req.query.url as string,
		domain: req.query.domain as string,
		encoding: req.query.encoding as string,
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
		!req.opt.url.startsWith("http://") &&
		!req.opt.url.startsWith("https://")
	) {
		console.error("url must be a http/https protocol");
		const fileStream = fs.createReadStream("assets/error.png");
		fileStream.pipe(res);
		return;
	}

	next();
}

// create a middleware that checks the header after the request is processed
export function cleanup(_: IRequest, res: IResponse, next: NextFunction) {
	res.on("finish", () => {
		if (res.filePath) {
			fs.unlink(res.filePath, (err) => {
				if (err) {
					console.error(`Error deleting file: ${err.message}`);
				}
			});
		}
	});
	next();
}
