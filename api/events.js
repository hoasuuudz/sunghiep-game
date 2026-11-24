/* events.js — Sự kiện sự nghiệp dạng dữ liệu. Thêm sự kiện mới bằng cách thêm vào mảng EVENTS.
   id: mã | t: tiêu đề | d: mô tả | w: trọng số | when(c): điều kiện (không có thì luôn được) | chainOnly: chỉ xuất hiện khi được nối tiếp
   ch: các lựa chọn { t: nhãn, fx: hiệu ứng, m: lời kể, next:{id, in: số tuần nữa} }
   fx: spd/sht/pas/drb/sta/mnt (cộng chỉ số), morale, energy, coach, team, fans, fame, money, form, bench (số trận bị cho dự bị), inj (tuần chấn thương) */
const EVENTS=[
{id:'coach_talk',t:'HLV gọi lên nói chuyện',d:'Thầy bảo thái độ tập luyện của bạn dạo này chưa đạt.',w:3,when:c=>c.rel.coach<75,ch:[
 {t:'Lắng nghe và hứa sửa',fx:{coach:5,mnt:1,morale:-2},m:'Thầy gật đầu, lần này có vẻ hài lòng.'},
 {t:'Cãi lại',fx:{coach:-9,fans:2,morale:3},m:'Không khí căng thẳng. Thầy ghi nhớ chuyện này.',next:{id:'coach_bench',in:1}}]},
{id:'coach_bench',t:'Thầy cho bạn ngồi dự bị',d:'Sau lần cãi nhau, thầy loại bạn khỏi đội hình xuất phát vài trận.',chainOnly:true,ch:[
 {t:'Xin lỗi thầy',fx:{coach:6,bench:1,morale:-3},m:'Bạn chịu ngồi dự bị một trận để đổi lấy sự tin tưởng.'},
 {t:'Im lặng chịu phạt',fx:{coach:-2,bench:3,morale:-6},m:'Bạn ngồi dự bị ba trận, trong lòng ấm ức.'}]},
{id:'team_row',t:'Hai đồng đội cãi nhau',d:'Hai đàn anh trong đội to tiếng ngay phòng thay đồ và nhìn sang bạn chờ phản ứng.',w:2,ch:[
 {t:'Đứng ra hòa giải',fx:{team:6,mnt:1,energy:-5},m:'Hai người bắt tay. Cả đội nể bạn hơn.'},
 {t:'Đứng về phía người lớn tuổi',fx:{team:-4,coach:3},m:'Một nửa đội thấy bạn nịnh người trên.',next:{id:'team_split',in:3}},
 {t:'Mặc kệ',fx:{team:-3},m:'Bạn tránh va chạm, nhưng ai cũng thấy.'}]},
{id:'team_split',t:'Phòng thay đồ chia phe',d:'Chuyện cãi vã cũ nổ ra thành hai phe, và bạn bị coi là người của một bên.',chainOnly:true,ch:[
 {t:'Rủ cả đội đi ăn làm lành',fx:{team:7,money:-60,morale:3},m:'Một bữa ăn làm nguội cả phòng thay đồ.'},
 {t:'Giữ khoảng cách',fx:{team:-5,form:-4},m:'Không khí nặng nề kéo phong độ của bạn xuống.'}]},
{id:'reporter',t:'Phóng viên hỏi về HLV',d:'Sau trận, phóng viên hỏi thẳng bạn nghĩ gì về cách dùng người của thầy.',w:2,when:c=>c.fame>8,ch:[
 {t:'Ủng hộ thầy',fx:{coach:4,fans:-1},m:'Câu trả lời an toàn.'},
 {t:'Nói thẳng',fx:{fame:4,fans:4,coach:-7},m:'Báo chí đăng rần rần, thầy thì không vui.'},
 {t:'Từ chối trả lời',fx:{fame:1},m:'Bạn gật đầu cười rồi đi tiếp.'}]},
{id:'night_out',t:'Rủ đi chơi khuya',d:'Cả hội rủ đi karaoke tới 2 giờ sáng, mai nghỉ tập.',w:3,ch:[
 {t:'Đi cùng',fx:{team:5,energy:-20,form:-3,morale:6},m:'Vui thật, nhưng sáng hôm sau mệt rã rời.',next:{id:'photo_leak',in:2}},
 {t:'Về ngủ',fx:{energy:8,team:-2},m:'Vài người thấy bạn khó gần.'}]},
{id:'photo_leak',t:'Ảnh đi chơi khuya bị tung lên mạng',d:'Một tấm ảnh bạn đứng giữa quán bar lan nhanh trên mạng xã hội.',chainOnly:true,ch:[
 {t:'Xin lỗi công khai',fx:{fame:-1,coach:-2,fans:2},m:'Sóng gió dịu nhanh.'},
 {t:'Phớt lờ',fx:{fame:2,fans:-5,coach:-6},m:'Ban huấn luyện mất kiên nhẫn với bạn.'}]},
{id:'family_money',t:'Gia đình xin giúp tiền',d:'Người thân gọi điện nhờ bạn giúp một khoản để sửa nhà.',w:2,when:c=>c.money>150,ch:[
 {t:'Giúp hết',fx:{money:-150,morale:6},m:'Cả nhà biết ơn. Bạn thấy nhẹ lòng.'},
 {t:'Giúp một phần',fx:{money:-60,morale:2},m:'Vừa đủ để yên tâm.'},
 {t:'Từ chối',fx:{morale:-6},m:'Bạn áy náy suốt cả tuần.'}]},
{id:'scout',t:'Tuyển trạch viên theo dõi bạn',d:'Một người lạ ngồi trên khán đài ghi chép suốt trận. Có tin là của một CLB lớn.',w:2,when:c=>c.form>62&&c.fame>5,ch:[
 {t:'Thi đấu như thể không biết gì',fx:{mnt:1,form:3},m:'Bạn tập trung đá thật tốt.',next:{id:'agent_call',in:2}},
 {t:'Cố gây ấn tượng',fx:{fame:3,form:-3,energy:-8},m:'Bạn làm quá nhiều, nhưng ai cũng để ý bạn.',next:{id:'agent_call',in:2}}]},
{id:'agent_call',t:'Người đại diện tìm đến',d:'Một người đại diện chào mời quản lý sự nghiệp của bạn.',chainOnly:true,ch:[
 {t:'Ký với ông ta',fx:{money:-50,fame:3,morale:4},m:'Bạn có người lo giấy tờ và đàm phán. Ông ta lấy một phần tiền của bạn.',flag:'agent'},
 {t:'Chưa cần',fx:{morale:-1},m:'Bạn tự lo mọi thứ.'}]},
{id:'niggle',t:'Đau nhẹ ở cơ đùi',d:'Bạn thấy hơi nhói ở đùi sau buổi tập.',w:2,when:c=>c.energy<60,ch:[
 {t:'Cố tập tiếp',fx:{sta:1,inj:2,form:-3},m:'Cơn đau nặng thêm. Bác sĩ bắt bạn nghỉ.'},
 {t:'Báo bác sĩ và nghỉ vài ngày',fx:{energy:18,form:1},m:'Cơ thể hồi phục tốt.'}]},
{id:'fans',t:'Fan chờ ngoài cổng',d:'Một nhóm fan nhí đợi bạn xin chữ ký sau buổi tập.',w:2,when:c=>c.fame>4,ch:[
 {t:'Chụp ảnh với mọi người',fx:{fans:5,morale:5,energy:-5},m:'Nụ cười của các em làm bạn thấy đáng.'},
 {t:'Vẫy tay rồi đi tiếp',fx:{fans:-1},m:'Có em thất vọng.'}]},
{id:'partner',t:'Gặp người đặc biệt',d:'Một người khiến bạn muốn chậm lại giữa guồng quay sự nghiệp.',w:1,when:c=>c.age>=18&&!c.flags.partner,ch:[
 {t:'Mở lòng',fx:{morale:8,energy:-5},m:'Bạn thấy tim nhẹ hẳn.',flag:'partner',next:{id:'partner_fight',in:5}},
 {t:'Tập trung sự nghiệp',fx:{form:2,morale:-3},m:'Bạn tự nhủ để sau.'}]},
{id:'partner_fight',t:'Cãi nhau với người yêu',d:'Lịch thi đấu dày đặc khiến hai người ít gặp nhau và cãi nhau to.',chainOnly:true,ch:[
 {t:'Dành thời gian bù đắp',fx:{morale:5,energy:-12,form:-2},m:'Hai người làm lành, nhưng bạn thiếu ngủ.'},
 {t:'Nói để sau trận đấu lớn',fx:{morale:-8,form:-3},m:'Chuyện chưa xong và bạn mang nó ra sân.'}]},
{id:'social_post',t:'Bài đăng cũ bị đào lại',d:'Một bài đăng thời học sinh của bạn bị lan truyền và gây tranh cãi.',w:1,when:c=>c.fame>12,ch:[
 {t:'Xin lỗi công khai',fx:{fame:-1,fans:2},m:'Câu chuyện nguội nhanh.'},
 {t:'Phản pháo',fx:{fame:4,fans:-4,coach:-4},m:'Bạn nổi tiếng hơn, nhưng ban lãnh đạo không thích.'},
 {t:'Lờ đi',fx:{morale:-3},m:'Bạn tắt thông báo cả tuần.'}]},
{id:'mentor',t:'Đàn anh muốn kèm cặp',d:'Một cầu thủ kỳ cựu ngỏ ý chỉ cho bạn những điều không có trong sách.',w:2,when:c=>c.age<24,ch:[
 {t:'Nhận lời',fx:{mnt:1,pas:1,team:3,energy:-6},m:'Bạn học được rất nhiều từ ông ấy.'},
 {t:'Từ chối khéo',fx:{team:-2},m:'Ông ấy hơi buồn.'}]}
];
