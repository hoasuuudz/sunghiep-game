const C = require('./_config');
let remaining = null, remainingAt = 0; // đọc từ header x-ratelimit-requests-remaining
const MEM = new Map(), hits = [];     // cache và bộ đếm trong bộ nhớ của từng instance

// Mùa mặc định. Gói free của API-Football chỉ cho 2022-2024.
// Giá trị mặc định nằm trong _config.js. Khi nâng gói, đặt biến môi trường SEASON (vd 2026) trên Vercel.
const DEFAULT_SEASON = parseInt(process.env.SEASON, 10) || C.DEFAULT_SEASON;
const SEASONS = [DEFAULT_SEASON, DEFAULT_SEASON - 1];

const ALLOWED = { fixtures: ['league', 'live', 'season'], standings: ['league', 'season'], squad: ['team'] };

// Trả về mã lỗi nếu có tham số lạ hoặc giá trị ngoài phạm vi, để không ai tạo vô số key cache.
function check(kind, q) {
  for (const k of Object.keys(q)) if (!ALLOWED[kind].includes(k)) return 'BAD_PARAM_' + k;
  if (q.season !== undefined && !SEASONS.includes(Number(q.season))) return 'BAD_SEASON';
  if (q.live !== undefined && q.live !== '1') return 'BAD_LIVE';
  if (kind === 'squad') { const t = Number(q.team); if (!Number.isInteger(t) || t < 1 || t > C.TEAM_ID_MAX) return 'BAD_TEAM'; }
  else if (!C.LEAGUES[q.league]) return 'BAD_LEAGUE';
  return null;
}
const season = (q) => (SEASONS.includes(Number(q.season)) ? Number(q.season) : DEFAULT_SEASON);
const leagueOf = (q) => (C.LEAGUES[q.league] ? Number(q.league) : null);

// Giá trị remaining cũ hơn 1 giờ hoặc sang ngày UTC mới thì bỏ qua (quota reset 00:00 UTC).
function quotaLow() {
  if (remaining === null || remaining >= C.MIN_REMAINING) return false;
  const now = Date.now();
  if (now - remainingAt > C.QUOTA_STALE_MS || new Date(now).getUTCDate() !== new Date(remainingAt).getUTCDate()) { remaining = null; return false; }
  return true;
}

async function af(path, params, ttl) {
  const key = process.env.API_FOOTBALL_KEY; // KHÔNG bao giờ để key ở frontend
  if (!key) return { err: 'NO_KEY', status: 500 };
  const ck = path + '?' + Object.keys(params).sort().map((k) => k + '=' + params[k]).join('&');
  const now = Date.now(), hit = MEM.get(ck);
  if (hit && ttl && now - hit.at < ttl * 1000) return { data: hit.data };
  if (quotaLow()) return { err: 'QUOTA', status: 429 };
  while (hits.length && now - hits[0] > 6e4) hits.shift();
  if (hits.length >= C.UPSTREAM_PER_MIN) return { err: 'BUSY', status: 429 };
  hits.push(now);
  const u = new URL(C.BASE + path);
  for (const k in params) u.searchParams.set(k, params[k]);
  let r;
  try {
    r = await fetch(u, { headers: { 'x-apisports-key': key }, signal: AbortSignal.timeout ? AbortSignal.timeout(C.TIMEOUT_MS) : undefined });
  } catch (e) { return { err: 'NETWORK', status: 502 }; }
  const rem = r.headers.get('x-ratelimit-requests-remaining');
  if (rem !== null && rem !== '') { remaining = +rem; remainingAt = Date.now(); }
  if (!r.ok) return { err: 'UPSTREAM_' + r.status, status: 502 };
  const j = await r.json();
  const er = j.errors;
  if (er && (Array.isArray(er) ? er.length : Object.keys(er).length)) return { err: 'API_ERROR', status: 429, detail: er };
  if (ttl) { if (MEM.size > C.CACHE_MAX) MEM.delete(MEM.keys().next().value); MEM.set(ck, { at: Date.now(), data: j.response }); }
  return { data: j.response };
}

function send(res, out, ttl) {
  if (out.err) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(out.status).json({ error: out.err, detail: out.detail, remaining });
  }
  res.setHeader('Cache-Control', `public, s-maxage=${ttl[0]}, stale-while-revalidate=${ttl[1]}`);
  res.status(200).json({ data: out.data, at: Date.now(), remaining });
}
const bad = (res, e) => { res.setHeader('Cache-Control', 'no-store'); return res.status(400).json({ error: e }); };

module.exports = { af, send, bad, check, season, leagueOf, C };
