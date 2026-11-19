(function () {
  var d = document, r = d.documentElement, D = window.I18N, L = "es", ri = 0;
  var rot = d.getElementById("rot");

  /* Avatar de reserva (monograma MD) si no existe img/foto.jpg */
  var MONO = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#818cf8"/></linearGradient></defs><rect width="120" height="120" fill="url(#g)"/><text x="60" y="77" text-anchor="middle" font-family="Syne,Arial,sans-serif" font-weight="800" font-size="46" fill="#0b1222">MD</text></svg>');
  ["av", "ph"].forEach(function (id) {
    var im = d.getElementById(id);
    if (im) im.onerror = function () { im.onerror = null; im.src = MONO; };
  });

  /* ---------- Idioma ---------- */
  function g(o, k) { return k.split(".").reduce(function (a, p) { return a && a[p]; }, o); }
  function num(n) { return n.toLocaleString(L === "en" ? "en-US" : L === "pt" ? "pt-BR" : "es-AR"); }
  function paintStats() {
    d.querySelectorAll(".st b[data-n]").forEach(function (b) { b.textContent = num(+b.dataset.n) + b.dataset.s; });
  }
  function setLang(l) {
    if (!D[l]) l = "es";
    L = l; var T = D[l]; r.lang = l; d.title = T.meta.title;
    var md = d.querySelector('meta[name="description"]'); if (md) md.setAttribute("content", T.meta.desc);
    d.querySelectorAll("[data-i18n]").forEach(function (e) { var v = g(T, e.getAttribute("data-i18n")); if (v != null) e.textContent = v; });
    d.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-l") === l ? "true" : "false"); });
    ri = 0; rot.textContent = T.rot[0];
    paintStats();
    try { localStorage.setItem("lg", l); } catch (e) {}
  }
  var sv = null; try { sv = localStorage.getItem("lg"); } catch (e) {}
  setLang(sv || (navigator.language || "es").slice(0, 2));
  d.querySelectorAll(".lang button").forEach(function (b) { b.onclick = function () { setLang(b.getAttribute("data-l")); }; });

  /* ---------- Tema claro / oscuro ---------- */
  try { var t = localStorage.getItem("th"); if (t) r.setAttribute("data-theme", t); } catch (e) {}
  d.getElementById("tg").onclick = function () {
    var cur = r.getAttribute("data-theme");
    var dark = cur ? cur === "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
    var n = dark ? "light" : "dark";
    r.setAttribute("data-theme", n);
    try { localStorage.setItem("th", n); } catch (e) {}
  };

  /* ---------- Nombre letra a letra + palabras rotatorias ---------- */
  var h = d.getElementById("nm"), s = h.textContent; h.textContent = "";
  s.split("").forEach(function (c) {
    if (c === " ") { h.appendChild(d.createTextNode(" ")); return; } /* espacio normal: el nombre puede partirse en dos líneas */
    var x = d.createElement("span"); x.className = "ch"; x.setAttribute("aria-hidden", "true");
    x.textContent = c; h.appendChild(x);
  });
  setInterval(function () {
    rot.classList.add("o");
    setTimeout(function () { var w = D[L].rot; ri = (ri + 1) % w.length; rot.textContent = w[ri]; rot.classList.remove("o"); }, 350);
  }, 2400);

  /* ---------- Cinta de tecnologías (se duplica para el bucle) ---------- */
  var trk = d.getElementById("trk");
  if (trk) trk.innerHTML += trk.innerHTML;

  /* ---------- Menú móvil + scroll-spy ---------- */
  var sb = d.getElementById("sb"), mn = d.getElementById("mn");
  function tog(o) { sb.classList.toggle("open", o); mn.setAttribute("aria-expanded", o ? "true" : "false"); }
  mn.onclick = function () { tog(!sb.classList.contains("open")); };
  d.querySelectorAll("#nv a").forEach(function (a) { a.onclick = function () { tog(false); }; });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") tog(false); });
  var links = {}; d.querySelectorAll("#nv a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var so = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        Object.keys(links).forEach(function (k) { links[k].classList.remove("on"); });
        var a = links[e.target.id]; if (a) a.classList.add("on");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  ["top", "sobre-mi", "experiencia", "proyectos", "skills", "contacto"].forEach(function (id) { var e = d.getElementById(id); if (e) so.observe(e); });

  /* ---------- Brillo que sigue al cursor ---------- */
  var gl = d.getElementById("gl");
  addEventListener("pointermove", function (e) { gl.style.left = e.clientX + "px"; gl.style.top = e.clientY + "px"; }, { passive: true });

  /* ---------- Aparición al hacer scroll + contadores ---------- */
  function countUp(b) {
    var end = +b.dataset.n, t0 = performance.now(), dur = 1200;
    (function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      b.textContent = num(Math.round(end * e)) + (p === 1 ? b.dataset.s : "");
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  var io = new IntersectionObserver(function (es) {
    var n = 0;
    es.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.style.setProperty("--d", (n++ * 0.12) + "s");
        e.target.classList.add("in");
        e.target.querySelectorAll(".st b[data-n]").forEach(countUp);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  function startReveal() { d.querySelectorAll(".rv").forEach(function (n) { io.observe(n); }); }

  /* ---------- Video de 365 Marea (se carga al pulsar) ---------- */
  var pv = d.getElementById("playv"), vb = d.getElementById("vid");
  if (pv) pv.onclick = function () {
    var v = d.createElement("video");
    v.src = "media/marea-como-funciona.mp4"; v.poster = "img/marea-poster.webp";
    v.controls = true; v.muted = true; v.autoplay = true; v.playsInline = true; v.preload = "metadata";
    vb.appendChild(v); vb.hidden = false; pv.hidden = true;
  };

  /* ---------- Intro: olas + contador ---------- */
  var it = d.getElementById("intro"), sk = d.getElementById("skip"), pct = d.getElementById("pct");
  var done = false, iv = 0;
  function fin() {
    if (done) return; done = true; clearInterval(iv);
    r.classList.remove("lk");
    if (!location.hash) scrollTo(0, 0);
    it.classList.add("out");
    setTimeout(startReveal, 250);
    setTimeout(function () { it.remove(); }, 950);
  }
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) {
    fin();
  } else {
    /* Temporizador (no requestAnimationFrame) para que también avance en pestañas en segundo plano */
    var t0 = performance.now(), DUR = 3200;
    iv = setInterval(function () {
      var p = Math.min(1, (performance.now() - t0) / DUR);
      pct.textContent = Math.round(p * 100);
      if (p >= 1) { clearInterval(iv); setTimeout(fin, 350); }
    }, 40);
    setTimeout(fin, 6500); /* seguro: la intro nunca bloquea la página */
    sk.onclick = fin;
  }
})();
