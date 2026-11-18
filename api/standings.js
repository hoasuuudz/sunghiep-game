// GET /api/standings?league=ID -> bảng xếp hạng, cache 30 phút. Mùa trống thì thử lại mùa trước.
const { af, send, bad, check, season, leagueOf, C } = require('./_lib');
module.exports = async (req, res) => {
  const e = check('standings', req.query);
  if (e) return bad(res, e);
  const l = leagueOf(req.query), s = season(req.query), t = C.TTL.standings[0];
  let o = await af('/standings', { league: l, season: s }, t);
  if (!req.query.season && o.data && !o.data.length) o = await af('/standings', { league: l, season: s - 1 }, t);
  send(res, o, C.TTL.standings);
};
