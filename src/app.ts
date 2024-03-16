import { version, help, info } from "./cmd/cli";
import { serve } from "./cmd";

export function main() {
	const args = process.argv.slice(2);

	switch (args[0]) {
		case "--serve":
		case "-s":
			serve();
			break;
		case "--help":
		case "-h":
			help();
			break;
		case "--version":
		case "-v":
			version();
			break;
		case "--info":
		case "-i":
			info();
			break;
		default:
			help();
			break;
	}
}

main();
