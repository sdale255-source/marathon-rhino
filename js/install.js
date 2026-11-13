// Marathon Macaw — "Add to Home Screen" helper.
//
// Used in two places:
//   1. /install/ — the page the QR code opens. Shows the right steps for the
//      visitor's phone and browser.
//   2. marathon_rhino.html — shows a small "Install the app" banner to people
//      using the app in a phone browser. Tapping it opens the same steps as an
//      overlay, so they add the app page itself to their Home Screen.
//
// Never shows anything inside the iPhone (Capacitor) app or once the app is
// already running from the Home Screen.
(function () {
  'use strict';

  var ua = navigator.userAgent || '';
  var DISMISS_KEY = 'mr_install_banner_dismissed';
  var DISMISS_DAYS = 14;
  var ICON = '/icons/icon-192.png';
  var deferredPrompt = null;   // Android / desktop Chrome install prompt
  var renderers = [];          // guides on screen, redrawn if the prompt arrives late

  // ---- Detection ------------------------------------------------------------
  function isNativeApp() {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  }
  function isStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true;
  }
  function detect() {
    var iPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    var iOS = /iPhone|iPod/.test(ua) || iPad;
    var android = /Android/i.test(ua);
    var inApp = /FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|Line\/|Snapchat|Twitter|TikTok|musical_ly|Pinterest|GSA\//.test(ua);
    var browser = 'other';
    if (iOS) {
      if (inApp) browser = 'inapp';
      else if (/CriOS/.test(ua)) browser = 'chrome';
      else if (/FxiOS/.test(ua)) browser = 'firefox';
      else if (/EdgiOS/.test(ua)) browser = 'edge';
      else if (/Safari/.test(ua)) browser = 'safari';
      else browser = 'inapp';
    } else if (android) {
      if (inApp || /; wv\)/.test(ua)) browser = 'inapp';
      else if (/SamsungBrowser/.test(ua)) browser = 'samsung';
      else if (/Firefox/.test(ua)) browser = 'firefox';
      else if (/Chrome/.test(ua)) browser = 'chrome';
    } else if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) {
      browser = 'safari';
    }
    var m = ua.match(/Version\/(\d+)/);
    return {
      platform: iOS ? 'ios' : (android ? 'android' : 'desktop'),
      iPad: iPad,
      browser: browser,
      safariVersion: m ? parseInt(m[1], 10) : 0,
      mobile: iOS || android,
    };
  }

  // ---- Little icons used inside the steps -----------------------------------
  var SVG = {
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M8 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    vdots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
    page: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M6 12h12M8 17h8"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  };
  function chip(icon, label) {
    return '<span class="mri-chip">' + (icon ? '<span class="mri-ico">' + SVG[icon] + '</span>' : '') + (label || '') + '</span>';
  }

  // ---- What to tell each visitor --------------------------------------------
  function guideFor(d) {
    if (d.platform === 'ios') {
      if (d.browser === 'inapp') {
        return {
          intro: 'You\'re viewing this inside another app, which can\'t add apps to your Home Screen. Open this page in Safari first:',
          steps: [
            'Tap the ' + chip('dots') + ' or ' + chip('share') + ' button in this app\'s browser.',
            'Choose <b>Open in Safari</b> (or <b>Open in Browser</b>).',
            'Follow the steps that appear there.',
          ],
          copyLink: true,
        };
      }
      if (d.browser === 'chrome') {
        return { arrow: d.iPad ? null : 'top-right', steps: [
          'Tap the ' + chip('share') + ' button at the top right, next to the address bar.',
          'Scroll down and tap ' + chip('plus', 'Add to Home Screen') + '. You may need to tap <b>View More</b> first.',
          'Tap <b>Add</b>.',
        ] };
      }
      if (d.browser === 'firefox' || d.browser === 'edge') {
        return { steps: [
          'Tap the ' + chip(d.browser === 'firefox' ? 'menu' : 'dots') + ' menu button.',
          'Tap ' + chip('share', 'Share') + '.',
          'Tap ' + chip('plus', 'Add to Home Screen') + ', then <b>Add</b>.',
        ] };
      }
      // Safari
      if (d.safariVersion >= 26) {
        return { arrow: d.iPad ? null : 'bottom-left', steps: [
          'Tap the ' + chip('page') + ' button on the left side of the address bar.' +
            '<span class="mri-hint">On some iPhones it looks like ' + chip('dots') + ' instead.</span>',
          'Tap ' + chip('share', 'Share') + '.',
          'Scroll down and tap ' + chip('plus', 'Add to Home Screen') + '. You may need to tap <b>View More</b> first.',
          'Leave <b>Open as Web App</b> switched on and tap <b>Add</b>.',
        ] };
      }
      return { arrow: d.iPad ? null : 'bottom-center', steps: [
        'Tap the ' + chip('share') + ' button ' + (d.iPad ? 'at the top of the screen.' : 'at the bottom of the screen.'),
        'Scroll down and tap ' + chip('plus', 'Add to Home Screen') + '.',
        'Tap <b>Add</b>.',
      ] };
    }

    if (d.platform === 'android') {
      if (d.browser === 'inapp') {
        return {
          intro: 'You\'re viewing this inside another app. Open this page in Chrome first:',
          steps: [
            'Tap the ' + chip('vdots') + ' menu in this app\'s browser.',
            'Choose <b>Open in Chrome</b> (or <b>Open in browser</b>).',
            'Follow the steps that appear there.',
          ],
          copyLink: true,
        };
      }
      return {
        installButton: true,
        steps: [
          'Tap the ' + chip('vdots') + ' menu at the top right' + (d.browser === 'samsung' ? ' (bottom right in Samsung Internet)' : '') + '.',
          'Tap <b>Add to Home screen</b> or <b>Install app</b>.',
          'Tap <b>Install</b>.',
        ],
        stepsLabel: 'Or do it from the browser menu:',
      };
    }

    // Desktop
    var g = { qr: true, installButton: true };
    if (d.browser === 'safari') {
      g.desktopSteps = 'On a Mac with Safari, you can also choose <b>File → Add to Dock</b>.';
    }
    return g;
  }

  // ---- Rendering ------------------------------------------------------------
  function renderGuide(container, opts) {
    opts = opts || {};
    var d = detect();
    var g = guideFor(d);
    var html = '';
    if (!opts.hideHeader) {
      html += '<div class="mri-head"><img src="' + ICON + '" alt="" class="mri-appicon">' +
        '<div><h2 class="mri-title">Install Marathon Macaw</h2>' +
        '<p class="mri-sub">' + (g.qr ? 'Put it on your phone\'s Home Screen — no App Store needed.' : 'Free, takes about 20 seconds, no App Store needed.') + '</p></div></div>';
    }
    if (isStandalone()) {
      html += '<p class="mri-intro">Marathon Macaw is already installed on this device. 🎉</p>';
      container.innerHTML = html;
      return;
    }
    if (g.qr) {
      html += '<div class="mri-qr-row"><div class="mri-qr" data-mri-qr></div>' +
        '<div><p class="mri-intro"><b>Scan with your phone\'s camera</b>, then follow the steps that appear.</p>' +
        '<p class="mri-small">Or visit <b>marathonrhino.run/install</b> on your phone.</p></div></div>';
    }
    if (g.intro) html += '<p class="mri-intro">' + g.intro + '</p>';
    if (g.installButton && deferredPrompt) {
      html += '<button type="button" class="mri-btn" data-mri-install>' + (g.qr ? 'Install on this computer' : 'Install Marathon Macaw') + '</button>';
    }
    if (g.steps) {
      if (g.installButton && deferredPrompt && g.stepsLabel) html += '<p class="mri-small mri-or">' + g.stepsLabel + '</p>';
      html += '<ol class="mri-steps">' + g.steps.map(function (s, i) {
        return '<li><span class="mri-num">' + (i + 1) + '</span><div>' + s + '</div></li>';
      }).join('') + '</ol>';
    }
    if (g.desktopSteps) html += '<p class="mri-small">' + g.desktopSteps + '</p>';
    if (g.copyLink) html += '<button type="button" class="mri-btn mri-btn-ghost" data-mri-copy>Copy link</button>';
    container.innerHTML = html;

    var qrSlot = container.querySelector('[data-mri-qr]');
    if (qrSlot) {
      var src = document.getElementById('mr-install-qr');
      if (src) qrSlot.innerHTML = src.innerHTML;
    }
    var installBtn = container.querySelector('[data-mri-install]');
    if (installBtn) installBtn.addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () { deferredPrompt = null; rerender(); });
    });
    var copyBtn = container.querySelector('[data-mri-copy]');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var url = 'https://marathonrhino.run/install/';
      var done = function () { copyBtn.textContent = 'Link copied — paste it into Safari'; };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { prompt('Copy this link:', url); });
      else prompt('Copy this link:', url);
    });
    if (renderers.indexOf(container) === -1) { renderers.push(container); container._mriOpts = opts; }
    return g;
  }
  function rerender() {
    renderers.forEach(function (c) { if (document.body.contains(c)) renderGuide(c, c._mriOpts); });
  }

  // ---- Overlay (used inside the app) ----------------------------------------
  var overlayEl = null, arrowEl = null;
  function openOverlay() {
    injectStyles();
    closeOverlay();
    overlayEl = document.createElement('div');
    overlayEl.className = 'mri-overlay';
    overlayEl.innerHTML = '<div class="mri-sheet" role="dialog" aria-modal="true" aria-label="Install Marathon Macaw">' +
      '<button type="button" class="mri-close" aria-label="Close">&times;</button><div class="mri-body"></div></div>';
    document.body.appendChild(overlayEl);
    var g = renderGuide(overlayEl.querySelector('.mri-body'));
    overlayEl.addEventListener('click', function (e) { if (e.target === overlayEl) closeOverlay(); });
    overlayEl.querySelector('.mri-close').addEventListener('click', closeOverlay);
    if (g && g.arrow) showArrow(g.arrow);
  }
  // Bouncing arrow pointing at the browser button the first step mentions.
  function showArrow(dir) {
    injectStyles();
    if (arrowEl) arrowEl.remove();
    arrowEl = document.createElement('div');
    arrowEl.className = 'mri-arrow mri-arrow-' + dir;
    arrowEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
      (dir === 'top-right' ? '<path d="M12 20V4M5 11l7-7 7 7"/>' : '<path d="M12 4v16M5 13l7 7 7-7"/>') + '</svg>';
    document.body.appendChild(arrowEl);
  }
  function closeOverlay() {
    if (overlayEl) { overlayEl.remove(); overlayEl = null; }
    if (arrowEl) { arrowEl.remove(); arrowEl = null; }
  }

  // ---- Banner (used inside the app) -----------------------------------------
  var bannerEl = null;
  function recentlyDismissed() {
    try {
      var t = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10);
      return t && (Date.now() - t) < DISMISS_DAYS * 864e5;
    } catch (e) { return false; }
  }
  function hideBanner() { if (bannerEl) { bannerEl.remove(); bannerEl = null; } }
  function maybeShowBanner() {
    if (isNativeApp() || isStandalone() || bannerEl) return;
    var d = detect();
    if (!d.mobile || recentlyDismissed()) return;
    injectStyles();
    bannerEl = document.createElement('div');
    bannerEl.className = 'mri-banner';
    bannerEl.innerHTML = '<img src="' + ICON + '" alt="">' +
      '<div class="mri-banner-text"><b>Get the Marathon Macaw app</b><span>Add it to your Home Screen</span></div>' +
      '<button type="button" class="mri-banner-go">Install</button>' +
      '<button type="button" class="mri-banner-x" aria-label="Not now">&times;</button>';
    document.body.appendChild(bannerEl);
    bannerEl.querySelector('.mri-banner-go').addEventListener('click', openOverlay);
    bannerEl.querySelector('.mri-banner-x').addEventListener('click', function () {
      try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
      hideBanner();
    });
  }

  // ---- Styles ---------------------------------------------------------------
  var stylesDone = false;
  function injectStyles() {
    if (stylesDone) return; stylesDone = true;
    var css = '' +
      '.mri-head{display:flex;align-items:center;gap:14px;margin:0 0 16px}' +
      '.mri-appicon{width:56px;height:56px;border-radius:13px;box-shadow:0 4px 14px rgba(0,0,0,.18);flex:none}' +
      '.mri-title{margin:0;font-size:20px;line-height:1.2;color:#042C53;font-weight:800}' +
      '.mri-sub{margin:2px 0 0;font-size:14px;color:#5a6a7e}' +
      '.mri-intro{margin:0 0 12px;font-size:15px;color:#1a2a3a;line-height:1.5}' +
      '.mri-hint{display:block;margin-top:3px;font-size:13px;color:#5a6a7e}' +
      '.mri-small{margin:8px 0 0;font-size:13px;color:#5a6a7e;line-height:1.5}' +
      '.mri-or{margin:16px 0 4px}' +
      '.mri-steps{list-style:none;margin:4px 0 0;padding:0}' +
      '.mri-steps li{display:flex;gap:12px;align-items:flex-start;padding:11px 0;border-top:1px solid #e1e8f0;font-size:15px;line-height:1.55;color:#1a2a3a}' +
      '.mri-steps li:first-child{border-top:0}' +
      '.mri-num{flex:none;width:26px;height:26px;border-radius:50%;background:#F5B800;color:#042C53;font-weight:800;font-size:13px;display:grid;place-items:center;margin-top:1px}' +
      '.mri-chip{display:inline-flex;align-items:center;gap:5px;background:#eef3f8;border:1px solid #d6e0ea;border-radius:8px;padding:1px 7px;font-weight:700;color:#042C53;white-space:nowrap;vertical-align:middle}' +
      '.mri-ico{display:inline-flex;width:16px;height:16px;color:#185FA5}.mri-ico svg{width:16px;height:16px}' +
      '.mri-btn{display:block;width:100%;margin:6px 0 4px;padding:13px 18px;border:0;border-radius:999px;background:#F5B800;color:#042C53;font:inherit;font-weight:800;font-size:16px;cursor:pointer}' +
      '.mri-btn-ghost{background:#fff;color:#042C53;border:2px solid #d6e0ea;margin-top:14px}' +
      '.mri-qr-row{display:flex;gap:18px;align-items:center;margin:4px 0 8px}' +
      '.mri-qr{flex:none;width:168px;height:168px;padding:8px;background:#fff;border:1px solid #e1e8f0;border-radius:14px}.mri-qr svg{width:100%;height:100%;display:block}' +
      '@media (max-width:480px){.mri-qr-row{flex-direction:column;text-align:center}}' +
      '.mri-overlay{position:fixed;inset:0;z-index:100000;background:rgba(4,44,83,.55);display:flex;align-items:flex-end;justify-content:center;padding:12px 12px calc(env(safe-area-inset-bottom,0px) + 72px);font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif}' +
      '.mri-sheet{position:relative;background:#fff;border-radius:20px;max-width:440px;width:100%;max-height:calc(100% - 20px);overflow-y:auto;padding:22px 20px 16px;box-shadow:0 20px 60px rgba(0,0,0,.35)}' +
      '.mri-close{position:absolute;top:8px;right:10px;width:36px;height:36px;border:0;background:none;font-size:28px;line-height:1;color:#5a6a7e;cursor:pointer}' +
      '.mri-arrow{position:fixed;z-index:100001;width:44px;height:44px;color:#F5B800;filter:drop-shadow(0 2px 6px rgba(0,0,0,.4));pointer-events:none;animation:mri-bob 1s ease-in-out infinite}' +
      '.mri-arrow svg{width:100%;height:100%}' +
      '.mri-arrow-bottom-left{left:92px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px)}' +
      '.mri-arrow-bottom-center{left:calc(50% - 22px);bottom:calc(env(safe-area-inset-bottom,0px) + 10px)}' +
      '.mri-arrow-top-right{right:14px;top:calc(env(safe-area-inset-top,0px) + 6px);animation-name:mri-bob-up}' +
      '@keyframes mri-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}' +
      '@keyframes mri-bob-up{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}' +
      '.mri-banner{position:fixed;left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 10px);z-index:99000;display:flex;align-items:center;gap:10px;background:#042C53;color:#fff;border-radius:16px;padding:10px 8px 10px 10px;box-shadow:0 10px 30px rgba(0,0,0,.3);font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;max-width:520px;margin:0 auto}' +
      '.mri-banner img{width:40px;height:40px;border-radius:10px;flex:none}' +
      '.mri-banner-text{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.25}' +
      '.mri-banner-text b{font-size:14px}.mri-banner-text span{font-size:12px;color:rgba(255,255,255,.75)}' +
      '.mri-banner-go{flex:none;border:0;border-radius:999px;background:#F5B800;color:#042C53;font:inherit;font-weight:800;font-size:14px;padding:8px 16px;cursor:pointer}' +
      '.mri-banner-x{flex:none;border:0;background:none;color:rgba(255,255,255,.7);font-size:24px;line-height:1;width:32px;height:32px;cursor:pointer}';
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---- Wire-up --------------------------------------------------------------
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    rerender();
  });
  window.addEventListener('appinstalled', function () { deferredPrompt = null; hideBanner(); closeOverlay(); });

  window.MRInstall = {
    detect: detect,
    isStandalone: isStandalone,
    renderGuide: function (el, opts) { injectStyles(); return renderGuide(el, opts); },
    openOverlay: openOverlay,
    showArrow: showArrow,
    maybeShowBanner: maybeShowBanner,
  };
})();
