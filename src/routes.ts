import * as fs from "fs";

import { Browser } from "puppeteer";
import { IRequest, IResponse } from "./types";
import { RequestHandler } from "express";
import { RenderPNG } from "./render/png";

export const generatePNG = (browser: Browser): RequestHandler => {
	return async (req: IRequest, res: IResponse) => {
		const render = new RenderPNG(browser, req.opt);
		const { fileName, filePath } = await render.render();

		// set filepath to response object to delete it after response is sent
		res.filePath = filePath;

		// set headers and pipe file to response
		res.status(200);
		res.setHeader("x-grafana-filename", fileName);
		res.setHeader("Content-Type", "image/png");

		// stream out the file to the response
		const fileStream = fs.createReadStream(filePath);
		fileStream.pipe(res);
	};
};

export const generateCSV = (browser: Browser): RequestHandler => {
	return async (req: IRequest, res: IResponse) => {
		res.send("renderCSV");
	};
};

export const generatePDF = (browser: Browser): RequestHandler => {
	return async (req: IRequest, res: IResponse) => {
		res.send("renderPDF");
	};
};

export const generateXLSX = (browser: Browser): RequestHandler => {
	return async (req: IRequest, res: IResponse) => {
		res.send("renderXLSX");
	};
};
