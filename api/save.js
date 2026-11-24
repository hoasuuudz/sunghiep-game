/* save.js — Lưu 3 slot bằng localStorage. Báo lỗi nếu không ghi được. */
const Save={k:i=>'sc2_slot'+i,
 get(i){try{return JSON.parse(localStorage.getItem(this.k(i)))}catch(e){return null}},
 put(i,c){try{localStorage.setItem(this.k(i),JSON.stringify(c));return true}catch(e){return false}},
 del(i){try{localStorage.removeItem(this.k(i))}catch(e){}}};
