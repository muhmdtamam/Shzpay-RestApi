/*
  Katalog endpoint SHZPAY, satu sumber data untuk semua halaman.
  Mengikuti backend shzpay-api (server.js):
    GET  /download/<platform>?q=<url>[&method=<scraper>]
    GET  /ai/gemini?text=<pesan>[&system=][&sessionId=]
    POST /ai/gemini  (body JSON: text, system, sessionId)
    GET  /health, GET /
  Domain pada contoh respons memakai example.com sebagai placeholder.
*/
(function () {
  // Backend berada di domain lain dari halaman ini, jadi base URL ditulis tetap.
  var baseUrl = 'https://api.shzpay.biz.id';

  var categories = [
    { cat: 'download', label: 'Download' },
    { cat: 'ai', label: 'AI' },
    { cat: 'system', label: 'Sistem' }
  ];

  function ok(result) {
    return { status: true, dev: '@muhmdtamam', credits: 'shzpay-api', result: result };
  }

  function dl(type, quality, name) {
    return { type: type, quality: quality, url: 'https://example.com/' + name };
  }

  var BROWSER_NOTE = 'Scraper berikut membutuhkan browser (Chrome) di server dan tidak dipakai pada mode otomatis: ';

  // Satu baris per platform di folder lib/ pada backend.
  var platforms = [
    {
      id: 'tiktok', label: 'TikTok',
      desc: 'Mengunduh video atau foto TikTok tanpa watermark.',
      example: 'https://www.tiktok.com/@starxcean/video/7641620679846153492',
      methods: ['snaptik', 'tiktokio', 'ssstik', 'tikdownloader', 'savetik'], browser: ['savetik'],
      alias: 'tt',
      note: 'Sebagian scraper juga menyertakan field author dan stats.',
      result: { title: 'evening view today', thumbnail: 'https://example.com/tiktok/cover.jpg', type: 'video',
        downloads: [dl('mp4', 'Normal', 'tiktok/video.mp4'), dl('mp4', 'HD', 'tiktok/video-hd.mp4')] }
    },
    {
      id: 'youtube', label: 'YouTube',
      desc: 'Mengambil tautan unduhan video YouTube. Tautan playlist (youtube.com/playlist) otomatis memakai method playlist dan mengembalikan daftar item.',
      example: 'https://youtu.be/RxiTWxP9Xf4',
      methods: ['ytmp3', 'ytmp3gg', 'playlist'], alias: 'yt',
      note: 'Untuk tautan playlist, respons berisi type "playlist", itemCount, dan items (id, title, author, thumbnail, url).',
      result: { title: 'Judul video', thumbnail: 'https://example.com/youtube/thumb.jpg', type: 'video',
        downloads: [dl('video', '720p', 'youtube/video.mp4')] }
    },
    {
      id: 'instagram', label: 'Instagram',
      desc: 'Mengunduh foto, video, atau carousel dari post dan reels Instagram.',
      example: 'https://www.instagram.com/p/Dc8-_DptXHe/',
      methods: ['direct', 'indown', 'snapsave', 'snapinsta'], browser: ['snapinsta'], alias: 'ig',
      result: { title: 'Instagram Video (Dc8-_DptXHe)', thumbnail: 'https://example.com/instagram/thumb.jpg', type: 'video',
        author: { name: 'Nama Akun', username: '@akun' },
        downloads: [dl('video', 'HD', 'instagram/media.mp4')] }
    },
    {
      id: 'facebook', label: 'Facebook',
      desc: 'Mengunduh video publik dari Facebook.',
      example: 'https://www.facebook.com/watch/?v=10153231379946729',
      methods: ['snapsave', 'fdown'], browser: ['fdown'], alias: 'fb',
      result: { title: 'Facebook Video', thumbnail: '', type: 'video',
        downloads: [{ quality: 'HD', url: 'https://example.com/facebook/hd.mp4', hasAudio: true, type: 'video' },
                    { quality: 'Normal', url: 'https://example.com/facebook/sd.mp4', hasAudio: true, type: 'video' }] }
    },
    {
      id: 'twitter', label: 'Twitter / X',
      desc: 'Mengunduh video atau foto dari tweet.',
      example: 'https://x.com/Interior/status/463440424141459456',
      methods: ['direct', 'tweeload', 'tvd', 'savetwt'], alias: 'x',
      result: { title: 'Isi tweet', thumbnail: 'https://example.com/twitter/thumb.jpg', type: 'video',
        author: { name: 'Nama Akun', username: '@akun' },
        downloads: [dl('video', '1280x720', 'twitter/video.mp4')] }
    },
    {
      id: 'spotify', label: 'Spotify',
      desc: 'Mengambil audio, sampul, dan metadata dari tautan lagu atau playlist Spotify.',
      example: 'https://open.spotify.com/track/2FZIabCRMEWAYfN69Ijn1U',
      methods: ['spotidown', 'spotisaver', 'spotmate', 'soundloaders'],
      note: 'Untuk playlist atau album, type bernilai "playlist" dan respons memuat trackCount serta tracks (field yang tersedia bergantung scraper).',
      result: { title: 'Nama Artis - Judul Lagu', artist: 'Nama Artis', album: 'Nama Album', thumbnail: 'https://example.com/spotify/cover.jpg',
        type: 'audio', trackCount: 1,
        downloads: [dl('audio', '320kbps', 'spotify/audio.mp3'), dl('image', 'Cover [HD]', 'spotify/cover.jpg')] }
    },
    {
      id: 'pinterest', label: 'Pinterest',
      desc: 'Mengambil gambar atau video dari tautan pin Pinterest.',
      example: 'https://www.pinterest.com/pin/298363544078970034/',
      methods: ['direct', 'pindown'],
      result: { title: 'Judul pin', thumbnail: 'https://example.com/pinterest/poster.jpg', type: 'image',
        downloads: [dl('image', 'Original Image', 'pinterest/gambar.jpg')] }
    },
    {
      id: 'soundcloud', label: 'SoundCloud',
      desc: 'Mengunduh audio dari tautan lagu SoundCloud.',
      example: 'https://soundcloud.com/octobersveryown/drake-gods-plan',
      methods: ['klickaud'],
      result: { title: 'Judul lagu', type: 'audio', downloads: [{ type: 'MP3 (128kbps)', url: 'https://example.com/soundcloud/audio.mp3' }] }
    },
    {
      id: 'applemusic', label: 'Apple Music',
      desc: 'Mengambil audio dari tautan lagu Apple Music.',
      example: 'https://music.apple.com/us/album/never-gonna-give-you-up/1559523357?i=1559523359',
      methods: ['aplmate'],
      result: { title: 'Nama Artis - Judul Lagu', thumbnail: 'https://example.com/applemusic/cover.jpg', type: 'audio',
        downloads: [dl('audio', '256kbps', 'applemusic/audio.m4a')] }
    },
    {
      id: 'bandcamp', label: 'Bandcamp',
      desc: 'Mengambil audio dari track atau album Bandcamp.',
      example: 'https://tycho.bandcamp.com/track/awake',
      methods: ['direct', 'bandcampdownloader'],
      result: { title: 'Awake', artist: 'Tycho', album: 'Awake', cover: 'https://example.com/bandcamp/cover.jpg', releaseYear: '2014',
        type: 'track', trackCount: 1, tracks: ['...'],
        downloads: [{ type: 'Download MP3 (128kb)', quality: '128kbps', url: 'https://example.com/bandcamp/audio.mp3' }] }
    },
    {
      id: 'threads', label: 'Threads',
      desc: 'Mengunduh foto atau video dari post Threads.',
      example: 'https://www.threads.net/@thenatureshub/post/CvsLZsqOzt7',
      methods: ['threadster'],
      result: { title: 'Isi post', thumbnail: 'https://example.com/threads/thumb.jpg', type: 'video',
        downloads: [{ type: 'video', url: 'https://example.com/threads/video.mp4' }] }
    },
    {
      id: 'reddit', label: 'Reddit',
      desc: 'Mengunduh video dari post Reddit.',
      example: 'https://www.reddit.com/r/indonesia/s/FhrWISKmrS',
      methods: ['rapidsave'],
      result: { title: 'Judul post', thumbnail: 'https://example.com/reddit/thumb.jpg', type: 'video',
        downloads: [dl('video', 'HD', 'reddit/video.mp4'), dl('audio', 'Audio Track', 'reddit/audio.mp4')] }
    },
    {
      id: 'pixiv', label: 'Pixiv',
      desc: 'Mengambil gambar karya dari tautan artwork Pixiv.',
      example: 'https://www.pixiv.net/en/artworks/150068059',
      methods: ['ajax'],
      result: { title: 'Judul karya by Nama Artis', thumbnail: 'https://example.com/pixiv/thumb.jpg', type: 'image',
        author: { name: 'Nama Artis', id: '12345' },
        downloads: [dl('image', 'Original', 'pixiv/gambar.jpg')] }
    },
    {
      id: 'rednote', label: 'RedNote',
      desc: 'Mengunduh foto atau video dari catatan RedNote (Xiaohongshu).',
      example: 'https://www.rednote.com/discovery/item/6a6b303000000000320207f9',
      methods: ['direct'],
      note: 'Bentuk result mengikuti isi catatan; field umum yang tersedia adalah title, thumbnail, type, dan downloads.',
      result: { title: 'Judul catatan', thumbnail: 'https://example.com/rednote/thumb.jpg', type: 'video',
        downloads: [dl('video', 'HD', 'rednote/video.mp4')] }
    },
    {
      id: 'douyin', label: 'Douyin',
      desc: 'Mengunduh video atau foto Douyin tanpa watermark.',
      example: 'https://v.douyin.com/o-P-4yQzt5c/',
      methods: ['direct'],
      result: { title: 'Judul video', author: 'Nama Akun', thumbnail: 'https://example.com/douyin/thumb.jpg', type: 'video',
        downloads: [dl('video', 'HD No Watermark', 'douyin/video.mp4')] }
    },
    {
      id: 'bilibili', label: 'Bilibili',
      desc: 'Mengunduh video dari tautan Bilibili (bilibili.com atau bilibili.tv).',
      example: 'https://www.bilibili.com/video/BV1xx411c7mD',
      methods: ['direct'],
      result: { title: 'Judul video', thumbnail: 'https://example.com/bilibili/thumb.jpg', type: 'video',
        downloads: [dl('video', '480P', 'bilibili/video.mp4')] }
    },
    {
      id: 'terabox', label: 'TeraBox',
      desc: 'Mengambil tautan unduhan semua berkas dari tautan share TeraBox.',
      example: 'https://www.terabox.com/wap/share/filelist?surl=rIMSgmDoO4oZKpgQhsoeig',
      methods: ['sechno'],
      result: { title: 'Nama folder atau berkas', thumbnail: 'https://example.com/terabox/thumb.jpg', totalFiles: 1,
        downloads: [{ type: 'file', filename: 'berkas.zip', size: '12.4 MB', quality: 'Direct Download', url: 'https://example.com/terabox/berkas.zip' }] }
    },
    {
      id: 'resolver', label: 'Resolver',
      desc: 'Mengubah tautan berkas atau shortlink menjadi tautan unduhan langsung. Scraper dipilih otomatis dari domain tautan, dan tautan lain diperlakukan sebagai shortlink biasa (unshorten).',
      example: 'https://www.mediafire.com/file/w4b1fjoijyug9qz/nix.py',
      methods: ['sfile', 'safelinku', 'mediafire', 'sub2unlock', 'rekonise', 'unshorten', 'pixeldrain', 'catbox', 'krakenfiles', 'doodstream', 'gdrive'],
      note: 'Untuk shortlink, respons dapat memuat originalUrl dan destinationUrl.',
      result: { title: 'nix.py', filename: 'nix.py', size: '1.2 KB', url: 'https://example.com/mediafire/nix.py',
        downloads: [dl('file', 'Direct Download', 'mediafire/nix.py')] }
    }
  ];

  var endpoints = [];

  platforms.forEach(function (p) {
    var browser = p.browser || [];
    var desc = p.desc;
    if (browser.length) desc += ' ' + BROWSER_NOTE + browser.join(', ') + '.';
    var note = [p.note, p.alias ? 'Alias path: /download/' + p.alias + '.' : ''].filter(Boolean).join(' ');
    endpoints.push({
      id: p.id, method: 'GET', cat: 'download', path: '/download/' + p.id,
      desc: desc,
      params: [
        { name: 'q', type: 'string', required: true, desc: 'Tautan ' + p.label + ' yang ingin diproses.', example: p.example },
        { name: 'method', type: 'string', required: false, options: p.methods,
          desc: 'Nama scraper tertentu. Kosongkan agar server mencoba beberapa scraper berurutan. Pilihan: ' + p.methods.join(', ') + '.', example: '' }
      ],
      response: ok(p.result),
      errorMessage: 'Parameter q wajib diisi. Contoh: /download/' + p.id + '?q=<url>',
      note: note || undefined
    });
  });

  var GEMINI_RESULT = { text: 'REST API adalah cara dua aplikasi saling bertukar data lewat HTTP...', sessionId: 'eyJkYXRhIjpbXSwiY29va2llIjoiLi4uIn0=' };
  var GEMINI_NOTE = 'Simpan result.sessionId lalu kirim kembali pada permintaan berikutnya agar percakapan berlanjut. Teks maksimal 20.000 karakter, system maksimal 5.000 karakter.';

  endpoints.push(
    {
      id: 'gemini', method: 'GET', cat: 'ai', path: '/ai/gemini',
      desc: 'Mengirim pesan ke Gemini dan menerima balasan teks. Dukung percakapan lanjutan lewat sessionId.',
      params: [
        { name: 'text', type: 'string', required: true, desc: 'Pesan yang dikirim ke model.', example: 'jelaskan apa itu REST API' },
        { name: 'system', type: 'string', required: false, desc: 'Instruksi sistem untuk mengatur gaya jawaban.', example: '' },
        { name: 'sessionId', type: 'string', required: false, desc: 'sessionId dari respons sebelumnya untuk melanjutkan percakapan.', example: '' }
      ],
      response: ok(GEMINI_RESULT),
      errorMessage: 'Parameter text wajib diisi. Contoh: /ai/gemini?text=Halo',
      note: GEMINI_NOTE
    },
    {
      id: 'gemini-post', method: 'POST', cat: 'ai', path: '/ai/gemini',
      desc: 'Sama seperti versi GET, tetapi parameter dikirim sebagai body JSON. Cocok untuk teks panjang.',
      params: [
        { name: 'text', type: 'string', required: true, desc: 'Pesan yang dikirim ke model.', example: 'jelaskan apa itu REST API' },
        { name: 'system', type: 'string', required: false, desc: 'Instruksi sistem untuk mengatur gaya jawaban.', example: '' },
        { name: 'sessionId', type: 'string', required: false, desc: 'sessionId dari respons sebelumnya untuk melanjutkan percakapan.', example: '' }
      ],
      response: ok(GEMINI_RESULT),
      errorMessage: 'Parameter text wajib diisi. Contoh: /ai/gemini?text=Halo',
      note: GEMINI_NOTE + ' Body berupa teks biasa juga diterima dan dianggap sebagai isi pesan.'
    },
    {
      id: 'health', method: 'GET', cat: 'system', path: '/health',
      desc: 'Memeriksa apakah server aktif dan sudah berjalan berapa detik.',
      params: [],
      response: ok({ uptime: 3600 }),
      noValidation: true
    },
    {
      id: 'index', method: 'GET', cat: 'system', path: '/',
      desc: 'Menampilkan daftar platform dan scraper yang tersedia di server.',
      params: [],
      response: ok({
        name: 'shzpay-api',
        usage: '/download/<platform>?q=<url>',
        optional: '&method=<scraper> untuk memilih scraper tertentu',
        ai: { gemini: '/ai/gemini?text=<pesan>[&system=<instruksi>][&sessionId=<id>] (bisa juga POST JSON)' },
        aliases: { tt: 'tiktok', ig: 'instagram', x: 'twitter', fb: 'facebook', yt: 'youtube' },
        platforms: { tiktok: ['snaptik', 'tiktokio', '...'], youtube: ['ytmp3', 'ytmp3gg', 'playlist'] }
      }),
      note: 'Daftar platforms pada respons asli lengkap; contoh di atas dipersingkat.',
      noValidation: true
    }
  );

  endpoints.forEach(function (ep) {
    ep.catLabel = categories.filter(function (c) { return c.cat === ep.cat; })[0].label;
  });

  function byId(id) {
    for (var i = 0; i < endpoints.length; i++) if (endpoints[i].id === id) return endpoints[i];
    return null;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Pewarnaan JSON: kunci, string, dan boolean. Teks di-escape lebih dulu.
  function highlight(json) {
    return esc(json).replace(/("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b/g, function (m, str, colon, bool) {
      if (str) return colon ? '<span class="k">' + str + '</span>' + colon : '<span class="s">' + str + '</span>';
      return '<span class="ok">' + bool + '</span>';
    });
  }

  function sample(ep) {
    return JSON.stringify(ep.response, null, 2);
  }

  function errorSample(ep) {
    if (ep.noValidation) return null;
    return JSON.stringify({
      status: false,
      dev: '@muhmdtamam',
      credits: 'shzpay-api',
      message: ep.errorMessage || 'Parameter wajib belum diisi.'
    }, null, 2);
  }

  // values: { namaParam: 'nilai' }. Jika kosong, pakai contoh dari katalog saat useExample = true.
  function valueOf(p, values, useExample) {
    var v = values && values[p.name];
    if (v == null || v === '') return useExample ? p.example : '';
    return v;
  }

  function urlFor(ep, values, useExample) {
    var qs = ep.params.map(function (p) {
      var v = valueOf(p, values, useExample);
      return v === '' ? null : p.name + '=' + encodeURIComponent(v);
    }).filter(Boolean).join('&');
    return baseUrl + ep.path + (qs ? '?' + qs : '');
  }

  // Parameter opsional yang kosong tidak ikut dikirim.
  function bodyFor(ep, values, useExample) {
    var body = {};
    ep.params.forEach(function (p) {
      var v = valueOf(p, values, useExample);
      if (v !== '' || p.required) body[p.name] = v;
    });
    return body;
  }

  function shellQuote(s) { return s.replace(/'/g, "'\\''"); }

  function curlFor(ep, values, useExample) {
    if (ep.method === 'GET') return 'curl "' + urlFor(ep, values, useExample) + '"';
    return 'curl -X POST "' + baseUrl + ep.path + '" \\\n' +
      '  -H "Content-Type: application/json" \\\n' +
      "  -d '" + shellQuote(JSON.stringify(bodyFor(ep, values, useExample))) + "'";
  }

  function jsFor(ep, values, useExample) {
    if (ep.method === 'GET') {
      var obj = {};
      ep.params.forEach(function (p) {
        var v = valueOf(p, values, useExample);
        if (v !== '') obj[p.name] = v;
      });
      var hasQuery = Object.keys(obj).length > 0;
      return (hasQuery ? 'const params = new URLSearchParams(' + JSON.stringify(obj) + ');\n' : '') +
        'const res = await fetch(`' + baseUrl + ep.path + (hasQuery ? '?${params}' : '') + '`);\n' +
        'const data = await res.json();';
    }
    return 'const res = await fetch("' + baseUrl + ep.path + '", {\n' +
      '  method: "POST",\n' +
      '  headers: { "Content-Type": "application/json" },\n' +
      '  body: JSON.stringify(' + JSON.stringify(bodyFor(ep, values, useExample)) + ')\n' +
      '});\n' +
      'const data = await res.json();';
  }

  // Riwayat percobaan dari halaman Coba API, disimpan di perangkat ini saja.
  var LOG_KEY = 'shzpay-pg-log';
  var LOG_MAX = 200;
  var history = {
    read: function () {
      try {
        var list = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
        return Array.isArray(list) ? list : [];
      } catch (e) { return []; }
    },
    add: function (entry) {
      try {
        var list = history.read();
        list.unshift(entry);
        localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0, LOG_MAX)));
      } catch (e) {}
    },
    clear: function () {
      try { localStorage.removeItem(LOG_KEY); } catch (e) {}
    }
  };

  window.SHZPAY = {
    baseUrl: baseUrl,
    categories: categories,
    endpoints: endpoints,
    byId: byId,
    esc: esc,
    highlight: highlight,
    sample: sample,
    errorSample: errorSample,
    urlFor: urlFor,
    bodyFor: bodyFor,
    curlFor: curlFor,
    jsFor: jsFor,
    history: history
  };
})();
