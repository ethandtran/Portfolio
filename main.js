  (function () {
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Hero title typing effect
    var heroTyped = document.querySelector('.hero-title-typed');
    if (heroTyped) {
      var fullTitle = "Hi! I'm Ethan Tran.";
      if (prefersReduced) {
        heroTyped.textContent = fullTitle;
      } else {
        var cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        heroTyped.after(cursor);

        (function typeHeroTitle() {
          var i = 0;
          var speed = 62;
          (function step() {
            heroTyped.textContent = fullTitle.slice(0, i);
            i++;
            if (i <= fullTitle.length) {
              setTimeout(step, speed);
            }
          })();
        })();
      }
    }

    // Scroll reveal, extended to every project-page block (story text,
    // figures, stat rows) so the whole site gains the same fade-up-on-scroll
    // treatment, not just the main page's grids.
    var autoRevealSelectors = [
      '.po-section-title', '.po-subsection-title', '.po-section-body',
      '.po-intro', '.po-conclusion', '.po-callback', '.po-meta',
      '.po-hero', '.po-figure', '.po-stat'
    ];
    document.querySelectorAll(autoRevealSelectors.join(',')).forEach(function (el) {
      el.classList.add('reveal');
    });

    // Count-up numbers: pull the leading number out of each .po-stat-num
    // (keeping a leading "$" and any trailing unit/text, like the "th" in
    // "10th of 29", untouched) so it can be animated from 0 up to its real
    // value once the stat scrolls into view.
    var counters = [];
    document.querySelectorAll('.po-stat-num').forEach(function (el) {
      var node = el.firstChild;
      if (!node || node.nodeType !== 3) return;
      var m = node.textContent.match(/^(\$?)(\d[\d,]*)([\s\S]*)$/);
      if (!m) return;
      var target = parseInt(m[2].replace(/,/g, ''), 10);
      if (!isFinite(target)) return;
      counters.push({ node: node, prefix: m[1], target: target, suffix: m[3] });
      node.textContent = m[1] + '0' + m[3];
    });

    function runCounter(c) {
      var duration = 1300;
      var start = null;
      function frame(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, (ts - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        var val = Math.round(c.target * eased);
        c.node.textContent = c.prefix + val.toLocaleString('en-US') + c.suffix;
        if (t < 1) window.requestAnimationFrame(frame);
      }
      window.requestAnimationFrame(frame);
    }

    if ('IntersectionObserver' in window && !prefersReduced) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
            counters.forEach(function (c) {
              if (entry.target.contains(c.node)) runCounter(c);
            });
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      counters.forEach(function (c) {
        c.node.textContent = c.prefix + c.target.toLocaleString('en-US') + c.suffix;
      });
    }

    // Nav scrolled state
    var nav = document.getElementById('siteNav');
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // The nav now sits above project overlays too (see .site-nav z-index),
    // so overlay content needs real clearance instead of a guessed value.
    var syncNavHeight = function () {
      document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
    };
    syncNavHeight();
    window.addEventListener('resize', syncNavHeight);
    if ('ResizeObserver' in window) new ResizeObserver(syncNavHeight).observe(nav);

    // Hero photo: bottom-align it with the bottom of the intro text next to
    // it. A plain align-self: flex-end aligns to the row's tallest sibling
    // (the record player), not specifically the text, so measure and nudge
    // instead.
    var heroPhotoCol = document.querySelector('.hero-photo-col');
    var heroText = document.querySelector('.hero-text');
    if (heroPhotoCol && heroText) {
      var syncHeroPhotoAlign = function () {
        var photo = heroPhotoCol.querySelector('.hero-photo');
        if (!photo) return;
        // Reset first so the measurement is always against the natural
        // (untransformed) position, not whatever translateY a previous call
        // left behind — otherwise a call that lands exactly on target (diff
        // 0) reads as "no transform needed" and wipes the correction, which
        // then flips back and forth forever across repeated calls.
        heroPhotoCol.style.transform = '';
        var textRect = heroText.getBoundingClientRect();
        var photoRect = photo.getBoundingClientRect();
        // hero-row can wrap to a stacked layout at narrow widths, where the
        // photo sits directly above the text instead of beside it — bottom-
        // aligning them wouldn't make sense there. Side by side, the photo's
        // left edge sits well left of the text's; stacked, both share the
        // same left edge (the wrapped column), so that's what to check —
        // top offsets differ either way because of the row's own
        // center-alignment, so they're not a reliable signal here.
        if (Math.abs(photoRect.left - textRect.left) < 4) return;
        var diff = textRect.bottom - photoRect.bottom;
        heroPhotoCol.style.transform = 'translateY(' + diff + 'px)';
      };
      syncHeroPhotoAlign();
      window.addEventListener('resize', syncHeroPhotoAlign);
      if ('ResizeObserver' in window) new ResizeObserver(syncHeroPhotoAlign).observe(heroText);
      // The hero title types itself out on load, and a late web-font swap
      // (FOUT) can also reflow the text after our first measurement —
      // re-check once fonts are actually done loading, plus a fallback delay.
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeroPhotoAlign);
      window.addEventListener('load', syncHeroPhotoAlign);
      [300, 800, 1600].forEach(function (ms) { setTimeout(syncHeroPhotoAlign, ms); });
    }

    // Resume dropdowns (nav + footer): blur the link after a click so the
    // menu doesn't stay stuck open once the mouse leaves (a clicked link
    // keeps focus, and the dropdown is shown via :focus-within for keyboard users)
    document.querySelectorAll('.nav-dropdown a, .nav-dropdown button, .footer-dropdown a, .footer-dropdown button').forEach(function (a) {
      a.addEventListener('click', function () {
        a.blur();
      });
    });

    // Auto-rotating image carousel (currently just Zekrom's view gallery).
    // New slides enter from the right and the outgoing slide exits left.
    document.querySelectorAll('.po-carousel').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.po-carousel-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('.po-carousel-dot'));
      var caption = carousel.querySelector('[data-carousel-caption]');
      var captions = slides.map(function (s) { return s.querySelector('img').alt; });
      var index = 0;
      var timer = null;

      function show(next) {
        if (next === index) return;
        slides[index].classList.remove('is-active');
        slides[index].classList.add('is-prev');
        slides[next].classList.remove('is-prev');
        slides[next].classList.add('is-active');
        dots[index].classList.remove('is-active');
        dots[next].classList.add('is-active');
        if (caption) caption.textContent = captions[next];
        index = next;
      }

      function advance() { show((index + 1) % slides.length); }

      function start() {
        if (timer || prefersReduced || slides.length < 2) return;
        timer = setInterval(advance, 4000);
      }

      function stop() {
        clearInterval(timer);
        timer = null;
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          stop();
          start();
        });
      });

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) start(); else stop();
          });
        }, { threshold: 0.2 }).observe(carousel);
      } else {
        start();
      }
    });

    // Experience accordion
    document.querySelectorAll('.tl-trigger').forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.closest('.tl-row').classList.toggle('open');
      });
    });

    // Work/project tiles: tap or keyboard to reveal on touch devices
    var hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    document.querySelectorAll('.proj-tile').forEach(function (tile) {
      if (tile.hasAttribute('data-project')) return;
      if (!hasFinePointer) {
        tile.addEventListener('click', function () {
          tile.classList.toggle('is-active');
        });
      }
      tile.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tile.classList.toggle('is-active');
        }
      });
    });

    // Custom cursor dot (replaces the system pointer everywhere)
    var cursorDot = document.getElementById('cursorDot');
    if (cursorDot && hasFinePointer) {
      document.addEventListener('mousemove', function (e) {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        if (!e.target.closest('.proj-tile')) {
          cursorDot.classList.add('is-visible');
        }
      });
      document.addEventListener('mouseleave', function () {
        cursorDot.classList.remove('is-visible');
      });

      // Click: the dot ducks out and a ring ripples outward from the click point
      document.addEventListener('mousedown', function (e) {
        var ripple = document.createElement('div');
        ripple.className = 'cursor-ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        ripple.addEventListener('animationend', function () {
          ripple.remove();
        });

        cursorDot.classList.add('is-clicking');
        setTimeout(function () {
          cursorDot.classList.remove('is-clicking');
        }, 200);
      });
    }

    // Cursor-follow bubble on work/project tiles ("see work" / "see project")
    var cursorBubble = document.getElementById('cursorBubble');
    if (cursorBubble && hasFinePointer) {
      var bindCursorBubble = function (el) {
        var label = el.getAttribute('data-cursor-label') || '';
        el.addEventListener('mouseenter', function () {
          cursorBubble.textContent = label;
          cursorBubble.classList.add('is-visible');
          if (cursorDot) cursorDot.classList.remove('is-visible');
        });
        el.addEventListener('mousemove', function (e) {
          cursorBubble.style.left = e.clientX + 'px';
          cursorBubble.style.top = e.clientY + 'px';
        });
        el.addEventListener('mouseleave', function () {
          cursorBubble.classList.remove('is-visible');
          if (cursorDot) cursorDot.classList.add('is-visible');
        });
      };
      document.querySelectorAll('.proj-tile').forEach(bindCursorBubble);

      // Filmstrip photos (Zekrom, Ice Cream Cow Robot): same hover bubble,
      // but the photos keep sliding under the cursor even while hovering,
      // so binding enter/leave per-photo like above races and flickers as
      // items slide in and out from under a stationary pointer. Instead,
      // bind enter/leave once on the strip itself (it doesn't move) and
      // use elementFromPoint on every mousemove to find whichever photo is
      // currently under the cursor and show its caption.
      document.querySelectorAll('.po-filmstrip').forEach(function (strip) {
        strip.addEventListener('mouseenter', function () {
          cursorBubble.classList.add('is-visible');
          if (cursorDot) cursorDot.classList.remove('is-visible');
        });
        strip.addEventListener('mousemove', function (e) {
          cursorBubble.style.left = e.clientX + 'px';
          cursorBubble.style.top = e.clientY + 'px';
          var el = document.elementFromPoint(e.clientX, e.clientY);
          var item = el && el.closest('.po-filmstrip-item[data-cursor-label]');
          if (item) cursorBubble.textContent = item.getAttribute('data-cursor-label');
        });
        strip.addEventListener('mouseleave', function () {
          cursorBubble.classList.remove('is-visible');
          if (cursorDot) cursorDot.classList.add('is-visible');
        });
      });
    }


    // Project detail overlays. Each .project-overlay is one project page,
    // matched to a tile by data-project / data-project-panel. The bottom bar
    // and its scroll-progress line are shared, since only one can be open.
    (function () {
      var panels = document.querySelectorAll('.project-overlay[data-project-panel]');
      if (!panels.length) return;

      var backBtn = document.getElementById('poBack');
      var bottomBar = document.getElementById('poBottomBar');
      var scrollFill = document.getElementById('poScrollFill');
      var active = null;
      var lastTrigger = null;
      var byName = {};

      function updateScrollProgress() {
        if (!scrollFill || !active) return;
        var max = active.scrollHeight - active.clientHeight;
        var pct = max > 0 ? Math.min(100, (active.scrollTop / max) * 100) : 0;
        scrollFill.style.width = pct + '%';
      }

      function setup(overlay) {
        var railItems = overlay.querySelectorAll('.po-rail-item');
        var sections = overlay.querySelectorAll('.po-main > div[id], .po-section');

        // Reuse the tile's cover image as the hero rather than embedding a
        // second copy of the same base64 data.
        var hero = overlay.querySelector('.po-hero[data-hero-for]');
        if (hero && !hero.querySelector('img')) {
          var name = hero.getAttribute('data-hero-for');
          var tileImg = document.querySelector('.proj-tile[data-project="' + name + '"] .proj-tile-img');
          if (tileImg && tileImg.getAttribute('src')) {
            var img = document.createElement('img');
            img.src = tileImg.getAttribute('src');
            img.alt = '';
            hero.appendChild(img);
          }
        }

        // Scroll-spy: exactly one rail item is active, the last section whose
        // top has crossed the threshold line (or the final one at the bottom).
        function updateActiveSection() {
          if (!railItems.length || !sections.length) return;
          var line = overlay.clientHeight * 0.35;
          var overlayTop = overlay.getBoundingClientRect().top;
          var current = sections[0];
          sections.forEach(function (s) {
            if (s.getBoundingClientRect().top - overlayTop <= line) current = s;
          });
          if (overlay.scrollTop + overlay.clientHeight >= overlay.scrollHeight - 4) {
            current = sections[sections.length - 1];
          }
          railItems.forEach(function (ri) {
            ri.classList.toggle('is-active', ri.getAttribute('data-po-target') === current.id);
          });
        }

        var ticking = false;
        overlay.addEventListener('scroll', function () {
          updateScrollProgress();
          if (ticking) return;
          ticking = true;
          window.requestAnimationFrame(function () {
            updateActiveSection();
            ticking = false;
          });
        }, { passive: true });
        window.addEventListener('resize', updateActiveSection);

        railItems.forEach(function (item, i) {
          item.addEventListener('click', function (e) {
            e.preventDefault();
            // The first item is the top block, so go all the way up rather
            // than skipping the container's top padding.
            if (i === 0) {
              overlay.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
              return;
            }
            var target = overlay.querySelector('#' + item.getAttribute('data-po-target'));
            if (target) {
              target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
            }
          });
        });

        // Results layout: where a page pairs a landscape and portrait video,
        // the portrait runs from the top of the copy to the landscape's bottom.
        // The left column is text plus a width-scaled video, so no fixed ratio
        // tracks it at every width. Measure it instead.
        var grid = overlay.querySelector('.po-results-grid');
        if (grid) {
          var main = grid.querySelector('.po-results-main');
          var landscape = grid.querySelector('.po-video-landscape video');
          var portrait = grid.querySelector('.po-video-portrait video');
          if (main && landscape && portrait) {
            var syncPortraitHeight = function () {
              if (window.matchMedia('(max-width: 1180px)').matches) {
                portrait.style.height = '';
                return;
              }
              var h = Math.round(landscape.getBoundingClientRect().bottom - main.getBoundingClientRect().top);
              if (h > 0) portrait.style.height = h + 'px';
            };
            syncPortraitHeight();
            window.addEventListener('resize', syncPortraitHeight);
            landscape.addEventListener('loadedmetadata', syncPortraitHeight);
            if ('ResizeObserver' in window) new ResizeObserver(syncPortraitHeight).observe(main);
            overlay.addEventListener('po:opened', syncPortraitHeight);
          }
        }

        overlay.addEventListener('po:opened', updateActiveSection);

        // Videos only start playing once scrolled fully into view within the
        // overlay, and stop when they scroll out or the overlay itself is
        // hidden (closed, or tucked behind a nested overlay on the back-stack).
        var overlayVideos = Array.prototype.slice.call(overlay.querySelectorAll('video'));
        var videoObserver = null;
        if (overlayVideos.length && 'IntersectionObserver' in window) {
          videoObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                entry.target.play().catch(function () {});
              } else {
                entry.target.pause();
              }
            });
          }, { root: overlay, threshold: [0, 0.5, 1] });
        }
        overlay.addEventListener('po:opened', function () {
          if (videoObserver) overlayVideos.forEach(function (v) { videoObserver.observe(v); });
        });
        overlay.addEventListener('po:closed', function () {
          if (videoObserver) videoObserver.disconnect();
          overlayVideos.forEach(function (v) { v.pause(); });
        });

        byName[overlay.getAttribute('data-project-panel')] = overlay;
      }

      panels.forEach(setup);

      var overlayStack = [];

      // Keeps the URL in sync with whichever overlay is open (or none), so
      // a refresh can restore the same page instead of dropping back home.
      // replaceState (not pushState) so this doesn't spam browser history.
      function syncHash() {
        if (active) {
          history.replaceState(null, '', '#project-' + active.getAttribute('data-project-panel'));
        } else if (location.hash.indexOf('#project-') === 0) {
          history.replaceState(null, '', location.pathname + location.search);
        }
      }

      function openProjectOverlay(name, trigger) {
        var overlay = byName[name];
        if (!overlay) return;
        if (active && active !== overlay) {
          overlayStack.push(active);
          active.classList.remove('is-open');
          active.dispatchEvent(new Event('po:closed'));
        } else if (!active) {
          lastTrigger = trigger || null;
        }
        active = overlay;
        overlay.scrollTop = 0;
        overlay.classList.add('is-open');
        if (bottomBar) bottomBar.classList.add('is-open');
        document.documentElement.classList.add('overlay-locked');
        overlay.setAttribute('tabindex', '-1');
        overlay.focus({ preventScroll: true });
        updateScrollProgress();
        overlay.dispatchEvent(new Event('po:opened'));
        syncHash();
      }

      function closeProjectOverlay() {
        if (active) {
          active.classList.remove('is-open');
          active.dispatchEvent(new Event('po:closed'));
        }
        if (overlayStack.length) {
          active = overlayStack.pop();
          active.scrollTop = active.scrollTop;
          active.classList.add('is-open');
          if (bottomBar) bottomBar.classList.add('is-open');
          active.setAttribute('tabindex', '-1');
          active.focus({ preventScroll: true });
          updateScrollProgress();
          active.dispatchEvent(new Event('po:opened'));
          syncHash();
          return;
        }
        active = null;
        if (bottomBar) bottomBar.classList.remove('is-open');
        document.documentElement.classList.remove('overlay-locked');
        if (lastTrigger && typeof lastTrigger.focus === 'function') {
          lastTrigger.focus({ preventScroll: true });
        }
        syncHash();
      }

      document.querySelectorAll('.proj-tile[data-project]').forEach(function (tile) {
        var name = tile.getAttribute('data-project');
        tile.addEventListener('click', function () {
          openProjectOverlay(name, tile);
        });
        tile.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openProjectOverlay(name, tile);
          }
        });
      });

      // "Next project" card at the bottom of every project page, cycling
      // through this fixed order. Built from the matching tile's own
      // image/name rather than duplicating that data, same idea as the
      // .po-hero reuse above.
      // cad-projects (the hub) is deliberately left out: it doesn't get its
      // own "next project" card, and rc-rover's card points straight at
      // Zekrom instead of the hub in between.
      var projectOrder = [
        'sharkninja', 'solar-car', 'keyak-lab', 'autonomous-rover',
        'rc-drone', 'rc-rover', 'zekrom', 'ice-cream-cow-robot'
      ];
      projectOrder.forEach(function (name, i) {
        var overlay = byName[name];
        if (!overlay) return;
        var nextName = projectOrder[(i + 1) % projectOrder.length];
        var nextTile = document.querySelector('.proj-tile[data-project="' + nextName + '"]');
        var main = overlay.querySelector('.po-main');
        if (!nextTile || !main) return;
        var nextImg = nextTile.querySelector('.proj-tile-img');
        var nextTagEls = nextTile.querySelectorAll('.proj-tile-tags .tag');
        if (!nextImg || !nextImg.getAttribute('src')) return;

        var link = document.createElement('a');
        link.className = 'po-next';
        link.href = '#project-' + nextName;

        var label = document.createElement('span');
        label.className = 'po-next-label';
        label.textContent = 'Next project';

        var media = document.createElement('div');
        media.className = 'po-next-media';

        var img = document.createElement('img');
        img.src = nextImg.getAttribute('src');
        img.alt = '';

        var tags = document.createElement('div');
        tags.className = 'po-next-tags';
        nextTagEls.forEach(function (t) { tags.appendChild(t.cloneNode(true)); });

        media.appendChild(img);
        media.appendChild(tags);
        link.appendChild(label);
        link.appendChild(media);
        main.appendChild(link);

        link.addEventListener('click', function (e) {
          e.preventDefault();
          openProjectOverlay(nextName, link);
        });
      });

      if (backBtn) backBtn.addEventListener('click', closeProjectOverlay);

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && active) closeProjectOverlay();
      });

      // Logo/name and the work/projects/about nav links: these all just
      // point at a plain #section hash on the home page. If a project
      // overlay (or a stack of nested ones) is open, that hash change
      // used to happen invisibly behind it — the overlay stayed put since
      // only "back"/Escape actually closed overlays. Now they close the
      // full stack first and land on the right section instead of just
      // jumping the hash behind an overlay that never moves.
      var homeNavLinks = document.querySelectorAll('.logo, .nav-links > a[href^="#"]');
      homeNavLinks.forEach(function (a) {
        a.addEventListener('click', function (e) {
          if (!active) return;
          e.preventDefault();
          var targetId = a.getAttribute('href').slice(1);
          while (active) closeProjectOverlay();
          var target = targetId && targetId !== 'top' ? document.getElementById(targetId) : null;
          if (target) {
            target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
          }
        });
      });

      // Restore whichever overlay the URL points at on load (set by
      // syncHash above), so refreshing a project page stays on that page
      // instead of dropping back to home. Walks up through parent tiles
      // first (e.g. Zekrom lives inside the CAD Projects hub) so the back
      // button/stack ends up exactly like normal click-through navigation.
      if (location.hash.indexOf('#project-') === 0) {
        var restoreName = location.hash.slice('#project-'.length);
        var chain = [];
        var cursor = restoreName;
        while (cursor && byName[cursor] && chain.indexOf(cursor) === -1) {
          chain.unshift(cursor);
          var parentTile = document.querySelector('.proj-tile[data-project="' + cursor + '"]');
          var parentOverlay = parentTile ? parentTile.closest('.project-overlay[data-project-panel]') : null;
          cursor = parentOverlay ? parentOverlay.getAttribute('data-project-panel') : null;
        }
        chain.forEach(function (n) { openProjectOverlay(n); });
      }
    })();

    // Footer clock (Los Angeles/Orange County, Pacific time)
    var clockEls = document.querySelectorAll('.js-clock');
    function tick() {
      try {
        var now = new Date();
        var parts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Los_Angeles',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).format(now);
        clockEls.forEach(function (el) { el.textContent = parts; });
      } catch (e) { /* leave placeholder */ }
    }
    tick();
    setInterval(tick, 1000);
  })();
