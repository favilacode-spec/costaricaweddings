// Vercel Serverless Function — /api/config.js
// Serves small runtime config (like the Web3Forms Access Key) to the browser
// by reading it from Vercel's environment variables, so the value never has
// to live in the git repository.
//
// Note: Web3Forms' own documentation states this key is not a secret and is
// safe to expose to site visitors — the form must submit directly from the
// browser to Web3Forms (their API rejects server-to-server calls on the free
// plan). Keeping it out of git is just good hygiene, not a security requirement.
//
// Setup (already done by Fabian in the Vercel dashboard):
//   Project Settings -> Environment Variables -> WEB3FORMS_ACCESS_KEY

module.exports = function handler(req, res) {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  var key = process.env.WEB3FORMS_ACCESS_KEY || "";
  res.status(200).send("window.WEB3FORMS_ACCESS_KEY = " + JSON.stringify(key) + ";");
};
