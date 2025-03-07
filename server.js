import { createServer } from "http";
import { parse } from "url";
import next from "next";

// Direct values for cPanel Admin Direct
const port = 7777; // Common port for Node.js on cPanel
const dev = false; // Set to false for production
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port);

  console.log(
    `> Server listening at http://localhost:${port} as ${
      dev ? "development" : "production"
    }`
  );
});
