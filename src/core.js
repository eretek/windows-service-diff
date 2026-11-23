/*! Eretek Online Araçlar — core 1.0.0. Ağ isteği yapmaz (DNS araçları lib/dns.js ile yalnız sabit DoH çözümleyicisine gider). */
(function (root) {
	'use strict';
	var ERT = root.ERT = root.ERT || {};
	ERT.tools = ERT.tools || {};
	ERT.def = function (id, spec) { ERT.tools[id] = spec; };

	/* ---------------------------------------------------------------- messages */
	var M = {
		tr: { demo: 'Bu sonuç sayfadaki örnek DNS verisiyle üretildi; canlı sorgu değildir. Kendi alan adınızı yazıp Hesapla’ya basın.', st_ok: 'Yanıt alındı', st_nxdomain: 'NXDOMAIN: bu ad DNS’te yok', st_nodata: 'NODATA: bu türde kayıt yok (bazı DNS sağlayıcıları olmayan adlar için de böyle yanıt verir)', st_servfail: 'SERVFAIL: yetkili sunucu yanıt veremedi (DNSSEC veya sunucu hatası olabilir)', st_refused: 'REFUSED: sorgu reddedildi', st_timeout: 'Zaman aşımı: çözümleyici 8 saniyede yanıt vermedi', st_ratelimit: 'Hız sınırı: çözümleyici sorguyu geçici olarak sınırladı; biraz sonra deneyin', st_neterr: 'Çözümleyiciye ulaşılamadı (tarayıcı uzantısı, kurumsal proxy veya ağ engeli olabilir)', badDomain: 'Geçerli bir alan adı girin (ör. ornek.com).', req: 'Bu alan zorunludur.', num: 'Geçerli bir sayı girin.', dec: 'Ondalık ayırıcı olarak virgül kullanın (ör. 1,5); binlik ayırıcı kullanmayın.', min: 'En küçük değer {v}.', max: 'En büyük değer {v}.', int: 'Tam sayı girin.', pos: 'Sıfırdan büyük bir değer girin.',
			errs: '{n} alanda düzeltme gerekiyor.', done: 'Sonuç hazır.', copy: 'Kopyala', copied: 'Panoya kopyalandı.', copyFail: 'Kopyalanamadı; metni seçip elle kopyalayın.', dl: '{f} indir', lines: 'En fazla {n} satır işlenir; girdi {m} satır.', size: 'Dosya en fazla {n} MB olabilir.', file: 'Dosya okunamadı.',
			fx: 'Formül benzeri hücreler metin olarak yazıldı (başına \' eklendi).', fail: 'Beklenmeyen bir hata oluştu; girdiyi kontrol edin.', none: 'Sonuç yok.', yes: 'Evet', no: 'Hayır', unknown: 'bilinmiyor', row: 'Satır', csvHead: 'İlk satır başlık olmalı.', col: '"{c}" sütunu bulunamadı.', working: 'Çalışıyor…' },
		en: { demo: 'This result uses the sample DNS data on this page, not a live query. Enter your own domain and press Run.', st_ok: 'Answer received', st_nxdomain: 'NXDOMAIN: the name does not exist in DNS', st_nodata: 'NODATA: no record of this type (some DNS providers also answer this way for names that do not exist)', st_servfail: 'SERVFAIL: the authoritative server could not answer (DNSSEC or server error)', st_refused: 'REFUSED: the query was refused', st_timeout: 'Timeout: the resolver did not answer within 8 seconds', st_ratelimit: 'Rate limited: the resolver is temporarily limiting queries; try again shortly', st_neterr: 'The resolver could not be reached (browser extension, corporate proxy or network block)', badDomain: 'Enter a valid domain name (e.g. example.com).', req: 'This field is required.', num: 'Enter a valid number.', dec: 'Use a dot as the decimal separator (e.g. 1.5); do not use thousands separators.', min: 'Minimum value is {v}.', max: 'Maximum value is {v}.', int: 'Enter a whole number.', pos: 'Enter a value greater than zero.',
			errs: '{n} fields need correcting.', done: 'Result ready.', copy: 'Copy', copied: 'Copied to clipboard.', copyFail: 'Could not copy; select the text and copy it manually.', dl: 'Download {f}', lines: 'At most {n} lines are processed; the input has {m}.', size: 'The file may be at most {n} MB.', file: 'The file could not be read.',
			fx: 'Formula-like cells were written as text (prefixed with \').', fail: 'Unexpected error; please check the input.', none: 'No result.', yes: 'Yes', no: 'No', unknown: 'unknown', row: 'Row', csvHead: 'The first row must be a header.', col: 'Column "{c}" not found.', working: 'Working…' },
		de: { demo: 'Dieses Ergebnis nutzt die Beispiel-DNS-Daten dieser Seite, keine Live-Abfrage. Eigene Domain eingeben und Ausführen klicken.', st_ok: 'Antwort erhalten', st_nxdomain: 'NXDOMAIN: der Name existiert im DNS nicht', st_nodata: 'NODATA: kein Eintrag dieses Typs (manche DNS-Anbieter antworten so auch bei nicht existierenden Namen)', st_servfail: 'SERVFAIL: der autoritative Server konnte nicht antworten (DNSSEC- oder Serverfehler)', st_refused: 'REFUSED: die Abfrage wurde abgelehnt', st_timeout: 'Zeitüberschreitung: der Resolver antwortete nicht binnen 8 Sekunden', st_ratelimit: 'Ratenbegrenzung: der Resolver begrenzt Abfragen vorübergehend; bitte später erneut versuchen', st_neterr: 'Resolver nicht erreichbar (Browsererweiterung, Unternehmensproxy oder Netzsperre)', badDomain: 'Bitte einen gültigen Domainnamen eingeben (z. B. beispiel.de).', req: 'Pflichtfeld.', num: 'Bitte eine gültige Zahl eingeben.', dec: 'Komma als Dezimaltrennzeichen verwenden (z. B. 1,5); keine Tausendertrennzeichen.', min: 'Kleinster Wert: {v}.', max: 'Größter Wert: {v}.', int: 'Bitte eine ganze Zahl eingeben.', pos: 'Bitte einen Wert größer als null eingeben.',
			errs: '{n} Felder müssen korrigiert werden.', done: 'Ergebnis bereit.', copy: 'Kopieren', copied: 'In die Zwischenablage kopiert.', copyFail: 'Kopieren fehlgeschlagen; Text bitte manuell kopieren.', dl: '{f} herunterladen', lines: 'Höchstens {n} Zeilen werden verarbeitet; die Eingabe hat {m}.', size: 'Die Datei darf höchstens {n} MB groß sein.', file: 'Die Datei konnte nicht gelesen werden.',
			fx: 'Formelähnliche Zellen wurden als Text geschrieben (mit vorangestelltem \').', fail: 'Unerwarteter Fehler; bitte Eingabe prüfen.', none: 'Kein Ergebnis.', yes: 'Ja', no: 'Nein', unknown: 'unbekannt', row: 'Zeile', csvHead: 'Die erste Zeile muss eine Kopfzeile sein.', col: 'Spalte „{c}“ nicht gefunden.', working: 'Läuft…' }
	};
	var LOC = { tr: 'tr-TR', en: 'en-US', de: 'de-DE' };

	function fill(s, p) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return p && p[k] !== undefined ? p[k] : m; }); }

	/** Alan hatası nesnesi */
	function FE(field, msg) { this.field = field; this.msg = msg; }
	ERT.FE = FE;

	/* ---------------------------------------------------------------- numbers */
	/** Dil bağlamında ondalık ayrıştırma; belirsiz ayırıcı hata verir (sessiz yorum yok). */
	ERT.parseNum = function (s, lang) {
		s = String(s == null ? '' : s).trim().replace(/[\u00a0\u202f ]/g, '');
		if (s === '') { return null; }
		var dec = lang === 'en' ? '.' : ',', other = lang === 'en' ? ',' : '.';
		if (s.indexOf(other) !== -1) { return NaN; }
		if (s.split(dec).length > 2) { return NaN; }
		if (!/^[-+]?(\d+([.,]\d*)?|[.,]\d+)([eE][-+]?\d+)?$/.test(s)) { return NaN; }
		return Number(s.replace(dec, '.'));
	};
	ERT.isAmbiguous = function (s, lang) { var other = lang === 'en' ? ',' : '.'; return String(s).indexOf(other) !== -1; };

	function Ctx(cfg) {
		this.cfg = cfg; this.lang = cfg.lang; this.loc = LOC[cfg.lang];
	}
	Ctx.prototype.t = function (k, p) {
		var o = this.cfg.o || {}, m = M[this.lang] || M.en;
		return fill(o[k] !== undefined ? o[k] : (m[k] !== undefined ? m[k] : k), p);
	};
	Ctx.prototype.fe = function (field, k, p) { return new FE(field, this.t(k, p)); };
	// Çekirdek mesajları yalnız çekirdek sözlüğünden okunur; araç metinlerindeki aynı adlı anahtarlar (ör. 'dec', 'none') bunları ezmesin.
	Ctx.prototype.tc = function (k, p) { var m = M[this.lang] || M.en; return fill(m[k] !== undefined ? m[k] : k, p); };
	Ctx.prototype.fec = function (field, k, p) { return new FE(field, this.tc(k, p)); };
	Ctx.prototype.err = function (k, p) { return new FE(null, this.t(k, p)); };
	Ctx.prototype.n = function (x, d, min) {
		if (x === null || x === undefined || (typeof x === 'number' && !isFinite(x))) { return '–'; }
		if (typeof x === 'bigint') { return x.toLocaleString(this.loc); }
		return new Intl.NumberFormat(this.loc, { maximumFractionDigits: d === undefined ? 2 : d, minimumFractionDigits: min || 0 }).format(x);
	};
	Ctx.prototype.pct = function (x, d) { var s = this.n(x * 100, d === undefined ? 1 : d); return this.lang === 'tr' ? '%' + s : s + ' %'; };
	/** Bayt → "1,2 TB (1,09 TiB)" */
	Ctx.prototype.bytes = function (b, d) {
		if (!isFinite(b)) { return '–'; }
		var u = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'], ui = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
		var i = 0, j = 0, x = Math.abs(b), y = Math.abs(b);
		while (x >= 1000 && i < u.length - 1) { x /= 1000; i++; }
		while (y >= 1024 && j < ui.length - 1) { y /= 1024; j++; }
		var s = b < 0 ? '-' : '';
		return s + this.n(x, d === undefined ? 2 : d) + ' ' + u[i] + (i ? ' (' + s + this.n(y, d === undefined ? 2 : d) + ' ' + ui[j] + ')' : '');
	};
	Ctx.prototype.dur = function (sec) {
		if (!isFinite(sec)) { return '–'; }
		var L = { tr: ['gün', 'sa', 'dk', 'sn'], en: ['d', 'h', 'min', 's'], de: ['T', 'Std.', 'Min.', 's'] }[this.lang];
		var s = Math.round(sec), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), r = s % 60, o = [];
		if (d) { o.push(d + ' ' + L[0]); } if (h) { o.push(h + ' ' + L[1]); } if (m) { o.push(m + ' ' + L[2]); } if (r || !o.length) { o.push(r + ' ' + L[3]); }
		return o.join(' ');
	};
	Ctx.prototype.lines = function (text, max, field) {
		var a = String(text || '').replace(/\r\n?/g, '\n').split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l !== '' && l[0] !== '#'; });
		max = max || 5000;
		if (a.length > max) { throw this.fec(field || null, 'lines', { n: max, m: a.length }); }
		return a;
	};
	Ctx.prototype.yn = function (b) { return b === null || b === undefined ? this.tc('unknown') : (b ? this.tc('yes') : this.tc('no')); };
	/** CSV ayrıştır: başlık zorunlu; ayırıcı otomatik (, ; tab). Sütunlar kanonik adlara eşlenir. */
	Ctx.prototype.csv = function (text, field, max) {
		var r = ERT.csv.parse(text);
		if (r.rows.length > (max || 20000)) { throw this.fec(field, 'lines', { n: max || 20000, m: r.rows.length }); }
		if (!r.head.length) { throw this.fec(field, 'csvHead'); }
		return r;
	};

	/* ---------------------------------------------------------------- CSV */
	ERT.csv = {
		parse: function (text) {
			text = String(text || '').replace(/^\ufeff/, '');
			var first = text.split(/\r?\n/)[0] || '';
			var cand = [',', ';', '\t'], sep = ',', best = -1;
			cand.forEach(function (c) { var n = first.split(c).length; if (n > best) { best = n; sep = c; } });
			var rows = [], row = [], cell = '', q = false, i = 0, ch;
			for (; i < text.length; i++) {
				ch = text[i];
				if (q) {
					if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else { q = false; } } else { cell += ch; }
				} else if (ch === '"' && cell === '') { q = true; }
				else if (ch === sep) { row.push(cell); cell = ''; }
				else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') { i++; } row.push(cell); rows.push(row); row = []; cell = ''; }
				else { cell += ch; }
			}
			if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
			rows = rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
			var head = (rows.shift() || []).map(function (h) { return String(h).trim(); });
			return { sep: sep, head: head, rows: rows.map(function (r) { return r.map(function (c) { return String(c).trim(); }); }) };
		},
		/** başlık eşleme: aday adlardan (küçük harf, boşluksuz) ilk bulunan sütunun indeksi */
		col: function (head, names) {
			var h = head.map(function (x) { return ERT.norm(x).replace(/[\s_\-.]/g, ''); });
			for (var i = 0; i < names.length; i++) { var k = h.indexOf(ERT.norm(names[i]).replace(/[\s_\-.]/g, '')); if (k !== -1) { return k; } }
			return -1;
		},
		cell: function (v) {
			if (typeof v === 'number') { return isFinite(v) ? String(v) : ''; }
			v = v === null || v === undefined ? '' : String(v);
			if (/^[=+\-@\t\r]/.test(v)) { v = "'" + v; }
			return v;
		},
		build: function (cols, rows, sep) {
			var esc = function (v) { v = ERT.csv.cell(v); return /[",;\t\r\n]/.test(v) || v.indexOf(sep) !== -1 ? '"' + v.replace(/"/g, '""') + '"' : v; };
			return '\ufeff' + [cols].concat(rows).map(function (r) { return r.map(esc).join(sep); }).join('\r\n') + '\r\n';
		}
	};

	/** Büyük/küçük harf ve aksan duyarsız karşılaştırma için normalleştirme (Türkçe İ/ı, Almanca ß, umlaut). */
	ERT.norm = function (s) {
		return String(s || '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLocaleLowerCase('tr')
			.replace(/ı/g, 'i').replace(/ß/g, 'ss').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g')
			.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	};

	/* ---------------------------------------------------------------- ICS */
	ERT.ics = function (events, name) {
		var esc = function (s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); };
		var fold = function (l) { var o = '', b = 0, out = []; for (var i = 0; i < l.length; i++) { var c = l[i], n = unescape(encodeURIComponent(c)).length; if (b + n > 73) { out.push(o); o = ' '; b = 1; } o += c; b += n; } out.push(o); return out.join('\r\n'); };
		var dt = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
		var now = dt(new Date());
		var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Eretek//Online Tools//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + esc(name || 'Eretek')];
		events.forEach(function (e, i) {
			L.push('BEGIN:VEVENT', 'UID:' + (e.uid || ('ert-' + i + '-' + now + '@eretek.com')), 'DTSTAMP:' + now);
			if (e.allDay) { L.push('DTSTART;VALUE=DATE:' + e.start.toISOString().slice(0, 10).replace(/-/g, ''), 'DTEND;VALUE=DATE:' + new Date(e.start.getTime() + 86400000).toISOString().slice(0, 10).replace(/-/g, '')); }
			else { L.push('DTSTART:' + dt(e.start), 'DTEND:' + dt(e.end || e.start)); }
			L.push('SUMMARY:' + esc(e.title)); if (e.desc) { L.push('DESCRIPTION:' + esc(e.desc)); }
			L.push('END:VEVENT');
		});
		L.push('END:VCALENDAR');
		return L.map(fold).join('\r\n') + '\r\n';
	};

	/* ---------------------------------------------------------------- DOM helpers */
	function h(tag, attrs, kids) {
		var e = document.createElement(tag);
		if (attrs) { Object.keys(attrs).forEach(function (k) { if (k === 'text') { e.textContent = attrs[k]; } else if (attrs[k] !== null && attrs[k] !== undefined) { e.setAttribute(k, attrs[k]); } }); }
		(kids || []).forEach(function (k) { if (k !== null && k !== undefined) { e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); } });
		return e;
	}
	function download(name, data, mime) {
		var blob = data instanceof Blob ? data : new Blob([data], { type: mime });
		var a = h('a', { href: URL.createObjectURL(blob), download: name });
		document.body.appendChild(a); a.click();
		setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
	}
	ERT.download = download;

	/* ---------------------------------------------------------------- runner (headless için de kullanılır) */
	/** Ham alan değerlerini (string/boolean/File) şemaya göre doğrular ve dönüştürür. */
	ERT.coerce = function (cfg, raw, ctx) {
		var v = {}, errs = [];
		cfg.f.forEach(function (f) {
			var x = raw[f.n];
			try {
				if (f.t === 'chk') { v[f.n] = !!x; return; }
				if (f.t === 'file') { v[f.n] = x || null; if (f.req && !x) { throw ctx.fec(f.n, 'req'); } return; }
				x = x === undefined || x === null ? '' : String(x);
				if (f.t !== 'area') { x = x.trim(); }
				if (x.trim() === '') { if (f.req) { throw ctx.fec(f.n, 'req'); } v[f.n] = f.t === 'num' ? null : ''; return; }
				if (f.t === 'num') {
					var n = ERT.parseNum(x, ctx.lang);
					if (isNaN(n)) { throw ctx.fec(f.n, ERT.isAmbiguous(x, ctx.lang) ? 'dec' : 'num'); }
					if (f.int && Math.floor(n) !== n) { throw ctx.fec(f.n, 'int'); }
					if (f.min !== undefined && n < f.min) { throw ctx.fec(f.n, 'min', { v: ctx.n(f.min, 6) }); }
					if (f.max !== undefined && n > f.max) { throw ctx.fec(f.n, 'max', { v: ctx.n(f.max, 6) }); }
					if (f.pos && !(n > 0)) { throw ctx.fec(f.n, 'pos'); }
					v[f.n] = n; return;
				}
				if (f.t === 'sel' && f.opt.indexOf(x) === -1) { throw ctx.fec(f.n, 'req'); }
				if (f.max_len && x.length > f.max_len) { throw ctx.fec(f.n, 'lines', { n: f.max_len, m: x.length }); }
				v[f.n] = x;
			} catch (e) { if (e instanceof FE) { errs.push(e); } else { throw e; } }
		});
		return { v: v, errs: errs };
	};
	/** Headless çalıştırma (testler): raw değerler → sonuç veya {errs} */
	ERT.runRaw = function (cfg, raw) {
		var ctx = new Ctx(cfg), c = ERT.coerce(cfg, raw, ctx);
		if (c.errs.length) { return Promise.resolve({ errs: c.errs }); }
		try { return Promise.resolve(ERT.tools[cfg.id].run(c.v, ctx)).catch(function (e) { if (e instanceof FE) { return { errs: [e] }; } throw e; }); }
		catch (e) { if (e instanceof FE) { return Promise.resolve({ errs: [e] }); } return Promise.reject(e); }
	};
	ERT.Ctx = Ctx;
	ERT.fmtEx = function (f, val, lang) { return f.t === 'num' && typeof val === 'number' && lang !== 'en' ? String(val).replace('.', ',') : val; };

	/* ---------------------------------------------------------------- UI */
	function App(root) {
		this.root = root;
		this.cfg = JSON.parse(root.getAttribute('data-cfg'));
		this.ctx = new Ctx(this.cfg);
		this.form = root.querySelector('.ert-form');
		this.out = root.querySelector('#ert-out');
		this.live = root.querySelector('#ert-live');
		var self = this;
		this.form.addEventListener('submit', function (e) { e.preventDefault(); self.run(); });
		this.form.addEventListener('input', function () { self.demo = false; });
		this.form.addEventListener('change', function () { self.demo = false; });
		root.querySelectorAll('[data-act]').forEach(function (b) {
			var a = b.getAttribute('data-act');
			if (a === 'example') { b.addEventListener('click', function () { self.fillEx(self.cfg.ex); }); }
			if (a === 'example2') { b.addEventListener('click', function () { self.fillEx(self.cfg.ex2); }); }
			if (a === 'reset') { b.addEventListener('click', function () { self.reset(); }); }
		});
		if (ERT.tools[this.cfg.id] && ERT.tools[this.cfg.id].init) { ERT.tools[this.cfg.id].init(this); }
	}
	App.prototype.el = function (n) { return this.root.querySelector('[data-n="' + n + '"]'); };
	App.prototype.fillEx = function (ex) {
		var self = this;
		this.reset(true);
		this.cfg.f.forEach(function (f) {
			var e = self.el(f.n); if (!e || f.t === 'file') { return; }
			var val = ex && ex[f.n] !== undefined ? ex[f.n] : (f.def !== undefined ? f.def : '');
			if (f.t === 'chk') { e.checked = !!val; } else { e.value = ERT.fmtEx(f, val, self.cfg.lang); }
		});
		this.demo = !!(this.cfg.dnsfx && ERT.dns); // DNS araçlarında örnek, sayfadaki sabit örnek veriyle (canlı sorgu olmadan) çalışır
		this.run();
	};
	App.prototype.reset = function (keepOut) {
		var self = this;
		this.cfg.f.forEach(function (f) {
			var e = self.el(f.n); if (!e) { return; }
			if (f.t === 'chk') { e.checked = !!f.def; } else if (f.t === 'file') { e.value = ''; } else { e.value = f.def !== undefined ? ERT.fmtEx(f, f.def, self.cfg.lang) : (f.t === 'sel' ? f.opt[0] : ''); }
		});
		this.clearErr();
		if (!keepOut) { this.out.hidden = true; this.out.textContent = ''; }
	};
	App.prototype.clearErr = function () {
		this.root.querySelectorAll('.ert-err').forEach(function (p) { p.hidden = true; p.textContent = ''; });
		this.root.querySelectorAll('[aria-invalid]').forEach(function (e) { e.removeAttribute('aria-invalid'); });
	};
	App.prototype.raw = function () {
		var self = this, raw = {}, files = [];
		this.cfg.f.forEach(function (f) {
			var e = self.el(f.n); if (!e) { return; }
			if (f.t === 'chk') { raw[f.n] = e.checked; }
			else if (f.t === 'file') {
				var file = e.files && e.files[0];
				if (file) {
					files.push(new Promise(function (res, rej) {
						if (file.size > (f.maxMB || 10) * 1048576) { rej(self.ctx.fec(f.n, 'size', { n: f.maxMB || 10 })); return; }
						var r = new FileReader();
						r.onload = function () { raw[f.n] = { name: file.name, size: file.size, data: r.result }; res(); };
						r.onerror = function () { rej(self.ctx.fec(f.n, 'file')); };
						if (f.bin) { r.readAsArrayBuffer(file); } else { r.readAsText(file); }
					}));
				} else { raw[f.n] = null; }
			} else { raw[f.n] = e.value; }
		});
		return Promise.all(files).then(function () { return raw; });
	};
	App.prototype.showErrs = function (errs) {
		var self = this, first = null, general = [];
		errs.forEach(function (e) {
			var el = e.field ? self.el(e.field) : null;
			if (el) {
				el.setAttribute('aria-invalid', 'true');
				var p = self.root.querySelector('#ert-e-' + e.field); if (p) { p.textContent = e.msg; p.hidden = false; }
				if (!first) { first = el; }
			} else { general.push(e.msg); }
		});
		if (general.length) { this.render({ msgs: general.map(function (m) { return ['err', m]; }) }); } else { this.out.hidden = true; }
		this.announce(errs.length === 1 ? errs[0].msg : this.ctx.tc('errs', { n: errs.length }));
		if (first) { first.focus(); }
	};
	App.prototype.announce = function (t) { var l = this.live; l.textContent = ''; setTimeout(function () { l.textContent = t; }, 30); };
	App.prototype.run = function () {
		var self = this, btn = this.root.querySelector('[data-act="run"]');
		this.clearErr();
		btn.disabled = true;
		this.raw().then(function (raw) {
			var c = ERT.coerce(self.cfg, raw, self.ctx);
			if (c.errs.length) { throw { errs: c.errs }; }
			if (ERT.dns) { ERT.dns._fixture = self.demo ? self.cfg.dnsfx : null; }
			if (self.cfg.mode === 'dns' || self.cfg.async) { self.render({ msgs: [['info', self.ctx.tc('working')]] }); }
			return ERT.tools[self.cfg.id].run(c.v, self.ctx, self);
		}).then(function (r) {
			if (r && r.errs) { self.showErrs(r.errs); return; }
			if (self.demo && r) { r.msgs = [['info', self.ctx.tc('demo')]].concat(r.msgs || []); }
			self.render(r); self.announce(self.ctx.tc('done'));
			self.out.focus({ preventScroll: false });
		}).catch(function (e) {
			if (e instanceof FE) { self.showErrs([e]); }
			else if (e && e.errs) { self.showErrs(e.errs); }
			else { if (root.console) { console.error(e); } self.render({ msgs: [['err', self.ctx.tc('fail')]] }); }
		}).then(function () { btn.disabled = false; });
	};
	App.prototype.render = function (r) {
		var ctx = this.ctx, out = this.out, self = this;
		out.textContent = ''; out.hidden = false;
		if (!r) { r = { msgs: [['info', ctx.tc('none')]] }; }
		if (r.big) { out.appendChild(h('p', { class: 'ert-big', text: r.big })); }
		if (r.kv && r.kv.length) {
			var dl = h('dl', { class: 'ert-kv' });
			r.kv.forEach(function (p) { if (p) { dl.appendChild(h('dt', { text: p[0] })); dl.appendChild(h('dd', { text: p[1] === undefined || p[1] === null ? '–' : String(p[1]) })); } });
			out.appendChild(dl);
		}
		if (r.msgs && r.msgs.length) {
			var ul = h('ul', { class: 'ert-msgs' });
			r.msgs.forEach(function (m) { if (m) { ul.appendChild(h('li', { class: 'is-' + m[0], text: m[1] })); } });
			out.appendChild(ul);
		}
		(r.sections || []).forEach(function (sec) {
			out.appendChild(h('h3', { text: sec.title }));
			var d2 = h('dl', { class: 'ert-kv' });
			(sec.kv || []).forEach(function (p) { d2.appendChild(h('dt', { text: p[0] })); d2.appendChild(h('dd', { text: p[1] === undefined || p[1] === null ? '–' : String(p[1]) })); });
			out.appendChild(d2);
			if (sec.msgs && sec.msgs.length) { var u3 = h('ul', { class: 'ert-msgs' }); sec.msgs.forEach(function (m) { u3.appendChild(h('li', { class: 'is-' + m[0], text: m[1] })); }); out.appendChild(u3); }
		});
		(r.tables || []).forEach(function (t) {
			if (t.h) { out.appendChild(h('h3', { text: t.h })); }
			var tbl = h('table', { class: 'ert-t' }), thead = h('thead'), tr = h('tr');
			t.cols.forEach(function (c) { tr.appendChild(h('th', { scope: 'col', text: c })); });
			thead.appendChild(tr); tbl.appendChild(thead);
			var tb = h('tbody');
			t.rows.forEach(function (row, i) {
				var rr = h('tr', t.cls && t.cls[i] ? { class: 'is-' + t.cls[i] } : null);
				row.forEach(function (c) { rr.appendChild(h('td', { text: c === null || c === undefined ? '–' : String(c) })); });
				tb.appendChild(rr);
			});
			tbl.appendChild(tb);
			out.appendChild(h('div', { class: 'ert-tw', tabindex: '0', role: 'group', 'aria-label': t.h || '' }, [tbl]));
		});
		(r.pre ? [].concat(r.pre) : []).forEach(function (p) {
			if (p.h) { out.appendChild(h('h3', { text: p.h })); }
			out.appendChild(h('pre', { class: 'ert-pre' }, [h('code', { text: p.text })]));
		});
		if (r.after && r.after.length) { var ul2 = h('ul', { class: 'ert-msgs' }); r.after.forEach(function (m) { ul2.appendChild(h('li', { class: 'is-' + m[0], text: m[1] })); }); out.appendChild(ul2); }
		var x = r.x || {}, bar = h('div', { class: 'ert-xa' }), any = false;
		if (x.copy !== undefined) { any = true; bar.appendChild(self.btn(ctx.tc('copy'), function () { self.copy(x.copy); })); }
		var sep = ctx.lang === 'en' ? ',' : ';';
		if (x.csv) { any = true; bar.appendChild(self.btn(ctx.tc('dl', { f: 'CSV' }), function () { download(x.csv.name + '.csv', ERT.csv.build(x.csv.cols, x.csv.rows, sep), 'text/csv;charset=utf-8'); })); }
		if (x.xlsx) { any = true; bar.appendChild(self.btn(ctx.tc('dl', { f: 'XLSX' }), function () { self.xlsx(x.xlsx); })); }
		if (x.ics) { any = true; bar.appendChild(self.btn(ctx.tc('dl', { f: 'ICS' }), function () { download(x.ics.name + '.ics', ERT.ics(x.ics.events, x.ics.cal), 'text/calendar;charset=utf-8'); })); }
		if (x.md) { any = true; bar.appendChild(self.btn(ctx.tc('dl', { f: 'Markdown' }), function () { download(x.md.name + '.md', x.md.text, 'text/markdown;charset=utf-8'); })); }
		if (any) { out.appendChild(bar); }
	};
	App.prototype.btn = function (t, fn) { var b = h('button', { type: 'button', class: 'ert-btn', text: t }); b.addEventListener('click', fn); return b; };
	App.prototype.copy = function (text) {
		var self = this;
		var ok = function () { self.announce(self.ctx.tc('copied')); }, bad = function () { self.announce(self.ctx.tc('copyFail')); };
		if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(ok, bad); }
		else { var ta = h('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); ok(); } catch (e) { bad(); } ta.remove(); }
	};
	App.prototype.xlsx = function (spec) {
		var self = this;
		var go = function () { download(spec.name + '.xlsx', ERT.xlsx(spec.sheets), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); };
		if (ERT.xlsx) { go(); return; }
		var s = document.createElement('script'); s.src = this.cfg.xlsx; s.onload = go; s.onerror = function () { self.announce(self.ctx.tc('fail')); };
		document.head.appendChild(s);
	};
	ERT.App = App;

	function boot() {
		var r = document.getElementById('ert');
		if (!r || !r.getAttribute('data-cfg') || r._ert) { return; }
		var id = JSON.parse(r.getAttribute('data-cfg')).id;
		if (!ERT.tools[id]) { return; } // araç betiği henüz yüklenmedi; load olayında tekrar denenir
		r._ert = new App(r);
	}
	ERT.boot = boot;
	if (typeof document !== 'undefined') {
		if (document.readyState === 'complete') { boot(); } else { document.addEventListener('DOMContentLoaded', boot); root.addEventListener('load', boot); }
	}
}(typeof window !== 'undefined' ? window : globalThis));
