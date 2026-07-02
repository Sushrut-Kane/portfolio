/* =============================================================
   Sushrut Kane — Portfolio motion system
   Lenis + GSAP/ScrollTrigger. Everything degrades gracefully if a
   library is missing or the user prefers reduced motion.
   ============================================================= */
(function () {
    "use strict";

    const hasGSAP = typeof window.gsap !== "undefined";
    const hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
    const hasLenis = typeof window.Lenis !== "undefined";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    if (hasST) gsap.registerPlugin(ScrollTrigger);

    /* ----------------------------------------------------------
       Live clock (IST — Sushrut is in Jaipur)
    ---------------------------------------------------------- */
    const clock = $("#clock");
    if (clock) {
        const tick = () => {
            try {
                clock.textContent = new Date().toLocaleTimeString("en-GB", {
                    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
                });
            } catch (e) {
                clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }
        };
        tick();
        setInterval(tick, 15000);
    }

    /* ----------------------------------------------------------
       Reduced-motion / no-GSAP fast path: reveal everything, wire
       up only the essential interactions, then bail out.
    ---------------------------------------------------------- */
    if (reduce || !hasGSAP) {
        const pre = $("#preloader");
        if (pre) pre.style.display = "none";
        document.documentElement.classList.add("ready");
        initMenu();
        initAnchors(null);
        initToTop(null);
        return;
    }

    /* ----------------------------------------------------------
       Smooth scroll (Lenis) wired into ScrollTrigger
    ---------------------------------------------------------- */
    let lenis = null;
    if (hasLenis) {
        lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
        if (hasST) lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    /* ----------------------------------------------------------
       Text splitter — wraps words / lines in masked spans
    ---------------------------------------------------------- */
    function splitWords(root) {
        const walk = (node) => {
            Array.from(node.childNodes).forEach((child) => {
                if (child.nodeType === 3) {
                    if (!child.textContent.trim()) return;
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach((part) => {
                        if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
                        const outer = document.createElement("span");
                        outer.className = "reveal-word";
                        const inner = document.createElement("span");
                        inner.textContent = part;
                        outer.appendChild(inner);
                        frag.appendChild(outer);
                    });
                    node.replaceChild(frag, child);
                } else if (child.nodeType === 1 && child.tagName !== "BR") {
                    walk(child);
                }
            });
        };
        walk(root);
        return $$(".reveal-word > span", root);
    }

    function splitLines(root) {
        Array.from(root.children).forEach((line) => {
            const mask = document.createElement("span");
            mask.className = "mask";
            root.insertBefore(mask, line);
            mask.appendChild(line);
            line.style.display = "inline-block";
        });
        return $$(".mask > span", root);
    }

    // Prepare every [data-split] element. Hero pieces are always hidden (the
    // intro timeline reveals them); the rest only when ScrollTrigger can reveal
    // them on scroll — otherwise they must stay visible.
    const splitMap = new Map();
    $$("[data-split]").forEach((el) => {
        const pieces = el.dataset.split === "lines" ? splitLines(el) : splitWords(el);
        if (el.closest(".hero") || hasST) gsap.set(pieces, { yPercent: 115 });
        splitMap.set(el, pieces);
    });

    // Generic reveal targets outside the hero (hero is handled by the intro).
    const scrollReveals = $$("[data-reveal]").filter((el) => !el.closest(".hero"));
    if (hasST) gsap.set(scrollReveals, { y: 28, opacity: 0 });
    const heroReveals = $$(".hero [data-reveal]");
    gsap.set(heroReveals, { y: 28, opacity: 0 });

    /* ----------------------------------------------------------
       Preloader → hero intro
    ---------------------------------------------------------- */
    function playHero() {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        const heroTitle = splitMap.get($(".hero__title"));
        tl.to(heroTitle || [], { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.05)
            .to(heroReveals, { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.35)
            .from(".hero__cta .btn", { y: 20, opacity: 0, duration: 0.7, stagger: 0.12 }, 0.5)
            .from(".scroll-cue", { opacity: 0, duration: 0.8 }, 0.9)
            .from(".marquee", { opacity: 0, duration: 1 }, 0.6);
    }

    function runPreloader() {
        const pre = $("#preloader");
        const count = $("#count");
        const bar = $("#preBar");
        if (!pre) { playHero(); return; }
        if (lenis) lenis.stop();

        const counter = { v: 0 };
        const tl = gsap.timeline({
            onComplete: () => {
                pre.style.display = "none";
                document.documentElement.classList.add("ready");
                if (lenis) lenis.start();
                if (hasST) ScrollTrigger.refresh();
                playHero();
            },
        });

        tl.to(counter, {
            v: 100, duration: 1.7, ease: "power2.inOut",
            onUpdate: () => { if (count) count.textContent = String(Math.round(counter.v)).padStart(2, "0"); },
        })
            .to(bar, { scaleX: 1, duration: 1.7, ease: "power2.inOut" }, 0)
            .to(".preloader__count, .preloader__meta", { y: -30, opacity: 0, duration: 0.5, ease: "power2.in" }, "+=0.15")
            .to(pre, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.1");
    }

    /* ----------------------------------------------------------
       Scroll-triggered reveals
    ---------------------------------------------------------- */
    if (hasST) {
        // Split headings (outside hero) reveal as they enter.
        splitMap.forEach((pieces, el) => {
            if (el.closest(".hero")) return;
            gsap.to(pieces, {
                yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.06,
                scrollTrigger: { trigger: el, start: "top 88%" },
            });
        });

        // Generic reveals, batched for nice stagger.
        ScrollTrigger.batch(scrollReveals, {
            start: "top 90%",
            onEnter: (batch) =>
                gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.09, overwrite: true }),
        });

        // Number count-up.
        $$("[data-count]").forEach((el) => {
            const target = parseFloat(el.dataset.count);
            const obj = { v: 0 };
            ScrollTrigger.create({
                trigger: el, start: "top 92%", once: true,
                onEnter: () =>
                    gsap.to(obj, {
                        v: target, duration: 1.6, ease: "power2.out",
                        onUpdate: () => { el.textContent = Math.round(obj.v); },
                    }),
            });
        });
    }

    /* ----------------------------------------------------------
       Marquee — infinite loop, reacts to scroll velocity
    ---------------------------------------------------------- */
    const marquees = [];
    $$(".marquee__track").forEach((track) => {
        track.innerHTML += track.innerHTML; // duplicate for seamless wrap
        const tween = gsap.to(track, { xPercent: -50, duration: 24, ease: "none", repeat: -1 });
        marquees.push({ track, tween, skew: gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3" }) });
    });
    if (lenis && marquees.length) {
        lenis.on("scroll", ({ velocity }) => {
            const v = velocity || 0;
            const dir = v < 0 ? -1 : 1;
            marquees.forEach((m) => {
                m.tween.timeScale(dir * Math.min(6, 1 + Math.abs(v) * 0.25));
                m.skew(Math.max(-14, Math.min(14, v * 0.6)));
            });
        });
    }

    /* ----------------------------------------------------------
       Custom cursor + hover states
    ---------------------------------------------------------- */
    if (finePointer) {
        const dot = $(".cursor");
        const ring = $(".cursor-follow");
        const label = $(".cursor-label");
        if (dot && ring) {
            gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
            const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
            const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
            const rx = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
            const ry = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });

            window.addEventListener("mousemove", (e) => {
                dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
            });
            document.addEventListener("mouseleave", () => document.body.classList.add("cursor-hidden"));
            document.addEventListener("mouseenter", () => document.body.classList.remove("cursor-hidden"));

            $$("[data-cursor], a, button").forEach((el) => {
                el.addEventListener("mouseenter", () => {
                    ring.classList.add("is-hover");
                    if (label) label.textContent = el.dataset.cursor || "";
                });
                el.addEventListener("mouseleave", () => {
                    ring.classList.remove("is-hover");
                    if (label) label.textContent = "";
                });
            });
        }
    }

    /* ----------------------------------------------------------
       Magnetic elements
    ---------------------------------------------------------- */
    if (finePointer) {
        $$(".magnetic").forEach((el) => {
            const strength = 0.35;
            const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
            const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
            el.addEventListener("mousemove", (e) => {
                const r = el.getBoundingClientRect();
                xTo((e.clientX - (r.left + r.width / 2)) * strength);
                yTo((e.clientY - (r.top + r.height / 2)) * strength);
            });
            el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
        });
    }

    /* ----------------------------------------------------------
       Work list — floating preview that follows the cursor
    ---------------------------------------------------------- */
    (function initWork() {
        const list = $("#workList");
        const preview = $("#workPreview");
        if (!list || !preview) return;
        const imgs = $$(".work-preview__img", preview);
        gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0.9 });
        const px = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3" });
        const py = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3" });

        const show = (i) => imgs.forEach((im, k) => im.classList.toggle("is-shown", k === i));

        $$(".work__item", list).forEach((item) => {
            item.addEventListener("mouseenter", () => {
                list.classList.add("has-hover");
                item.classList.add("is-hover");
                preview.classList.add("is-active");
                gsap.to(preview, { scale: 1, duration: 0.5, ease: "power3", overwrite: "auto" });
                show(parseInt(item.dataset.img, 10) || 0);
            });
            item.addEventListener("mouseleave", () => item.classList.remove("is-hover"));
        });
        list.addEventListener("mouseleave", () => {
            list.classList.remove("has-hover");
            preview.classList.remove("is-active");
            gsap.to(preview, { scale: 0.9, duration: 0.4, ease: "power3", overwrite: "auto" });
        });
        if (finePointer) {
            window.addEventListener("mousemove", (e) => {
                if (preview.classList.contains("is-active")) { px(e.clientX); py(e.clientY); }
            });
        }
    })();

    /* ----------------------------------------------------------
       Experience list — floating company-logo preview
    ---------------------------------------------------------- */
    (function initExperience() {
        const list = $(".xp");
        const preview = $("#xpPreview");
        if (!list || !preview) return;
        const slides = $$(".xp-preview__slide", preview);
        gsap.set(preview, { xPercent: -50, yPercent: -50, scale: 0.9 });
        const px = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3" });
        const py = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3" });

        const show = (i) => slides.forEach((s, k) => s.classList.toggle("is-shown", k === i));

        $$(".xp__item", list).forEach((item) => {
            item.addEventListener("mouseenter", () => {
                list.classList.add("has-hover");
                item.classList.add("is-hover");
                preview.classList.add("is-active");
                gsap.to(preview, { scale: 1, duration: 0.5, ease: "power3", overwrite: "auto" });
                show(parseInt(item.dataset.img, 10) || 0);
            });
            item.addEventListener("mouseleave", () => item.classList.remove("is-hover"));
        });
        list.addEventListener("mouseleave", () => {
            list.classList.remove("has-hover");
            preview.classList.remove("is-active");
            gsap.to(preview, { scale: 0.9, duration: 0.4, ease: "power3", overwrite: "auto" });
        });
        if (finePointer) {
            window.addEventListener("mousemove", (e) => {
                if (preview.classList.contains("is-active")) { px(e.clientX); py(e.clientY); }
            });
        }
    })();

    /* ----------------------------------------------------------
       Hero rotator
    ---------------------------------------------------------- */
    (function rotator() {
        const el = $("#rotator");
        if (!el) return;
        const words = ["intelligent systems", "web apps", "ML models", "useful things"];
        let i = 0;
        setInterval(() => {
            i = (i + 1) % words.length;
            gsap.to(el, {
                yPercent: -100, opacity: 0, duration: 0.35, ease: "power2.in",
                onComplete: () => {
                    el.textContent = words[i];
                    gsap.fromTo(el, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
                },
            });
        }, 2600);
    })();

    /* ----------------------------------------------------------
       Nav: hide on scroll-down, progress bar, active section
    ---------------------------------------------------------- */
    (function initNav() {
        const nav = $("#nav");
        const progress = $(".progress");
        let last = 0;
        const onScroll = (y, prog) => {
            if (nav) {
                if (y > last && y > 200) nav.classList.add("is-hidden");
                else nav.classList.remove("is-hidden");
            }
            last = y;
            if (progress && typeof prog === "number") gsap.set(progress, { scaleX: prog });
        };
        if (lenis) lenis.on("scroll", ({ scroll, progress }) => onScroll(scroll, progress));
        else window.addEventListener("scroll", () => {
            const h = document.documentElement;
            onScroll(h.scrollTop, h.scrollTop / (h.scrollHeight - h.clientHeight));
        });

        if (hasST) {
            $$("#nav .nav__link").forEach((link) => {
                const id = link.getAttribute("href");
                const sec = $(id);
                if (!sec) return;
                ScrollTrigger.create({
                    trigger: sec, start: "top 45%", end: "bottom 45%",
                    onToggle: (self) => link.classList.toggle("is-active", self.isActive),
                });
            });
        }
    })();

    /* ----------------------------------------------------------
       Menu / anchors / back-to-top
    ---------------------------------------------------------- */
    function initMenu() {
        const nav = $("#nav");
        const burger = $("#burger");
        const menu = $("#menu");
        if (!burger || !menu || !nav) return;
        const setOpen = (open) => {
            nav.classList.toggle("menu-open", open);
            menu.classList.toggle("is-open", open);
            burger.setAttribute("aria-expanded", String(open));
            if (lenis) open ? lenis.stop() : lenis.start();
        };
        burger.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
        $$(".menu-link", menu).forEach((l) => l.addEventListener("click", () => setOpen(false)));
    }

    function initAnchors(lenisRef) {
        $$('a[href^="#"]').forEach((a) => {
            a.addEventListener("click", (e) => {
                const id = a.getAttribute("href");
                if (id.length < 2) return;
                const target = $(id);
                if (!target) return;
                e.preventDefault();
                if (lenisRef) lenisRef.scrollTo(target, { offset: -60, duration: 1.2 });
                else target.scrollIntoView({ behavior: "smooth" });
            });
        });
    }

    function initToTop(lenisRef) {
        const btn = $("#toTop");
        if (!btn) return;
        btn.addEventListener("click", () => {
            if (lenisRef) lenisRef.scrollTo(0, { duration: 1.2 });
            else window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    initMenu();
    initAnchors(lenis);
    initToTop(lenis);

    window.addEventListener("load", () => { if (hasST) ScrollTrigger.refresh(); });

    /* Kick things off */
    runPreloader();
})();
