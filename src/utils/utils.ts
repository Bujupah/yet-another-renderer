import * as fs from "fs";
import img_join from "combine-image";

import { EncodingType } from "../types";

function mkdir(folder: string, callback?: () => void) {
	if (!fs.existsSync(folder)) {
		fs.mkdirSync(folder);
		callback?.();
	}
}

function rmdir(folder: string) {
	if (folder && fs.existsSync(folder)) {
		fs.rm(folder, { recursive: true, force: true }, (err) => {
			if (err) {
				console.error(`Error deleting folder: ${err.message}`);
			}
		});
	}
}

async function merge(
	uid: string,
	files: string[],
	type: EncodingType
): Promise<string> {
	if (type === EncodingType.PDF) {
		throw new Error("PDF merge not implemented");
	}
	const filepath = `.tmp/${uid}/merged.png`;
	const data = await img_join(files, { direction: "row" });
	return await new Promise((resolve, reject) => {
		data.write(filepath, (err: Error) => {
			if (err) reject(err);
			else resolve(filepath);
		});
	});
}

export default {
	mkdir,
	rmdir,
	merge,
};
