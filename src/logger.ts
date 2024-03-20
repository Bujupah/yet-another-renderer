import config from "./config";
import moment from "moment";

export enum LogLevel {
	INFO = "info",
	DEBUG = "debug",
	ERROR = "error",
	WARN = "warn",
}

export enum LogType {
	JSON = "json",
	CONTEXT = "context",
}

export type LogTimeFormat = "iso" | string;

export default class Logger {
	private logger = "default";
	private ctx: any[] = [];

	constructor(logger: string, ...ctx: any[]) {
		this.logger = logger;
		this.ctx = ctx;
	}

	info(msg: string, ...ctx: any[]) {
		this.log(LogLevel.INFO, msg, ...ctx);
		return this;
	}

	error(msg: string, ...ctx: any[]) {
		this.log(LogLevel.ERROR, msg, ...ctx);
		return this;
	}

	debug(msg: string, ...ctx: any[]) {
		if (config.LOG_LEVEL === LogLevel.DEBUG)
			this.log(LogLevel.DEBUG, msg, ...ctx);
		return this;
	}

	warn(msg: string, ...ctx: any[]) {
		this.log(LogLevel.WARN, msg, ...ctx);
		return this;
	}

	private log(level: LogLevel, msg: string, ...ctx: any[]) {
		const now = moment().format(config.LOG_TIME_FORMAT);
		const args = [
			...["level", level.toUpperCase()],
			...["t", now],
			...["msg", msg],
			...["logger", this.logger],
			...this.ctx,
			...ctx,
		];
		console[level.toLowerCase()](...this.prettify(...args));
	}

	private prettify = (...ctx: any[]): any => {
		if (config.LOG_TYPE === LogType.CONTEXT) {
			const { 1: level, 3: time, 5: msg } = ctx;
			const other = ctx.slice(6);
			const args = other.reduce((prev, curr, idx, arr) => {
				idx % 2 === 0 && idx + 1 < arr.length
					? prev.push(`${curr}=${arr[idx + 1]}`)
					: undefined;
				return prev;
			}, []);
			return [`[${level}]`.padEnd(7), `t=${time}`, msg.padEnd(40), ...args];
		}
		return [
			JSON.stringify(
				ctx.reduce((prev, curr, idx, arr) => {
					idx % 2 === 0 && idx + 1 < arr.length
						? (prev[`${curr}`] = arr[idx + 1])
						: undefined;
					return prev;
				}, {})
			),
		];
	};
}
