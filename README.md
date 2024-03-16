# Yet another grafana-renderer

[![Stars](https://img.shields.io/github/stars/bujupah/yet-another-renderer)](https://github.com/bujupah/yet-another-renderer/stargazers)
[![Forks](https://img.shields.io/github/forks/bujupah/yet-another-renderer)](https://github.com/bujupah/yet-another-renderer/network/members)

[![License](https://img.shields.io/github/license/bujupah/yet-another-renderer)](https://github.com/bujupah/yet-another-renderer/blob/main/LICENSE)
[![Issues](https://img.shields.io/github/issues/bujupah/yet-another-renderer)](https://github.com/bujupah/yet-another-renderer/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/bujupah/yet-another-renderer)](https://github.com/bujupah/yet-another-renderer/pulls)
[![Last Commit](https://img.shields.io/github/last-commit/bujupah/yet-another-renderer)](https://github.com/bujupah/yet-another-renderer/commits/master)

Yet another grafana backend that handles rendering panels and dashboards to PNGs using a headless browser (Chromium).

## Why another grafana-image-renderer

This alternative plugin diverges from existing solutions by prioritizing efficiency, reducing dependencies, and enhancing functionality for remote server usage. It offers a streamlined approach to image rendering within Grafana, addressing specific pain points and providing additional features to cater to diverse user needs.

- Supports PNG, PDF, and XLSX formats
- Provides versatile options for image generation
- Enables users to choose the desired format based on their needs

## Requirements

- Node.js
- Chrome (Chromium) browser
- Supported operating systems: Linux, Windows, macOS
- Grafana plugin: [bujupah-renderer-app](https://github.com/bujupah/bujupah-renderer-app) (optional)

## Getting started

### Run in docker

Docker images are published at Docker Hub.

The following example shows how you can run Grafana and the remote HTTP rendering service in two separate Docker containers using Docker Compose.

Create a docker-compose.yml with the following content:

```yml
version: "2"

services:
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      GF_RENDERING_SERVER_URL: http://renderer:8081/render
      GF_RENDERING_CALLBACK_URL: http://grafana:3000/
      GF_LOG_FILTERS: rendering:debug
      # Renderer options
      GF_RENDERING_RENDERER_TOKEN: ${GRAFANA_RENDER_AUTH_TOKEN} # Can use the new grafana renderer auth token
      GF_RENDERING_CONCURRENT_RENDER_REQUEST_LIMIT: 100
  renderer:
    image: bujupah/yet-another-renderer:latest
    environment:
      RENDER_PORT: 8081
      RENDER_CONCURRENCY: 5
      RENDER_AUTH_SECRET_TOKEN: ${GRAFANA_RENDER_AUTH_TOKEN} # Can use the new grafana renderer auth token
environment:
  GRAFANA_RENDER_AUTH_TOKEN: "your_security_key_here" # remove this or set it to - to disable it
```

Next, run docker compose.

docker-compose up

---

### Run in local

To get started, clone the repository and then navigate into the project folder.

```sh
git clone https://github.com/bujupah/yet-another-renderer
cd yet-another-renderer
```

Next, you can install the required dependencies using one of the following package managers:

```sh
npm install
# yarn install
# pnpm install
```

Subsequently, install the new headless/chrome for puppeteer you can run the following command.
This command uses `@puppeteer/browser` to download the latest chrome binary.

```sh
npm run get:chrome
# yarn get:chrome
# pnpm get:chrome
```

Finally, to build the renderer simply go with the following command..

```sh
npm run build
# yarn build
# pnpm build
```

### Memory and stuff

A substantial amount of memory is necessary for rendering images due to the resource-intensive nature of the process. It is advised to have at least 16GB of available memory on the system to accommodate these requirements.

Fortunately, we've implemented a queueing system to address this challenge. This system effectively manages the workload by queuing requests and initiating the rendering process once resources become available. As a result, it alleviates the strain on the application and ensures that requests are handled efficiently, even during peak periods.

### Security

Re-using the same feature Grafana provided to address the security issues. </br>
Please read the security section in readme from grafana-image-renderer repository.
https://github.com/grafana/grafana-image-renderer#security

### Testing

Todo

### Get involved

If you're interested to get involved to the project:

- Join the community discussions on [GitHub Discussions](https://github.com/Bujupah/yet-another-renderer/discussions) to share feedback and ideas.
- Report bugs or suggest feature requests via [GitHub Issues](https://github.com/Bujupah/yet-another-renderer/issues).
- Contribute to the development by submitting pull requests or participating in discussions.

### Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

### License

This plugin is licensed under the [MIT License](https://github.com/Bujupah/yet-another-renderer?tab=MIT-1-ov-file), allowing for flexibility in usage and modification.
