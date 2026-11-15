// GET /api/standings?league=ID -> bảng xếp hạng, cache 30 phút
const { af, send, season, leagueOf, C } = require('./_lib');
module.exports = async (req, res) => {
  const l = leagueOf(req.query);
  if (!l) return res.status(400).json({ error: 'BAD_LEAGUE' });
  send(res, await af('/standings', { league: l, season: season(req.query) }), C.TTL.standings);
};
