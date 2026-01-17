import app from "../app.js";

export default function handler(req, res) {
  console.log('[HANDLER [...path]] Received request:', req.method, req.url);
  console.log('[HANDLER [...path]] App is:', app ? 'defined' : 'undefined');
  return app(req, res);
}
