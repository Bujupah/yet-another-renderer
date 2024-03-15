import { Browser, Page, BrowserContext } from "puppeteer";
import { RenderRequest, RenderResponse } from "../types";

export class BaseRender {
	context: BrowserContext;
	browser: Browser;
	page: Page;

	options: RenderRequest;
	uuid = Math.random().toString(36).substring(7);

	constructor(browser: Browser, opt: RenderRequest) {
		this.browser = browser;
		this.options = opt;
	}

	async init() {
		this.context = await this.browser.createBrowserContext();
		this.page = await this.context.newPage();
		await this.setListener();
		await this.setTimeZone(this.options.timezone);
		await this.setViewport(
			this.options.width,
			this.options.height,
			this.options.scaleFactor
		);
		await this.setRenderKey(this.options.renderKey, this.options.domain);
		await this.setLocale();
	}

	// navigate to page url and wait until network is idle
	async navigate() {
		await this.page.goto(this.options.url, {
			waitUntil: "networkidle0",
			referrerPolicy: "no-referrer",
			timeout: this.options.timeout * 1000,
		});
	}

	// close current page and browser context
	async close() {
		await this.page.close({ runBeforeUnload: true });
		await this.context.close();
	}

	// set page timezone based on user input
	async setTimeZone(timezone: string) {
		await this.page.emulateTimezone(timezone);
	}

	// set page viewport width and height
	async setViewport(width: number, height: number, scale: number) {
		await this.page.setViewport({
			width,
			height,
			deviceScaleFactor: scale,
		});
	}

	// set render key cookie
	async setRenderKey(renderKey: string, domain: string) {
		await this.page.setCookie({
			name: "renderKey",
			value: renderKey,
			domain: domain,
		});
	}

	// set page language locale
	async setLocale() {
		await this.page.setExtraHTTPHeaders({
			"Accept-Language": this.options.language,
		});
	}

	// set page listener for console, error, pageerror, requestfailed, response
	async setListener() {
		this.page.on("console", (msg) => console.log("console:", msg.text()));
		this.page.on("error", (err) => console.log("error:", err));
		this.page.on("pageerror", (err) => console.log("page error:", err));
		this.page.on("requestfailed", (req) =>
			console.log("request failed:", req.url())
		);
		// this.page.on("response", (res) => console.log("response:", res.url()));
	}

	async render(): Promise<RenderResponse> {
		throw new Error("Method not implemented.");
	}
}
