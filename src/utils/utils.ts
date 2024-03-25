import * as fs from "fs";
import pdf from "./pdf_utils";
import png from "./png_utils";

import { EncodingType } from "../types";

function mkdir(folder: string, callback?: () => void) {
	if (!pathExists(folder)) {
		fs.mkdirSync(folder);
		callback?.();
	}
}

function rmdir(folder: string) {
	if (pathExists(folder)) {
		fs.rm(folder, { recursive: true, force: true }, (err) => {
			if (err) {
				console.error(`Error deleting folder: ${err.message}`);
			}
		});
	}
}

function pathExists(file: string): boolean {
	if (!file) {
		return false;
	}
	return fs.existsSync(file);
}

async function merge(
	uid: string,
	files: string[],
	type: EncodingType
): Promise<string> {
	if (type === EncodingType.PDF) {
		await pdf.create({
			uid,
			files,
			keywords: ["pdf", "grafana", "renderer"],
			title: "Report Preview",
		});
		return;
	}
	if (type === EncodingType.PNG) {
		await png.create(uid, files);
		return;
	}
	throw new Error("Invalid encoding type");
}

function interpolate(content: string, object: { [key: string]: any }): string {
	const keys = Object.keys(object);
	for (const key of keys) {
		const regex = new RegExp(`\\[\\[${key}\\]\\]`, "g");
		content = content.replace(regex, object[key]);
	}
	return content;
}

export default {
	mkdir,
	rmdir,
	merge,
	pathExists,
	interpolate,
};
