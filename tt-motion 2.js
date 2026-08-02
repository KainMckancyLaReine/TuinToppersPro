/* ==========================================================================
   TuinToppersPro — Motion
   Builds one animation per section, each about the work that section is
   selling. Nothing here is required for the page to function: every step is
   wrapped so a failure leaves the original markup untouched.
   ========================================================================== */
(function () {
    'use strict';

    var REDUCED = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function $(s, r) { return (r || document).querySelector(s); }
    function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
    function el(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html != null) n.innerHTML = html;
        return n;
    }

    /* Shared observer. Elements marked `once` keep their state; the rest go
       quiet again off screen so nothing animates where nobody is looking. */
    var io = null;
    function watch(node, opts) {
        opts = opts || {};
        if (!('IntersectionObserver' in window)) {
            node.classList.add('is-in', 'is-live');
            return;
        }
        if (!io) {
            io = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (e.isIntersecting) {
                        e.target.classList.add('is-in');
                        if (!e.target.__ttOnce) e.target.classList.add('is-live');
                        if (e.target.__ttOnce) io.unobserve(e.target);
                    } else if (!e.target.__ttOnce) {
                        e.target.classList.remove('is-live');
                    }
                });
            }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
        }
        node.__ttOnce = !!opts.once;
        io.observe(node);
    }

    /* ======================================================================
       1. THE GARDEN EDGE — grass and drifting leaves in the heroes
       ====================================================================== */
    var LEAF = '<svg viewBox="0 0 22 14" aria-hidden="true">' +
        '<path d="M1 13C1 6 7 1 21 1c0 8-6 12-20 12Z"/></svg>';

    function edgeFor(section, opts) {
        if (!section || $('.tt-edge', section)) return;
        opts = opts || {};
        var blades = opts.blades || 54;
        var leaves = opts.leaves === 0 ? 0 : (opts.leaves || 7);

        var grass = '';
        for (var i = 0; i < blades; i++) {
            /* two overlaid waves keep the skyline irregular rather than combed */
            var h = 26 + Math.sin(i * 0.7) * 13 + Math.sin(i * 0.23) * 9 + (i % 3) * 4;
            grass += '<i style="--h:' + Math.round(h) + 'px;--i:' + i + '"></i>';
        }

        var drift = '';
        for (var j = 0; j < leaves; j++) {
            drift += '<span class="tt-leaf" style="top:' + (8 + (j * 11) % 66) + '%;' +
                '--s:' + (13 + (j % 4) * 5) + 'px;' +
                '--d:' + (26 + (j % 5) * 9) + 's;' +
                '--o:-' + (j * 6) + 's">' + LEAF + '</span>';
        }

        var edge = el('div', 'tt-edge', drift + '<div class="tt-grass">' + grass + '</div>');
        edge.setAttribute('aria-hidden', 'true');
        section.insertBefore(edge, section.firstChild);
        watch(edge);
    }

    function initHeroes() {
        edgeFor($('.hero'), { blades: 64, leaves: 8 });
        edgeFor($('.pagehero'), { blades: 54, leaves: 6 });
    }

    /* ======================================================================
       2. THE SERVICE CARDS — each icon does its own job
       ====================================================================== */
    function initServices() {
        $$('.services').forEach(function (sec) {
            sec.classList.add('tt-live');
            watch(sec);
        });
    }

    /* ======================================================================
       3. THE FOUR SERVICES — a scene of the work on each detail block
       ====================================================================== */
    var SCENES = {
        onkruid: {
            kind: 'weeds', label: 'Voegen onkruidvrij',
            html: function () {
                var tiles = '';
                for (var i = 0; i < 9; i++) tiles += '<b></b>';
                var weeds = '';
                var spots = [10, 22, 31, 44, 56, 67, 78, 89];
                spots.forEach(function (x, i) {
                    weeds += '<span class="weed" style="--x:' + x + '%;' +
                        '--r:' + ((i % 2 ? 1 : -1) * (4 + i * 2)) + 'deg;' +
                        '--d:' + (i * 0.16) + 's"></span>';
                });
                return '<span class="clean"></span>' + weeds +
                    '<div class="tiles">' + tiles + '</div><span class="tool"></span>';
            }
        },
        hogedruk: {
            kind: 'jet', label: 'Oprit schoon onder hoge druk',
            html: function () {
                return '<div class="surface"><div class="washed"></div></div>' +
                    '<span class="mist"></span>' +
                    '<div class="lance"><span class="fan"></span></div>';
            }
        },
        snoeien: {
            kind: 'prune', label: 'Terug in vorm',
            html: function () {
                var sprouts = '', clips = '';
                var xs = [24, 33, 41, 50, 58, 66, 74];
                xs.forEach(function (x, i) {
                    sprouts += '<span class="sprout" style="--x:' + x + '%;' +
                        '--h:' + (12 + (i % 3) * 7) + 'px;' +
                        '--r:' + ((i % 2 ? 1 : -1) * (5 + i * 3)) + 'deg;' +
                        '--d:' + (i * 0.13) + 's"></span>';
                    clips += '<span class="clip" style="--x:' + x + '%;' +
                        '--dx:' + ((i % 2 ? 1 : -1) * (10 + i * 4)) + 'px;' +
                        '--d:' + (i * 0.09) + 's"></span>';
                });
                return '<div class="shrub"></div>' + sprouts +
                    '<span class="cut"></span>' + clips + '<span class="shape"></span>';
            }
        },
        glazenwasserij: {
            kind: 'glass', label: 'Streeploos resultaat',
            html: function () {
                return '<div class="pane"><div class="clear"></div></div>' +
                    '<span class="squeegee"></span><span class="shine"></span>';
            }
        }
    };

    function initServiceScenes() {
        Object.keys(SCENES).forEach(function (id) {
            var sec = document.getElementById(id);
            if (!sec) return;
            var media = $('.svcdetail__media', sec);
            if (!media || $('.tt-scene', media)) return;

            var cfg = SCENES[id];
            var scene = el('div', 'tt-scene',
                '<div class="tt-scene__head"><i></i>' + cfg.label + '</div>' +
                '<div class="tt-scene__stage">' + cfg.html() + '</div>');
            scene.setAttribute('data-tt', cfg.kind);
            scene.setAttribute('aria-hidden', 'true');
            media.appendChild(scene);
            watch(scene);
        });
    }

    /* ======================================================================
       4. WERKWIJZE — a vine growing from step to step
       ====================================================================== */
    function initHow() {
        $$('.how__steps').forEach(function (steps) {
            if ($('.tt-vine', steps)) return;
            var cards = $$('.how__step', steps);
            if (cards.length < 2) return;

            var leaves = '';
            cards.forEach(function (c, i) {
                var x = (i / (cards.length - 1)) * 100;
                leaves += '<b style="--x:' + x + '%;--d:' + (0.5 + i * 0.55) + 's"></b>';
            });
            var vine = el('div', 'tt-vine', '<i></i>' + leaves);
            vine.setAttribute('aria-hidden', 'true');
            steps.insertBefore(vine, steps.firstChild);
            watch(vine, { once: true });
        });
    }

    /* ======================================================================
       4b. THE FAQ — a stem that grows down the open question
       Five of the seven pages close with a question list rather than steps.
       ====================================================================== */
    function initFaq() {
        $$('.faq').forEach(function (list) {
            $$('.faq__item', list).forEach(function (item, i) {
                if ($('.tt-stem', item)) return;
                var stem = el('span', 'tt-stem', '<i></i><b></b>');
                stem.setAttribute('aria-hidden', 'true');
                item.insertBefore(stem, item.firstChild);
                item.classList.add('tt-faq');
                item.style.setProperty('--d', (i * 0.09) + 's');
                watch(item, { once: true });
            });
        });
    }

    /* ======================================================================
       5b. PRIJZEN — the rows of the price table settle in one by one
       ====================================================================== */
    function initPriceTable() {
        $$('.pricetable').forEach(function (table) {
            $$('tr, .pricetable__row', table).forEach(function (row, i) {
                if (row.dataset.ttRow) return;
                row.dataset.ttRow = '1';
                row.classList.add('tt-row');
                row.style.setProperty('--d', Math.min(i, 12) * 0.055 + 's');
            });
            watch(table, { once: true });
        });
        $$('.iconcard').forEach(function (card, i) {
            if (card.dataset.ttR) return;
            card.dataset.ttR = '1';
            card.classList.add('tt-r');
            card.style.transitionDelay = (i % 3) * 0.1 + 's';
            watch(card, { once: true });
        });
    }

    /* ======================================================================
       5c. VERGELIJKER — the three columns build up their lists
       ====================================================================== */
    function initCompareCards() {
        $$('.cf__grid').forEach(function (grid) {
            $$('.cf__card', grid).forEach(function (card, c) {
                if (card.dataset.ttCf) return;
                card.dataset.ttCf = '1';
                card.classList.add('tt-cf');
                $$('.cf__list li', card).forEach(function (li, i) {
                    li.classList.add('tt-cf-li');
                    li.style.setProperty('--d', (c * 0.12 + i * 0.07) + 's');
                });
                watch(card, { once: true });
            });
        });
    }

    /* ======================================================================
       5. PAKKETTEN — a plant that grows with the tier
       ====================================================================== */
    var PLANTS = [
        /* a seedling */
        '<svg viewBox="0 0 42 52"><path class="stem" d="M21 50V28"/>' +
        '<path class="lf" style="--ox:21px;--oy:28px;--d:.7s" d="M21 30c-7 0-11-4-12-9 6-1 11 2 12 9Z"/>' +
        '<path class="lf" style="--ox:21px;--oy:26px;--d:.9s" d="M21 26c7 0 11-4 12-9-6-1-11 2-12 9Z"/></svg>',
        /* a shrub */
        '<svg viewBox="0 0 42 52"><path class="stem" d="M21 50V18"/>' +
        '<path class="lf" style="--ox:21px;--oy:34px;--d:.6s" d="M21 36c-8 0-13-5-14-11 7-1 13 3 14 11Z"/>' +
        '<path class="lf" style="--ox:21px;--oy:28px;--d:.8s" d="M21 28c8 0 13-5 14-11-7-1-13 3-14 11Z"/>' +
        '<path class="lf" style="--ox:21px;--oy:20px;--d:1s"  d="M21 22c-7 0-11-4-12-9 6-1 11 2 12 9Z"/></svg>',
        /* a tree */
        '<svg viewBox="0 0 42 52"><path class="stem" d="M21 50V14"/>' +
        '<path class="lf" style="--ox:21px;--oy:38px;--d:.55s" d="M21 40c-9 0-15-6-16-13 8-1 15 4 16 13Z"/>' +
        '<path class="lf" style="--ox:21px;--oy:31px;--d:.75s" d="M21 33c9 0 15-6 16-13-8-1-15 4-16 13Z"/>' +
        '<path class="lf" style="--ox:21px;--oy:24px;--d:.95s" d="M21 26c-8 0-13-5-14-11 7-1 13 3 14 11Z"/>' +
        '<circle class="lf" style="--ox:21px;--oy:13px;--d:1.15s" cx="21" cy="13" r="9"/></svg>'
    ];

    function initPackages() {
        /* index uses .pkg, pakketten.html uses .subpkg__card — both get a
           plant that matches how much the tier covers */
        var cards = $$('.packages__grid .pkg, .pkg-grid .pkg, .subpkg__card');
        cards.forEach(function (card, i) {
            if ($('.tt-plant', card)) return;
            var plant = el('span', 'tt-plant', PLANTS[Math.min(i, PLANTS.length - 1)]);
            plant.setAttribute('aria-hidden', 'true');
            card.classList.add('tt-has-plant');
            card.insertBefore(plant, card.firstChild);
            watch(card, { once: true });
        });
    }

    /* ======================================================================
       6. PROJECTEN — the transformation plays itself
       Each before/after wipes open on its own the first time you reach it, so
       you watch the garden change instead of having to discover the handle.
       The moment you touch it, the animation gets out of the way for good.
       ====================================================================== */
    function initProjects() {
        $$('.compare').forEach(function (cmp, i) {
            if (cmp.dataset.ttCmp) return;
            cmp.dataset.ttCmp = '1';

            var after = $('.compare__after', cmp);
            var handle = $('.compare__handle', cmp);
            if (!after || !handle) return;

            /* mower stripes passing over the card as it arrives */
            var mow = el('div', 'tt-mow');
            mow.setAttribute('aria-hidden', 'true');
            cmp.appendChild(mow);
            watch(mow, { once: true });

            /* clippings lifting off the seam as it travels */
            var debris = '';
            for (var d = 0; d < 7; d++) {
                debris += '<i style="top:' + (10 + d * 12) + '%;--d:' + (d * 0.13) + 's;' +
                    '--dx:' + ((d % 2 ? -1 : 1) * (14 + d * 5)) + 'px"></i>';
            }
            var seam = el('div', 'tt-seam', debris);
            seam.setAttribute('aria-hidden', 'true');
            cmp.appendChild(seam);

            var touched = false, raf = null;
            function release() {
                touched = true;
                cancelAnimationFrame(raf);
                cmp.classList.remove('tt-sweeping', 'tt-hint');
            }
            ['pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) {
                cmp.addEventListener(ev, release, { passive: true });
            });

            function setPos(pct) {
                after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
                handle.style.left = pct + '%';
                seam.style.left = pct + '%';
                cmp.setAttribute('aria-valuenow', Math.round(pct));
            }

            /* out to "na", hold, then back to the middle ready for a drag */
            function play() {
                if (touched || REDUCED) return;
                cmp.classList.add('tt-sweeping');
                var OUT = 2400, HOLD = 900, BACK = 900;
                var t0 = performance.now();
                (function step(now) {
                    if (touched) return;
                    var t = now - t0;
                    var pct;
                    if (t < OUT) {
                        var a = t / OUT;
                        pct = 4 + (95 - 4) * (1 - Math.pow(1 - a, 3));
                    } else if (t < OUT + HOLD) {
                        pct = 95;
                    } else if (t < OUT + HOLD + BACK) {
                        var b = (t - OUT - HOLD) / BACK;
                        pct = 95 - (95 - 50) * (1 - Math.pow(1 - b, 3));
                    } else {
                        setPos(50);
                        cmp.classList.remove('tt-sweeping');
                        cmp.classList.add('tt-hint');
                        setTimeout(function () { cmp.classList.remove('tt-hint'); }, 5600);
                        return;
                    }
                    setPos(pct);
                    raf = requestAnimationFrame(step);
                })(t0);
            }

            if ('IntersectionObserver' in window && !REDUCED) {
                new IntersectionObserver(function (entries, obs) {
                    entries.forEach(function (e) {
                        if (!e.isIntersecting) return;
                        obs.disconnect();
                        setTimeout(play, 700 + i * 160);
                    });
                }, { threshold: 0.45 }).observe(cmp);
            }
        });

        /* the tags under each project drop in one after another */
        $$('.project-block').forEach(function (block) {
            $$('.tag', block).forEach(function (tag, i) {
                if (tag.dataset.ttTag) return;
                tag.dataset.ttTag = '1';
                tag.classList.add('tt-tag');
                tag.style.setProperty('--d', (i * 0.09) + 's');
            });
            watch(block, { once: true });
        });
    }

    /* ======================================================================
       6b. WERKWIJZE — the timeline grows down like a vine
       ====================================================================== */
    function initTimeline() {
        $$('.timeline').forEach(function (tl) {
            if ($('.tt-trunk', tl)) return;
            var items = $$('.timeline__item', tl);
            if (!items.length) return;

            var trunk = el('div', 'tt-trunk', '<i></i>');
            trunk.setAttribute('aria-hidden', 'true');
            tl.insertBefore(trunk, tl.firstChild);
            tl.classList.add('tt-tl');

            items.forEach(function (item, i) {
                item.classList.add('tt-tl-item');
                item.style.setProperty('--d', (i * 0.05) + 's');
                /* a leaf unfurls beside every node, alternating sides */
                if (!$('.tt-tl-leaf', item)) {
                    var leaf = el('span', 'tt-tl-leaf' + (i % 2 ? ' alt' : ''));
                    leaf.setAttribute('aria-hidden', 'true');
                    item.appendChild(leaf);
                }
                watch(item, { once: true });
            });

            /* the trunk tracks how far down the section you have read */
            if (REDUCED) { trunk.style.setProperty('--g', 1); return; }
            var fill = $('i', trunk), ticking = false;
            function draw() {
                var r = tl.getBoundingClientRect();
                var vh = window.innerHeight || 800;
                var g = (vh * 0.72 - r.top) / Math.max(1, r.height);
                fill.style.height = (Math.max(0, Math.min(1, g)) * 100) + '%';
                ticking = false;
            }
            window.addEventListener('scroll', function () {
                if (!ticking) { ticking = true; requestAnimationFrame(draw); }
            }, { passive: true });
            window.addEventListener('resize', draw, { passive: true });
            draw();
        });
    }

    /* ======================================================================
       6c. ONZE BELOFTE — each promise icon does its own small thing
       ====================================================================== */
    function initIconRow() {
        $$('.iconrow').forEach(function (row) {
            row.classList.add('tt-live');
            $$('.iconcard', row).forEach(function (card, i) {
                card.style.setProperty('--d', (i * 0.08) + 's');
            });
            watch(row);
        });
    }

    /* ======================================================================
       7. TRUSTBAR — the marks tick in
       ====================================================================== */
    var TICK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.4 5 8.9 9.5 3.4"/></svg>';

    function initTrust() {
        $$('.trustbar').forEach(function (bar) {
            $$('.trust__icon', bar).forEach(function (icon, i) {
                if ($('.tt-tick', icon)) return;
                var tick = el('span', 'tt-tick', TICK);
                tick.style.setProperty('--d', (0.2 + i * 0.16) + 's');
                icon.appendChild(tick);
            });
            bar.classList.add('tt-trust');
            if ('IntersectionObserver' in window) {
                new IntersectionObserver(function (entries, obs) {
                    entries.forEach(function (e) {
                        if (!e.isIntersecting) return;
                        bar.classList.add('tt-in');
                        obs.disconnect();
                    });
                }, { threshold: 0.3 }).observe(bar);
            } else {
                bar.classList.add('tt-in');
            }
        });
    }

    /* ======================================================================
       8. THE CLOSING BAND — a hedge growing across it
       ====================================================================== */
    function initHedge() {
        $$('.cta').forEach(function (band) {
            if ($('.tt-hedge', band)) return;
            var bushes = '';
            for (var i = 0; i < 26; i++) {
                /* alternating sizes give the hedge an uneven, planted top */
                var w = 52 + Math.round(Math.sin(i * 1.3) * 18) + (i % 4) * 9;
                bushes += '<i style="--x:' + ((i / 25) * 100).toFixed(1) + '%;' +
                    '--w:' + w + 'px;--i:' + i + '"></i>';
            }
            var hedge = el('div', 'tt-hedge', bushes);
            hedge.setAttribute('aria-hidden', 'true');
            band.insertBefore(hedge, band.firstChild);
            watch(hedge, { once: true });
        });
    }

    /* ======================================================================
       9. QUIET REVEALS for the blocks the page does not already animate
       ====================================================================== */
    function initReveals() {
        var sels = ['.svcdetail__copy', '.project-block .compare-card__label',
            '.contactstrip .wrap > *', '.about .wrap > *'];
        var seen = [];
        sels.forEach(function (s) {
            $$(s).forEach(function (n) {
                if (n.dataset.ttR || n.closest('.tt-scene')) return;
                n.dataset.ttR = '1';
                seen.push(n);
            });
        });
        seen.forEach(function (n, i) {
            n.classList.add('tt-r');
            n.style.transitionDelay = Math.min(i % 5, 4) * 0.08 + 's';
            watch(n, { once: true });
        });
    }

    /* ======================================================================
       Boot
       ====================================================================== */
    function boot() {
        try { initHeroes(); } catch (e) {}
        try { initServices(); } catch (e) {}
        try { initServiceScenes(); } catch (e) {}
        try { initHow(); } catch (e) {}
        try { initFaq(); } catch (e) {}
        try { initPackages(); } catch (e) {}
        try { initPriceTable(); } catch (e) {}
        try { initCompareCards(); } catch (e) {}
        try { initProjects(); } catch (e) {}
        try { initTimeline(); } catch (e) {}
        try { initIconRow(); } catch (e) {}
        try { initTrust(); } catch (e) {}
        try { initHedge(); } catch (e) {}
        try { initReveals(); } catch (e) {}

        /* nothing this file adds may leave content stuck out of sight */
        setTimeout(function () {
            $$('.tt-r:not(.is-in), .tt-scene:not(.is-in)').forEach(function (n) {
                if (n.getBoundingClientRect().top < window.innerHeight * 1.3) {
                    n.classList.add('is-in');
                }
            });
        }, 2600);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
