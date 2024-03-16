import { Browser } from "puppeteer";
import { RenderResponse } from "../types";
import { BaseRender } from "./render";

export class RenderPNG extends BaseRender {
	filepath = "";

	constructor(browser: Browser, opt: any) {
		super(browser, opt);
		this.filepath = `.tmp/${this.uuid}.png`;
	}

	async render(): Promise<RenderResponse> {
		try {
			await this.init();
			await this.navigate();
			await this.screenshot();
			return {
				fileName: "screenshot",
				filePath: this.filepath,
			};
		} finally {
			await this.close();
		}
	}

	private async screenshot() {
		return await this.page.screenshot({
			path: this.filepath,
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
	}
}
