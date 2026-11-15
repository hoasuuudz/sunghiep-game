const C = require('./_config');
let remaining = null; // đọc từ header x-ratelimit-requests-remaining

// Mùa giải mặc định. Gói free của API-Football chỉ cho 2022-2024.
// Khi nâng gói, thêm biến môi trường SEASON (vd 2026) trên Vercel là xong, không cần sửa code.
const DEFAULT_SEASON = parseInt(process.env.SEASON, 10) || 2024;

// Có thể ép mùa bằng ?season=2023
const season = (q) => {
  const s = parseInt(q.season, 10);
  return s > 2000 && s < 2100 ? s : DEFAULT_SEASON;
};

const leagueOf = (q) => { const l = parseInt(q.league, 10); return C.LEAGUES[l] ? l : null; };

async function af(path, params) {
  const key = process.env.API_FOOTBALL_KEY; // KHÔNG bao giờ để key ở frontend
  if (!key) return { err: 'NO_KEY', status: 500 };
  if (remaining !== null && remaining < C.MIN_REMAINING) return { err: 'QUOTA', status: 429 };
  const u = new URL(C.BASE + path);
  for (const k in params) u.searchParams.set(k, params[k]);
  let r;
  try { r = await fetch(u, { headers: { 'x-apisports-key': key } }); }
  catch (e) { return { err: 'NETWORK', status: 502 }; }
  const rem = r.headers.get('x-ratelimit-requests-remaining');
  if (rem !== null && rem !== '') remaining = +rem;
  if (!r.ok) return { err: 'UPSTREAM_' + r.status, status: 502 };
  const j = await r.json();
  const er = j.errors;
  if (er && (Array.isArray(er) ? er.length : Object.keys(er).length)) return { err: 'API_ERROR', status: 429, detail: er };
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

module.exports = { af, send, season, leagueOf, C };
