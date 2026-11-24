/* config.js — Dữ liệu thế giới. Thêm giải, CLB hay quốc gia bằng cách thêm vào các mảng dưới đây.
   Mỗi CLB: [tên, sức mạnh 40-92]. w: hệ số lương của giải. */
const CFG={
 stats:{spd:'Tốc độ',sht:'Sút',pas:'Chuyền',drb:'Rê bóng',sta:'Thể lực',mnt:'Tinh thần'},
 pos:{FW:'Tiền đạo',MF:'Tiền vệ',DF:'Hậu vệ'},
 // [mã, tên, cờ, giải khởi đầu mặc định]
 nations:[['VN','Việt Nam','🇻🇳','vn'],['EN','Anh','🇬🇧','en'],['ES','Tây Ban Nha','🇪🇸','es'],['IT','Ý','🇮🇹','it'],['DE','Đức','🇩🇪','de'],['FR','Pháp','🇫🇷','fr'],['JP','Nhật Bản','🇯🇵','jp'],['BR','Brazil','🇧🇷','es'],['AR','Argentina','🇦🇷','es'],['PT','Bồ Đào Nha','🇵🇹','es']],
 leagues:{
  vn:{n:'V.League 1',f:'🇻🇳',w:.35,clubs:[['Công An Hà Nội',74],['Thể Công Viettel',73],['Hà Nội FC',70],['Thép Xanh Nam Định',71],['Becamex Bình Dương',66],['Thanh Hóa',65],['Sông Lam Nghệ An',64],['Hải Phòng',63],['Hoàng Anh Gia Lai',62],['TP. Hồ Chí Minh',60],['Đà Nẵng',58],['Hồng Lĩnh Hà Tĩnh',57]]},
  en:{n:'Premier League',f:'🇬🇧',w:1.6,clubs:[['Manchester City',90],['Arsenal',88],['Liverpool',88],['Chelsea',84],['Manchester United',82],['Tottenham',82],['Newcastle',80],['Aston Villa',79],['Brighton',76],['West Ham',74],['Fulham',72],['Brentford',71]]},
  es:{n:'La Liga',f:'🇪🇸',w:1.3,clubs:[['Real Madrid',91],['Barcelona',88],['Atlético Madrid',85],['Real Sociedad',78],['Athletic Bilbao',78],['Sevilla',77],['Villarreal',76],['Real Betis',76],['Valencia',74],['Girona',74],['Osasuna',70],['Celta Vigo',69]]},
  it:{n:'Serie A',f:'🇮🇹',w:1.1,clubs:[['Inter',86],['AC Milan',83],['Juventus',83],['Napoli',82],['Atalanta',82],['Roma',80],['Lazio',79],['Fiorentina',77],['Bologna',76],['Torino',73],['Genoa',70],['Udinese',69]]},
  de:{n:'Bundesliga',f:'🇩🇪',w:1.2,clubs:[['Bayern Munich',90],['Bayer Leverkusen',86],['Borussia Dortmund',84],['RB Leipzig',84],['Stuttgart',79],['Eintracht Frankfurt',78],['Freiburg',74],['Wolfsburg',72],['Mainz',71],['Werder Bremen',71],['Augsburg',68],['Union Berlin',68]]},
  fr:{n:'Ligue 1',f:'🇫🇷',w:1.0,clubs:[['Paris Saint-Germain',88],['Monaco',80],['Marseille',79],['Lille',78],['Lyon',78],['Lens',76],['Nice',75],['Rennes',74],['Reims',69],['Toulouse',68],['Nantes',67],['Strasbourg',66]]},
  jp:{n:'J1 League',f:'🇯🇵',w:.6,clubs:[['Vissel Kobe',68],['Yokohama F. Marinos',67],['Kawasaki Frontale',67],['Urawa Reds',66],['Sanfrecce Hiroshima',65],['Kashima Antlers',64],['Gamba Osaka',63],['FC Tokyo',62],['Cerezo Osaka',62],['Nagoya Grampus',61],['Kashiwa Reysol',60],['Avispa Fukuoka',58]]}
 },
 rules:{startAge:16,retireAge:35,pointsToSpend:30,baseStat:48,roundsDefault:22}
};
