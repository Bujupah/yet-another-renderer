import merge from "merge-img";

const create = async (uid: string, files: string[]) => {
	const filepath = `.tmp/${uid}/merged.png`;
	const Jimp = await merge(files, { direction: true, offset: 4 });
	return await new Promise((resolve, reject) => {
		Jimp.write(filepath, (err: Error) => {
			if (err) reject(err);
			else resolve(filepath);
		});
	});
};

export default {
	create,
};
