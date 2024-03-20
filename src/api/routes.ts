import * as fs from "fs";

import { Browser } from "puppeteer";
import { IRequest, IResponse } from "../types";
import { NextFunction, RequestHandler } from "express";
import { RenderPNG } from "../render/png";

export const generate = (browser: Browser): RequestHandler => {
	return async (req: IRequest, res: IResponse, next: NextFunction) => {
		switch (req.opt.encoding) {
			default:
				return generatePNG(browser)(req, res, next);
		}
	};
};

const generatePNG = (browser: Browser): RequestHandler => {
	return async (req: IRequest, res: IResponse) => {
		const render = new RenderPNG(browser, req.opt);
		const { folder, filePath } = await render.render();

		// set folder to response object to delete it after response is sent
		res.folder = folder;

		// set headers and pipe file to response
		res.setHeader("Content-Type", "image/png");

		// stream out the file to the response
		const fileStream = fs.createReadStream(filePath);
		fileStream.pipe(res.status(200));
	};
};
