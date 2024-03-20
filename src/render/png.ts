import { Browser } from "puppeteer";
import { BaseRender } from "./render";
import { RenderRequest, RenderResponse } from "../types";

export class RenderPNG extends BaseRender {
	constructor(browser: Browser, opt: RenderRequest) {
		super(browser, opt);
	}

	async render(): Promise<RenderResponse> {
		try {
			await this.init();

			if (this.options.url.length === 1) {
				this.log.info("Generating single panel");
				await this.navigate(this.options.url[0]);

				const filepath = `.tmp/${this.uuid}/0.png`;
				this.log.info(
					"Taking screenshot",
					"url",
					this.options.url[0],
					"filepath",
					filepath
				);
				await this.screenshot(filepath);
				return {
					folder: `.tmp/${this.uuid}`,
					fileName: "screenshot",
					filePath: `.tmp/${this.uuid}/0.png`,
				};
			}

			try {
				this.log.info("Generating multiple panels");
				for (let i = 0; i < this.options.url.length; i++) {
					const url = this.options.url[i];

					this.log.info("Navigating to panel url");
					await this.navigate(url);

					const filepath = `.tmp/${this.uuid}/${i}.png`;
					this.log.info("Taking screenshot", "url", url, "filepath", filepath);
					await this.screenshot(filepath);
				}
				await this.merge();
				return {
					folder: `.tmp/${this.uuid}`,
					fileName: "screenshot",
					filePath: `.tmp/${this.uuid}/merged.png`,
				};
			} catch (error) {
				this.log.error(error);
			}
			return {
				folder: `.tmp/${this.uuid}`,
				fileName: "screenshot",
				filePath: `.tmp/${this.uuid}/0.png`,
			};
		} catch (err) {
			console.log(err);
		} finally {
			await this.close();
		}
	}

	private async screenshot(filepath: string) {
		await this.page.screenshot({
			path: filepath,
			clip: {
				x: 0,
				y: 0,
				height: this.options.height,
				width: this.options.width,
				scale: this.options.scale,
			},
			optimizeForSpeed: true,
			captureBeyondViewport: true,
		});
		this.log.debug("Successfully taken screenshot");
	}
}
