/* オフラインでもスライドを開けるようにする仕組み（Service Worker）。tools/publish.js が書き出すときに中身を埋める。直接は編集しない。
   ・スライドと目次（.html）：ネットを優先して最新版を取る。3秒たっても返事がなければ、端末に保存してある版を出す。
   ・KaTeX と Google Fonts：端末に保存したものを使う（一度取れば変わらないため）。
   ・ページを開いたら、科目の全スライドを裏で1つずつ取って保存する（まだ開いていない回もオフラインで開けるように）。
     中身が変わったものだけ取り直す（ハッシュで判断）。 */
const NS = "sonosaki-slides";
const VERSION = "1b16d4160031";
const FILES = {
 "index.html": "49e2b6a52923",
 "trig/1_graph-shuuki.html": "07adf17c57bf",
 "trig/2_houteishiki-futoushiki.html": "4d91a0f95cf0",
 "trig/3_wa-sa-to-shiki.html": "c8cfc2225e9c",
 "trig/4_toushiki-shoumei.html": "45d4377588db",
 "trig/5_kahou-teiri-ouyou.html": "716f40dbe5f7",
 "trig/6_baikaku-hankaku.html": "e3b9750082c3",
 "trig/7_gousei.html": "1553561671f4",
 "trig/8_saidai-saishou.html": "ddaa38cc576c",
 "trig/9_t-okikae.html": "e420041ef79d",
 "trig/10_wa-seki-koushiki.html": "1fdb2e7f57f6",
 "trig/katex/katex.min.css": "3f94e1b737ae",
 "trig/katex/katex.min.js": "4881bfc93aaf",
 "trig/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "trig/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "trig/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "trig/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "trig/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "trig/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "trig/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "trig/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "trig/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "trig/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "trig/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "trig/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "trig/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "trig/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "trig/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "trig/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "trig/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "trig/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "trig/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "trig/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "exp-log/1_shisuu-keisan.html": "f22e2f9c50e9",
 "exp-log/2_graph-daishou.html": "3e1fdd0a5a7e",
 "exp-log/3_houteishiki-futoushiki.html": "b57820baad28",
 "exp-log/4_saidai-saishou.html": "013d262b1ebb",
 "exp-log/5_taisuu-keisan.html": "da1b8ec32101",
 "exp-log/6_taisuu-graph.html": "badc656e36ca",
 "exp-log/7_taisuu-houteishiki.html": "99794d204a4d",
 "exp-log/8_log-okikae.html": "e48cc61a64b6",
 "exp-log/9_jouyou-taisuu.html": "e10583b0c00d",
 "exp-log/katex/katex.min.css": "3f94e1b737ae",
 "exp-log/katex/katex.min.js": "4881bfc93aaf",
 "exp-log/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "exp-log/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "exp-log/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "exp-log/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "exp-log/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "exp-log/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "exp-log/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "exp-log/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "exp-log/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "exp-log/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "exp-log/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "exp-log/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "exp-log/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "exp-log/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "exp-log/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "exp-log/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "exp-log/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "exp-log/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "exp-log/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "exp-log/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "sequence/1_ippankou.html": "ada2aa6764af",
 "sequence/2_tousa.html": "7051dec314f6",
 "sequence/3_tousa-wa.html": "b2ec0dae79ad",
 "sequence/4_touhi.html": "806fa14fef12",
 "sequence/5_touhi-wa.html": "3738b55407f9",
 "sequence/6_sigma.html": "6490af43b3c4",
 "sequence/7_kaisa.html": "ccdc6396e4e8",
 "sequence/8_iroiro-wa.html": "6e6139490266",
 "sequence/9_gun-suuretsu.html": "dcaa603cb125",
 "sequence/10_zenkashiki-kihon.html": "1b8eb823a344",
 "sequence/11_zenkashiki-iroiro.html": "3a2cabb65913",
 "sequence/12_kinouhou.html": "d0a1ef26d06f",
 "sequence/katex/katex.min.css": "3f94e1b737ae",
 "sequence/katex/katex.min.js": "4881bfc93aaf",
 "sequence/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "sequence/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "sequence/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "sequence/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "sequence/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "sequence/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "sequence/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "sequence/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "sequence/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "sequence/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "sequence/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "sequence/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "sequence/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "sequence/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "sequence/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "sequence/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "sequence/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "sequence/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "sequence/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "sequence/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "vector/1_vector-towa.html": "24697d44f2f7",
 "vector/2_wa-sa-jissuubai.html": "9cf7d3de8b49",
 "vector/3_keisan-zukei.html": "a018696b313e",
 "vector/4_seibun.html": "3ee05ee8492e",
 "vector/5_naiseki.html": "5d5913b95a88",
 "vector/6_naiseki-keisan.html": "353ce4ffe829",
 "vector/7_ichi-vector.html": "78a55611cd1f",
 "vector/8_icchokusen-kouten.html": "30195ea90a6b",
 "vector/9_zukei-shoumei.html": "9055f1112cce",
 "vector/10_vector-houteishiki.html": "88ebdf243b87",
 "vector/11_sonzai-hani.html": "f359ec6b1901",
 "vector/katex/katex.min.css": "3f94e1b737ae",
 "vector/katex/katex.min.js": "4881bfc93aaf",
 "vector/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "vector/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "vector/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "vector/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "vector/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "vector/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "vector/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "vector/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "vector/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "vector/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "vector/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "vector/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "vector/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "vector/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "vector/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "vector/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "vector/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "vector/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "vector/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "vector/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "space-vector/1_kuukan-zahyou.html": "85b2370ad41d",
 "space-vector/2_rittai-vector.html": "f14c3359b441",
 "space-vector/3_seibun.html": "263bd79688ed",
 "space-vector/4_naiseki.html": "b07240b01b01",
 "space-vector/5_naiseki-ouyou.html": "67a9b7c4405d",
 "space-vector/6_ichi-vector.html": "2f3b56aeadfd",
 "space-vector/7_chokusen-heimen.html": "f2757ed3dcb3",
 "space-vector/8_kyuumen.html": "e2b023a327ab",
 "space-vector/katex/katex.min.css": "3f94e1b737ae",
 "space-vector/katex/katex.min.js": "4881bfc93aaf",
 "space-vector/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "space-vector/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "space-vector/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "space-vector/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "space-vector/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "space-vector/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "space-vector/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "space-vector/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "space-vector/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "space-vector/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "space-vector/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "space-vector/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "space-vector/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "space-vector/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "space-vector/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "space-vector/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "space-vector/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "space-vector/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "space-vector/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "space-vector/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6"
};                 // 公開フォルダからの相対パス → 元ファイルのハッシュ
const FONT_CSS = [
 "https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&display=swap",
 "https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=Noto+Serif:ital@1&display=swap"
];           // スライドが読み込む Google Fonts の CSS
const PAGES = NS + ':pages', FONTS = NS + ':fonts', META = NS + ':meta';
const TIMEOUT = 3000;
const BASE = new URL('./', self.location).href;

// URL の ? と # を取り、フォルダで終わるときは index.html を付ける（保存の名前をそろえる）
function keyOf(u) {
  const x = new URL(u); x.search = ''; x.hash = '';
  if (x.pathname.endsWith('/')) x.pathname += 'index.html';
  return x.href;
}
const isPage = k => k.endsWith('.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));

// リダイレクトを経た応答はページの表示に使えないことがあるので、中身だけの応答に作り直す
async function clean(r) {
  if (!r.redirected) return r;
  return new Response(await r.blob(), { status: r.status, statusText: r.statusText, headers: r.headers });
}
async function fetchFresh(key) {
  return clean(await fetch(key, { cache: 'no-cache', credentials: 'same-origin' }));
}

// 全ファイルを順に保存する。同時に何本も取りに行かないので、回線が弱くても授業の表示を邪魔しにくい
let filling = null;
function fill() {
  if (!filling) filling = (async () => {
    const pages = await caches.open(PAGES), meta = await caches.open(META);
    let saved = {};
    try { const m = await meta.match('hashes'); if (m) saved = await m.json(); } catch (e) {}
    const want = new Set();
    for (const [rel, h] of Object.entries(FILES)) {
      const key = new URL(rel, BASE).href; want.add(key);
      if (saved[rel] === h && await pages.match(key)) continue;
      try {
        const r = await fetchFresh(key);
        if (!r.ok) continue;
        await pages.put(key, r);
        saved[rel] = h;
        await meta.put('hashes', new Response(JSON.stringify(saved)));
      } catch (e) { break; }          // つながらなくなったらやめて、次に開いたときに続きから
    }
    // 公開をやめたファイルは消す
    for (const req of await pages.keys()) if (!want.has(req.url)) await pages.delete(req);
    // フォント：日本語のフォントは文字の範囲ごとに小さなファイルに分かれていて、ふだんは表示した文字の分だけ取る。
    // まだ開いていないスライドの文字もオフラインで出るように、全部の範囲を最後に1つずつ保存する
    const fonts = await caches.open(FONTS);
    for (const css of FONT_CSS) {
      try {
        let r = await fonts.match(css);
        if (!r) { r = await fetchFont(css); if (!r) continue; await fonts.put(css, r.clone()); }
        const urls = [...new Set((await r.text()).match(/https:\/\/fonts\.gstatic\.com\/[^)'"\s]+/g) || [])];
        for (const u of urls) {
          if (await fonts.match(u)) continue;
          const f = await fetchFont(u); if (f) await fonts.put(u, f);
        }
      } catch (e) { break; }
    }
  })().finally(() => { filling = null; });
  return filling;
}

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith(NS + ':') && ![PAGES, FONTS, META].includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener('message', e => { if (e.data === 'fill') e.waitUntil(fill()); });

// ネット優先（3秒で保存してある版に切り替え）。取れた最新版は保存しておく
async function networkFirst(e, key) {
  const pages = await caches.open(PAGES);
  const net = fetchFresh(key).then(async r => { if (r.ok) await pages.put(key, r.clone()); return r; });
  e.waitUntil(net.catch(() => {}));
  const cached = await pages.match(key);
  if (!cached) return net.catch(() => offline());
  return Promise.race([
    net.then(r => (r.status >= 500 ? cached : r), () => cached),
    sleep(TIMEOUT).then(() => cached),
  ]);
}
// 保存してあればそれを使う。なければ取って保存する（取れなかった応答は保存しない）
async function cacheFirst(req, name, key) {
  const c = await caches.open(name);
  const hit = await c.match(key);
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok) await c.put(key, r.clone());
  return r;
}
// Google Fonts は CORS で取る（中身の成否が分かるので、失敗した応答を保存せずにすむ）
async function fetchFont(u) {
  const r = await fetch(u, { mode: 'cors', credentials: 'omit' });
  return r.ok ? r : null;
}
async function fontFirst(req) {
  const c = await caches.open(FONTS);
  const hit = await c.match(req.url);
  if (hit) return hit;
  const r = await fetchFont(req.url).catch(() => null);
  if (r) { await c.put(req.url, r.clone()); return r; }
  return fetch(req);
}
function offline() {
  return new Response('<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><body style="font-family:sans-serif;padding:2em;line-height:1.8">'
    + '<h2>ネットにつながっていません</h2><p>このページはまだこの端末に保存されていません。<br>ネットにつながる場所で一度開くと、次からはつながっていなくても開けます。</p></body>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com') {
    e.respondWith(fontFirst(req).catch(() => new Response('', { status: 504 })));
    return;
  }
  if (!req.url.startsWith(BASE)) return;
  const key = keyOf(req.url);
  if (req.mode === 'navigate' || isPage(key)) e.respondWith(networkFirst(e, key));
  else e.respondWith(caches.open(PAGES).then(c => c.match(key)).then(hit => hit || cacheFirst(req, PAGES, key)));
});
