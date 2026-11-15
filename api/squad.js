// GET /api/squad?team=ID -> đội hình, cache 7 ngày
const { af, send, C } = require('./_lib');
module.exports = async (req, res) => {
  const t = parseInt(req.query.team, 10);
  if (!(t > 0)) return res.status(400).json({ error: 'BAD_TEAM' });
  send(res, await af('/players/squads', { team: t }), C.TTL.squad);
};
