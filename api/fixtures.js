// GET /api/fixtures?league=ID            -> lịch + kết quả (từ -14 đến +21 ngày), cache 6 giờ
// GET /api/fixtures?league=ID&live=1     -> trận đang diễn ra, cache 60 giây
const { af, send, bad, check, season, leagueOf, C } = require('./_lib');
module.exports = async (req, res) => {
  const e = check('fixtures', req.query);
  if (e) return bad(res, e);
  const l = leagueOf(req.query);
  if (req.query.live) return send(res, await af('/fixtures', { live: l }, C.TTL.live[0]), C.TTL.live);
  const d = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  send(res, await af('/fixtures', { league: l, season: season(req.query), from: d(-14), to: d(21) }, C.TTL.fixtures[0]), C.TTL.fixtures);
};
