import config from "../config";

export function help() {
	console.log("Usage: node src/index.js [OPTION]");
	console.log("  -s, --serve       run and serve the rendering service");
	console.log("  -i, --info        display the service information");
	console.log("  -v, --version     display the service version");
	console.log("  -h, --help        display the help message");
}

export function info() {
	console.log("Service name:", config.APP_NAME);
	console.log("Service description:", config.APP_DESCRIPTION);
	console.log("Service version:", config.APP_VERSION);
	console.log("Service state:", config.APP_STATE);
	console.log("Service author:", config.APP_AUTHOR);
}

export async function version() {
	try {
		const response = await fetch(
			"https://api.github.com/repos/bujupah/yet-another-renderer/releases/latest"
		);
		const json = await response.json();
		if (json.tag_name && json.tag_name !== config.APP_VERSION) {
			console.log(`New version available: ${json.tag_name}`);
		} else if (json.tag_name) {
			console.log("You are using the latest version");
		}
	} catch (err) {
		console.error(err);
	} finally {
		console.log(`Service version: ${config.APP_VERSION}`);
	}
}
