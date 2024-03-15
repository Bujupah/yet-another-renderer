import dotenv from "dotenv";
dotenv.config();

import { env } from "process";

import * as fs from "fs";
import { NextFunction } from "express";
import { IRequest, IResponse, RenderType } from "./types";

export function validator(req: IRequest, res: IResponse, next: NextFunction) {
	const authToken = req.headers["x-auth-token"];

	if (authToken !== env.AUTH_SECRET_TOKEN && env.AUTH_SECRET_TOKEN !== "-") {
		console.log("Unauthorized request");
		const fileStream = fs.createReadStream("assets/unauthorized.png");
		fileStream.pipe(res);
		return;
	}

	req.opt = {
		type: (req.query.type as RenderType) || RenderType.PNG,
		url: req.query.url as string,
		domain: req.query.domain as string,
		encoding: req.query.encoding as string,
		renderKey: req.query.renderKey as string,
		timeout: +req.query.timeout || +env.RENDER_TIMEOUT,
		timezone: (req.query.timezone as string) || env.RENDER_TZ,
		scaleFactor: +req.query.deviceScaleFactor || +env.RENDER_SCALE,
		height: +req.query.height || +env.RENDER_WIDTH,
		width: +req.query.width || +env.RENDER_HEIGHT,
		language: req.headers["accept-language"] as string,
	};

	// validate the req.query.url and it must be a http/https protocol
	if (!req.opt.url) {
		console.log("url is required");
		const fileStream = fs.createReadStream("assets/error.png");
		fileStream.pipe(res);
		return;
	}

	if (
		!req.opt.url.startsWith("http://") &&
		!req.opt.url.startsWith("https://")
	) {
		console.log("url must be a http/https protocol");
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
