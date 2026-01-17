import app from "../app.js";

export default function handler(req, res) {
  console.log('[HANDLER index] Received request:', req.method, req.url);
  console.log('[HANDLER index] App is:', app ? 'defined' : 'undefined');
  return app(req, res);
}
