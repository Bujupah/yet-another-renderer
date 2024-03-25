import * as fs from "fs";

import { PDFDocument } from "pdf-lib";

interface IPDFOptions {
	uid: string;
	files: string[];

	title: string;
	keywords: string[];
}

const create = async (opt: IPDFOptions) => {
	const mergedPdf = await PDFDocument.create();

	const pdfsToMerge = [];

	const file = `.tmp/${opt.uid}/cover.pdf`;
	if (fs.existsSync(file)) {
		const buffer = fs.readFileSync(file);
		pdfsToMerge.push(buffer);
	}

	for (let index = 0; index < opt.files.length; index++) {
		const file = opt.files[index];
		const buffer = fs.readFileSync(file);
		pdfsToMerge.push(buffer);
	}

	for (const pdfBytes of pdfsToMerge) {
		const pdf = await PDFDocument.load(pdfBytes);
		const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
		copiedPages.forEach((page) => {
			mergedPdf.addPage(page);
		});
	}

	mergedPdf.setTitle(opt.title, { showInWindowTitleBar: true });
	mergedPdf.setSubject(opt.title);
	mergedPdf.setKeywords(opt.keywords);
	mergedPdf.setProducer("Yet another renderer");
	mergedPdf.setCreator("Yet another renderer");
	mergedPdf.setAuthor("Bujupah");
	mergedPdf.setCreationDate(new Date());
	mergedPdf.setModificationDate(new Date());

	const path = `.tmp/${opt.uid}/merged.pdf`;
	const buf = await mergedPdf.save();
	fs.writeFileSync(path, buf);
};

export default {
	create,
};
