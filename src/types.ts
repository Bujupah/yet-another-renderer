import { Request, Response } from "express";

export type RenderRequest = {
	type: RenderType;
	url: string;
	timezone: string;
	timeout: number;

	width?: number;
	height?: number;
	scale: number;

	domain: string;
	renderKey: string;

	encoding: string;

	language: string;
};

export type RenderResponse = {
	fileName: string;
	filePath: string;
};

export enum RenderType {
	PNG = "png",
	PDF = "pdf",
	CSV = "csv",
	XLSX = "xlsx",
}

export interface IResponse extends Response {
	filePath: string;
}

export interface IRequest extends Request {
	opt: RenderRequest;
}
