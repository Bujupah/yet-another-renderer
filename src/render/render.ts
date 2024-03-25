import { Browser, Page, BrowserContext } from "puppeteer";
import { RenderRequest, RenderResponse } from "../types";

import utils from "../utils/utils";
import Logger from "../logger";

export class BaseRender {
	protected context: BrowserContext;
	protected browser: Browser;
	protected page: Page;

	public options: RenderRequest;

	protected log: Logger;

	protected uuid = Math.random().toString(36).substring(7);

	constructor(browser: Browser, opt: RenderRequest) {
		this.browser = browser;
		this.options = opt;
		this.log = new Logger(`render-${opt.encoding}`, "uuid", this.uuid);
	}

	protected async init() {
		this.log.info("Creating folder");
		this.mkdir();

		this.log.info("Creating browser context");
		this.context = await this.browser.createBrowserContext();

		this.log.info("Creating new page");
		this.page = await this.context.newPage();

		this.log.info("Setting page listener");
		await this.setListener();

		this.log.info("Setting page timezone");
		await this.setTimeZone();

		this.log.info("Setting page viewport");
		await this.setViewport();

		this.log.info("Setting page locale");
		await this.setLocale();

		this.log.info("Setting render key");
		await this.setRenderKey();
	}

	// navigate to page url and wait until network is idle
	protected async navigate(url?: string, timeout?: number) {
		await this.page.goto(url || this.options.url[0], {
			waitUntil: "networkidle0",
			referrerPolicy: "no-referrer",
			timeout: timeout || this.options.timeout * 1000,
		});
	}

	// close current page and browser context
	protected async close() {
		await this.page.close({ runBeforeUnload: true });
		await this.context.close();
	}

	// set page timezone based on user input
	protected async setTimeZone(timezone?: string) {
		await this.page.emulateTimezone(timezone || this.options.timezone);
	}

	// set page viewport width and height
	protected async setViewport(width?: number, height?: number, scale?: number) {
		await this.page.setViewport({
			width: width || this.options.width,
			height: height || this.options.height,
			deviceScaleFactor: scale || this.options.scale,
		});
	}

	// set render key cookie
	protected async setRenderKey(renderKey?: string, domain?: string) {
		await this.page.setCookie({
			name: "renderKey",
			value: renderKey || this.options.renderKey,
			domain: domain || this.options.domain,
		});
	}

	// set page language locale
	protected async setLocale(locale?: string) {
		await this.page.setExtraHTTPHeaders({
			"Accept-Language": locale || this.options.language,
		});
	}

	// set page listener for console, error, pageerror, requestfailed, response
	protected async setListener() {
		this.page.on("console", (msg) => console.debug("console:", msg.text()));
		this.page.on("error", (err) => console.error("error:", err));
		this.page.on("pageerror", (err) => console.error("page error:", err));
		this.page.on("requestfailed", (req) =>
			console.error("request failed:", req.url())
		);
		// this.page.on("response", (res) => console.debug("response:", res.url()));
	}

	async render(): Promise<RenderResponse> {
		throw new Error("Method not implemented.");
	}

	private mkdir() {
		utils.mkdir(`.tmp/${this.uuid}`);
	}

	protected async title(ignore = false): Promise<any> {
		if (ignore) return;
		const dashboard = await this.page.evaluate(() => {
			return (window as any).grafanaRuntime.getDashboardSaveModel();
		});
		return dashboard.title;
	}

	protected async description(ignore = false): Promise<any> {
		if (ignore) return;
		const dashboard = await this.page.evaluate(() => {
			return (window as any).grafanaRuntime.getDashboardSaveModel();
		});
		return dashboard.description;
	}

	protected async user(ignore = false): Promise<string> {
		if (ignore) return;
		const user = await this.page.evaluate(() => {
			return (
				(window as any).grafanaBootData.user.name ||
				(window as any).grafanaBootData.user.login
			);
		});
		return user;
	}

	protected async timerange(
		ignore = false
	): Promise<{ from: number; to: number }> {
		if (ignore) return;
		const range = await this.page.evaluate(() => {
			const { from, to } = (
				window as any
			).grafanaRuntime.getDashboardTimeRange();
			return { from, to };
		});
		return range;
	}

	protected async merge() {
		await utils.merge(
			this.uuid,
			this.options.url.map(
				(_, i) => `.tmp/${this.uuid}/${i}.${this.options.encoding}`
			),
			this.options.encoding
		);
	}
}
