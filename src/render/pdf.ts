import { Browser } from "puppeteer";
import { RenderResponse } from "../types";
import { BaseRender } from "./render";
import { readFileSync } from "fs";
import utils from "../utils/utils";
import moment from "moment";
import "moment-timezone";

export class RenderPDF extends BaseRender {
	constructor(browser: Browser, opt: any) {
		super(browser, opt);
	}

	// Todo: This needs some cleaning i believe but it works... gonna keep it as is till I have the power
	async render(): Promise<RenderResponse> {
		try {
			await this.init();
			if (this.options.url.length === 1) {
				await this.navigate(this.options.url[0]);
				await this.get_pdf(`.tmp/${this.uuid}/0.pdf`);
				return {
					folder: `.tmp/${this.uuid}`,
					fileName: "report",
					filePath: `.tmp/${this.uuid}/0.pdf`,
				};
			}

			try {
				for (let i = 0; i < this.options.url.length; i++) {
					const url = this.options.url[i];
					await this.navigate(url);
					await this.get_pdf(`.tmp/${this.uuid}/${i}.pdf`);
				}

				const creator = await this.user();
				const timerange = await this.timerange();
				const dashboard = await this.dashboard();

				await this.cover({ creator, timerange, dashboard });
				await this.get_pdf(`.tmp/${this.uuid}/cover.pdf`);

				await this.merge();
				return {
					folder: `.tmp/${this.uuid}`,
					fileName: "report",
					filePath: `.tmp/${this.uuid}/merged.pdf`,
				};
			} catch (error) {
				console.error(error);
			}

			return {
				folder: `.tmp/${this.uuid}`,
				fileName: "report",
				filePath: `.tmp/${this.uuid}/0.pdf`,
			};
		} finally {
			await this.close();
		}
	}

	// Todo: lot of work to be done here, but will keep it this way for now.
	private async cover({ creator, timerange, dashboard }) {
		// read template file
		const template = readFileSync("assets/template/default_cover.html", "utf8");
		const cover = utils.interpolate(template, {
			title: this.options.title || dashboard.title,
			description: this.options.description || dashboard.description || "",
			logo: this.options.logo,

			header: "flex",
			headerCreator: creator,
			headerShowCreator: creator ? "" : "hidden",

			headerTime: moment()
				.tz(this.options.timezone)
				.format("YYYY/MM/DD HH:mm:ss z"),
			headerShowTime: "flex" ? "" : "hidden",

			from: moment(timerange.from)
				.tz(this.options.timezone)
				.format("YYYY/MM/DD HH:mm:ss z"),
			to: moment(timerange.to)
				.tz(this.options.timezone)
				.format("YYYY/MM/DD HH:mm:ss z"),

			footer: "flex",
			footerText: `&copy; 2024 Yet-another-renderer. All rights reserved.`,
		});

		await this.page.setContent(cover);
	}

	private async get_pdf(filepath: string) {
		this.page.emulateMediaType("screen");
		return await this.page.pdf({
			path: filepath,
			format: "a4",
			landscape: this.options.landscape,
			timeout: this.options.timeout * 1000,
			scale: this.options.scale,
			displayHeaderFooter: false,
			omitBackground: false,
			printBackground: true,
		});
	}
}
