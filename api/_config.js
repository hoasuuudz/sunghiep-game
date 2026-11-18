// Cấu hình chung cho các serverless function.
// File bắt đầu bằng "_" thì Vercel không coi là endpoint.
module.exports = {
  BASE: 'https://v3.football.api-sports.io',
  // ID giải trên API-Football
  LEAGUES: { 340: 'V.League 1', 39: 'Premier League', 140: 'La Liga', 135: 'Serie A', 78: 'Bundesliga', 61: 'Ligue 1', 2: 'Champions League' },
  // [s-maxage, stale-while-revalidate] tính bằng giây
  TTL: { standings: [1800, 600], fixtures: [21600, 3600], live: [60, 30], squad: [604800, 86400] },
  // Mùa mặc định. Gói free chỉ cho 2022-2024. Đặt biến môi trường SEASON (vd 2026) để ghi đè khi nâng gói.
  DEFAULT_SEASON: 2024,
  MIN_REMAINING: 10,        // còn dưới số request này thì ngừng gọi API-Football
  QUOTA_STALE_MS: 3600000,  // giá trị remaining cũ hơn 1 giờ thì bỏ qua (quota reset 00:00 UTC)
  UPSTREAM_PER_MIN: 30,     // tối đa số lần gọi upstream mỗi phút trên mỗi instance
  TIMEOUT_MS: 8000,         // timeout mỗi lần gọi API-Football
  CACHE_MAX: 300,           // số mục tối đa của cache trong bộ nhớ instance
  TEAM_ID_MAX: 200000       // team id lớn nhất được chấp nhận
};
