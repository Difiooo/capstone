const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  let requestedPath = req.url.split("?")[0];

  if (requestedPath === "/") {
    requestedPath = "/index.html";
  }

  const filePath = path.join(
    process.cwd(),
    "public",
    requestedPath
  );

  if (!filePath.startsWith(path.join(process.cwd(), "public"))) {
    res.statusCode = 403;
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      return res.end("Not Found");
    }

    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon"
    };

    res.setHeader(
      "Content-Type",
      mimeTypes[ext] || "application/octet-stream"
    );

    res.statusCode = 200;
    res.end(data);
  });
};