import combine from "combine-image";

const create = async (uid: string, files: string[]) => {
	const filepath = `.tmp/${uid}/merged.png`;
	const data = await combine(files, { direction: "row" });
	return await new Promise((resolve, reject) => {
		data.write(filepath, (err: Error) => {
			if (err) reject(err);
			else resolve(filepath);
		});
	});
};

export default {
	create,
};
