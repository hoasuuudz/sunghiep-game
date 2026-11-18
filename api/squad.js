// GET /api/squad?team=ID -> đội hình, cache 7 ngày
const { af, send, bad, check, C } = require('./_lib');
module.exports = async (req, res) => {
  const e = check('squad', req.query);
  if (e) return bad(res, e);
  send(res, await af('/players/squads', { team: Number(req.query.team) }, C.TTL.squad[0]), C.TTL.squad);
};
