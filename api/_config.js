// Cấu hình chung cho các serverless function.
// File bắt đầu bằng "_" thì Vercel không coi là endpoint.
module.exports = {
  BASE: 'https://v3.football.api-sports.io',
  // ID giải trên API-Football
  LEAGUES: { 340: 'V.League 1', 39: 'Premier League', 140: 'La Liga', 135: 'Serie A', 78: 'Bundesliga', 61: 'Ligue 1', 2: 'Champions League' },
  // [s-maxage, stale-while-revalidate] tính bằng giây
  TTL: { standings: [1800, 600], fixtures: [21600, 3600], live: [60, 30], squad: [604800, 86400] },
  MIN_REMAINING: 10 // còn dưới số request này thì ngừng gọi API-Football
};
