/* オフラインでもスライドを開けるようにする仕組み（Service Worker）。tools/publish.js が書き出すときに中身を埋める。直接は編集しない。
   ・スライドと目次（.html）：ネットを優先して最新版を取る。3秒たっても返事がなければ、端末に保存してある版を出す。
   ・KaTeX と Google Fonts：端末に保存したものを使う（一度取れば変わらないため）。
   ・ページを開いたら、科目の全スライドを裏で1つずつ取って保存する（まだ開いていない回もオフラインで開けるように）。
     中身が変わったものだけ取り直す（ハッシュで判断）。 */
const NS = "sonosaki-slides";
const VERSION = "39c497e54a0a";
const FILES = {
 "index.html": "c33a641799aa",
 "trig/1_graph-shuuki.html": "af8a2d88b064",
 "trig/2_houteishiki-futoushiki.html": "7eb89bc93ed8",
 "trig/3_wa-sa-to-shiki.html": "49a5645c1e44",
 "trig/4_toushiki-shoumei.html": "b321b733c108",
 "trig/5_kahou-teiri-ouyou.html": "a4e63c466eed",
 "trig/6_baikaku-hankaku.html": "72fbabb72d4c",
 "trig/7_gousei.html": "ab60f4586eaf",
 "trig/8_saidai-saishou.html": "d698ff66ba24",
 "trig/9_t-okikae.html": "9bea3799426f",
 "trig/10_wa-seki-koushiki.html": "a5e6c616441d",
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
 "exp-log/1_shisuu-keisan.html": "cf1682a458ae",
 "exp-log/2_graph-daishou.html": "773c17d2f5df",
 "exp-log/3_houteishiki-futoushiki.html": "9cbd508c9009",
 "exp-log/4_saidai-saishou.html": "0a4641f1d388",
 "exp-log/5_taisuu-keisan.html": "e74194c154ed",
 "exp-log/6_taisuu-graph.html": "811ed3208712",
 "exp-log/7_taisuu-houteishiki.html": "8cc52d0edb22",
 "exp-log/8_log-okikae.html": "d274980c65d7",
 "exp-log/9_jouyou-taisuu.html": "659fb21fb5e3",
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
 "sequence/1_ippankou.html": "de5e08e3d71e",
 "sequence/2_tousa.html": "4bee87eacdff",
 "sequence/3_tousa-wa.html": "bafc701126b8",
 "sequence/4_touhi.html": "f71f9935102d",
 "sequence/5_touhi-wa.html": "90b751dd8a58",
 "sequence/6_sigma.html": "be22f2e27e7c",
 "sequence/7_kaisa.html": "4dbab7956809",
 "sequence/8_iroiro-wa.html": "4fd63600c818",
 "sequence/9_gun-suuretsu.html": "9bdb610e23da",
 "sequence/10_zenkashiki-kihon.html": "bc936deeb576",
 "sequence/11_zenkashiki-iroiro.html": "a1b979961cb5",
 "sequence/12_kinouhou.html": "cdb9619c9f43",
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
 "sequence/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6"
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
