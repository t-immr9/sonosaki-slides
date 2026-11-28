/* オフラインでもスライドを開けるようにする仕組み（Service Worker）。tools/publish.js が書き出すときに中身を埋める。直接は編集しない。
   ・スライドと目次（.html）：ネットを優先して最新版を取る。3秒たっても返事がなければ、端末に保存してある版を出す。
   ・KaTeX と Google Fonts：端末に保存したものを使う（一度取れば変わらないため）。
   ・ページを開いたら、科目の全スライドを裏で1つずつ取って保存する（まだ開いていない回もオフラインで開けるように）。
     中身が変わったものだけ取り直す（ハッシュで判断）。 */
const NS = "sonosaki-slides";
const VERSION = "3aa9afd499cb";
const FILES = {
 "index.html": "61a223bdab90",
 "quadratic/1_houteishiki-graph.html": "a5ba8ea73197",
 "quadratic/2_futoushiki.html": "a849470834b8",
 "quadratic/3_hanbetsushiki.html": "e8b7ccf7dead",
 "quadratic/4_bunshoudai.html": "8777e04c9a74",
 "quadratic/5_tsuneni.html": "76ad83281ad9",
 "quadratic/6_keisuu-fugou.html": "07e281751c17",
 "quadratic/7_moji-keisuu.html": "536bef30b643",
 "quadratic/8_kyoutsuukai.html": "ffdab44ff13a",
 "quadratic/9_hani-tsuneni.html": "9d2492eecb5d",
 "quadratic/10_kai-haichi.html": "17788d2fd580",
 "quadratic/11_jouken-saidai.html": "e2d634496ecb",
 "quadratic/12_zettaichi.html": "7a1f91692d88",
 "quadratic/katex/katex.min.css": "3f94e1b737ae",
 "quadratic/katex/katex.min.js": "4881bfc93aaf",
 "quadratic/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "quadratic/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "quadratic/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "quadratic/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "quadratic/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "quadratic/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "quadratic/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "quadratic/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "quadratic/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "quadratic/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "quadratic/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "quadratic/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "quadratic/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "quadratic/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "quadratic/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "quadratic/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "quadratic/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "quadratic/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "quadratic/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "quadratic/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "data-analysis/1_daihyouchi.html": "386004dd4bae",
 "data-analysis/2_chuuouchi-moji.html": "34a36f15f6cb",
 "data-analysis/3_shibuni-hakohige.html": "c2a094b6157c",
 "data-analysis/4_bunsan.html": "857e1504e948",
 "data-analysis/5_henryou-henkan.html": "a86e985fb31e",
 "data-analysis/6_gattai.html": "9334003691e5",
 "data-analysis/7_shuusei.html": "a4ac0f728f57",
 "data-analysis/8_sanpuzu.html": "5cc86dd97782",
 "data-analysis/9_soukan-keisuu.html": "b02b8762f237",
 "data-analysis/katex/katex.min.css": "3f94e1b737ae",
 "data-analysis/katex/katex.min.js": "4881bfc93aaf",
 "data-analysis/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "data-analysis/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "data-analysis/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "data-analysis/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "data-analysis/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "data-analysis/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "data-analysis/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "data-analysis/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "data-analysis/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "data-analysis/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "data-analysis/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "data-analysis/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "data-analysis/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "data-analysis/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "data-analysis/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "data-analysis/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "data-analysis/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "data-analysis/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "data-analysis/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "data-analysis/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "trig-ratio/1_chokkaku-sankakkei.html": "a692df49151d",
 "trig-ratio/2_15do.html": "6e72470eb6cb",
 "trig-ratio/3_sokuryou-gyoukaku.html": "1c38b5ce745c",
 "trig-ratio/4_katamuki-kaku.html": "d8d62b70793f",
 "trig-ratio/5_180do-naikaku.html": "81e6daec0f6b",
 "trig-ratio/6_sin-cos-wa.html": "4b671cd38521",
 "trig-ratio/7_seigen-yogen.html": "3cf5ae22a2d4",
 "trig-ratio/8_keijou.html": "a0c212e041b2",
 "trig-ratio/9_naisetsu-shikakkei.html": "74d325a2eb4e",
 "trig-ratio/10_menseki-naisetsuen.html": "26405c1fbc6a",
 "trig-ratio/11_sokuryou.html": "e1d5e2431d5e",
 "trig-ratio/12_kuukan-zukei.html": "3f78cad3d0b0",
 "trig-ratio/katex/katex.min.css": "3f94e1b737ae",
 "trig-ratio/katex/katex.min.js": "4881bfc93aaf",
 "trig-ratio/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "trig-ratio/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "trig-ratio/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "trig-ratio/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "trig-ratio/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "trig-ratio/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "trig-ratio/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "trig-ratio/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "trig-ratio/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "trig-ratio/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "trig-ratio/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "trig-ratio/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "trig-ratio/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "trig-ratio/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "trig-ratio/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "trig-ratio/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "trig-ratio/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "trig-ratio/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "trig-ratio/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "trig-ratio/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "geometry/1_goshin.html": "9b745b4bb918",
 "geometry/2_chuusen-menseki.html": "24e4aacaf462",
 "geometry/3_ceva-menelaus.html": "c29d6793d18a",
 "geometry/4_kyouen.html": "fd1d92e3faf7",
 "geometry/5_sessen-naisetsuen.html": "08fdbc3dcef4",
 "geometry/6_setsugen.html": "32fc35899c09",
 "geometry/7_houbeki.html": "6b696a6e9c77",
 "geometry/8_kyoutsuu-sessen.html": "127a1e394790",
 "geometry/9_sakuzu.html": "fc541773488e",
 "geometry/10_saitan-keiro.html": "260362da6a9e",
 "geometry/11_kuukan-chokusen.html": "c94b6290384b",
 "geometry/12_tamentai.html": "ae2f3b654bf5",
 "geometry/katex/katex.min.css": "3f94e1b737ae",
 "geometry/katex/katex.min.js": "4881bfc93aaf",
 "geometry/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "geometry/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "geometry/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "geometry/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "geometry/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "geometry/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "geometry/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "geometry/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "geometry/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "geometry/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "geometry/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "geometry/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "geometry/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "geometry/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "geometry/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "geometry/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "geometry/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "geometry/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "geometry/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "geometry/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "trig/1_graph-shuuki.html": "7638bb6dcf71",
 "trig/2_houteishiki-futoushiki.html": "c195aeb49221",
 "trig/3_wa-sa-to-shiki.html": "2f6faec1086b",
 "trig/4_toushiki-shoumei.html": "8e012e21b528",
 "trig/5_kahou-teiri-ouyou.html": "946415487163",
 "trig/6_baikaku-hankaku.html": "38cc6c63783e",
 "trig/7_gousei.html": "9560ec1a3d5d",
 "trig/8_saidai-saishou.html": "9f906ae9f8f0",
 "trig/9_t-okikae.html": "9c19ee93f4a1",
 "trig/10_wa-seki-koushiki.html": "a7ad7616e33c",
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
 "exp-log/1_shisuu-keisan.html": "4c8cd2bc9a0c",
 "exp-log/2_graph-daishou.html": "018ccbd44c7a",
 "exp-log/3_houteishiki-futoushiki.html": "9a970e036522",
 "exp-log/4_saidai-saishou.html": "f288a7d71feb",
 "exp-log/5_taisuu-keisan.html": "cff06fb00141",
 "exp-log/6_taisuu-graph.html": "13438b0237e0",
 "exp-log/7_taisuu-houteishiki.html": "b53d59452fe1",
 "exp-log/8_log-okikae.html": "4e1ef6d27afc",
 "exp-log/9_jouyou-taisuu.html": "1fa86dba4d95",
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
 "differential/1_doukansuu.html": "3d353be42557",
 "differential/2_sessen.html": "fc42c3bc9922",
 "differential/3_sessuru.html": "7d27cd0f1e59",
 "differential/4_zougenhyou.html": "b583982d037a",
 "differential/5_kyokuchi-keisuu.html": "9c14455237c4",
 "differential/6_kyokuchi-jouken.html": "dfc5ffe3a063",
 "differential/7_saidai-saishou.html": "9c6d64fcb6b2",
 "differential/8_moji-saidai.html": "d18b606230c8",
 "differential/9_bunshoudai.html": "cf024b90e8fc",
 "differential/10_jissuukai.html": "fd91d5037306",
 "differential/11_futoushiki.html": "d89d634e6a02",
 "differential/12_sessen-honsuu.html": "cadef2fa65ca",
 "differential/katex/katex.min.css": "3f94e1b737ae",
 "differential/katex/katex.min.js": "4881bfc93aaf",
 "differential/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "differential/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "differential/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "differential/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "differential/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "differential/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "differential/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "differential/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "differential/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "differential/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "differential/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "differential/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "differential/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "differential/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "differential/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "differential/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "differential/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "differential/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "differential/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "differential/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "integral/1_sekibun-keisan.html": "60383d01ace4",
 "integral/2_sekibun-kansuu.html": "635f9d597374",
 "integral/3_teisekibun-kansuu.html": "54692f78a514",
 "integral/4_menseki-kihon.html": "3ba08cfe0ea2",
 "integral/5_rokubun-no-ichi.html": "7093e932ef0e",
 "integral/6_zettaichi.html": "a1500c0e4494",
 "integral/7_sessen-menseki.html": "3e1f12015de7",
 "integral/8_menseki-moji.html": "f8bd8443a7c0",
 "integral/9_en-houbutsusen.html": "a8e44e2bbbc8",
 "integral/katex/katex.min.css": "3f94e1b737ae",
 "integral/katex/katex.min.js": "4881bfc93aaf",
 "integral/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "integral/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "integral/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "integral/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "integral/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "integral/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "integral/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "integral/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "integral/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "integral/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "integral/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "integral/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "integral/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "integral/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "integral/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "integral/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "integral/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "integral/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "integral/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "integral/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "sequence/1_ippankou.html": "08e8132aa5f4",
 "sequence/2_tousa.html": "f12ea276d5f8",
 "sequence/3_tousa-wa.html": "7c5336764937",
 "sequence/4_touhi.html": "3faf88ec797a",
 "sequence/5_touhi-wa.html": "3607c4b7b3a9",
 "sequence/6_sigma.html": "029133feabe7",
 "sequence/7_kaisa.html": "f7c3b5274155",
 "sequence/8_iroiro-wa.html": "8e816d1f6c5d",
 "sequence/9_gun-suuretsu.html": "9977295a13b5",
 "sequence/10_zenkashiki-kihon.html": "78f6262bbb12",
 "sequence/11_zenkashiki-iroiro.html": "48ed2f28bed5",
 "sequence/12_kinouhou.html": "a3a313c19834",
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
 "vector/1_vector-towa.html": "4ceba48bd57d",
 "vector/2_wa-sa-jissuubai.html": "f15771e04769",
 "vector/3_keisan-zukei.html": "3e566c554a5a",
 "vector/4_seibun.html": "97260b2c1b17",
 "vector/5_naiseki.html": "21c87cde81f9",
 "vector/6_naiseki-keisan.html": "de12e8bc6ca1",
 "vector/7_ichi-vector.html": "3951a3f7cdff",
 "vector/8_icchokusen-kouten.html": "121b1399c8b0",
 "vector/9_zukei-shoumei.html": "5f63c285ea11",
 "vector/10_vector-houteishiki.html": "352866ca273b",
 "vector/11_sonzai-hani.html": "6c9d1cf02d10",
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
 "space-vector/1_kuukan-zahyou.html": "3179a4329d80",
 "space-vector/2_rittai-vector.html": "f832e55e1773",
 "space-vector/3_seibun.html": "5417db54186f",
 "space-vector/4_naiseki.html": "d084d27e2484",
 "space-vector/5_naiseki-ouyou.html": "408aa741fe9d",
 "space-vector/6_ichi-vector.html": "ec0ed5153192",
 "space-vector/7_chokusen-heimen.html": "3195d10c7fb7",
 "space-vector/8_kyuumen.html": "dd4cb8dbf5b4",
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
 "space-vector/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6",
 "complex/1_fukuso-heimen.html": "351969a7ab56",
 "complex/2_zettaichi-kyori.html": "faa1e17a2960",
 "complex/3_kyouyaku.html": "7972a20769fa",
 "complex/4_kyoku-keishiki.html": "1db001ebe17f",
 "complex/5_kaiten.html": "5ee7163405d4",
 "complex/6_de-moivre.html": "80a531f44a5e",
 "complex/7_n-jouken.html": "6aeec98fdc9d",
 "complex/8_en-suichoku.html": "e1645a131477",
 "complex/9_kiseki.html": "67ff433e4293",
 "complex/10_kaku-sankakkei.html": "a31a2126036b",
 "complex/11_kaiten-ouyou.html": "5c0feef58b61",
 "complex/katex/katex.min.css": "3f94e1b737ae",
 "complex/katex/katex.min.js": "4881bfc93aaf",
 "complex/katex/fonts/KaTeX_AMS-Regular.woff2": "34494743736f",
 "complex/katex/fonts/KaTeX_Caligraphic-Bold.woff2": "5bfa49cac46c",
 "complex/katex/fonts/KaTeX_Caligraphic-Regular.woff2": "9f8077e0b38a",
 "complex/katex/fonts/KaTeX_Fraktur-Bold.woff2": "f98f89272eca",
 "complex/katex/fonts/KaTeX_Fraktur-Regular.woff2": "a5764c6e2784",
 "complex/katex/fonts/KaTeX_Main-Bold.woff2": "31050a1b1b12",
 "complex/katex/fonts/KaTeX_Main-BoldItalic.woff2": "a4a4905b8b12",
 "complex/katex/fonts/KaTeX_Main-Italic.woff2": "c9b2b5ffd2f2",
 "complex/katex/fonts/KaTeX_Main-Regular.woff2": "c884086c25ce",
 "complex/katex/fonts/KaTeX_Math-BoldItalic.woff2": "8fcb9d2de65a",
 "complex/katex/fonts/KaTeX_Math-Italic.woff2": "db4883d0cff9",
 "complex/katex/fonts/KaTeX_SansSerif-Bold.woff2": "886e61797a52",
 "complex/katex/fonts/KaTeX_SansSerif-Italic.woff2": "3d5fa3cb309f",
 "complex/katex/fonts/KaTeX_SansSerif-Regular.woff2": "e45d5f4f4a7f",
 "complex/katex/fonts/KaTeX_Script-Regular.woff2": "63b80959f1fc",
 "complex/katex/fonts/KaTeX_Size1-Regular.woff2": "57fa599974a1",
 "complex/katex/fonts/KaTeX_Size2-Regular.woff2": "ee18713634a3",
 "complex/katex/fonts/KaTeX_Size3-Regular.woff2": "19a7caadfb66",
 "complex/katex/fonts/KaTeX_Size4-Regular.woff2": "9bed17fb92f2",
 "complex/katex/fonts/KaTeX_Typewriter-Regular.woff2": "7a08883fffc6"
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
