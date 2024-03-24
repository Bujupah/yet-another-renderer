import { Request, Response } from "express";

export type RenderRequest = {
	type: RenderType;
	url: string[];
	timezone: string;
	timeout: number;

	width?: number;
	height?: number;
	scale: number;

	logo?: string;
	title?: string;
	description?: string;

	landscape?: boolean;

	domain: string;
	renderKey: string;

	encoding: EncodingType;

	language: string;
};

export type RenderResponse = {
	folder: string;
	fileName: string;
	filePath: string;
};

export enum RenderType {
	PANEL = "panel",
	DASHBOARD = "dashboard",
}

export enum EncodingType {
	PNG = "png",
	PDF = "pdf",
}

export interface IResponse extends Response {
	folder: string;
}

export interface IRequest extends Request {
	opt: RenderRequest;
}

export interface PageInfo {
	[key: string]: {
		url: any[];
		metrics: {};
		status?: string;
	};
}
