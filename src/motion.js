;(() => {
  const root = document.documentElement,
    preference = (window.__speReducedMotion ??= matchMedia(
      '(prefers-reduced-motion: reduce)',
    ))
  let observer
  const targets = [
    ...document.querySelectorAll(
      'main>.section,main>.timeline-row,main>.membership-band,main>.trust',
    ),
  ]
  function release() {
    observer?.disconnect()
    targets.forEach((e) => e.classList.remove('reveal-pending'))
    document
      .querySelectorAll('.hero-enter,.stamp-enter')
      .forEach((e) => e.classList.remove('hero-enter', 'stamp-enter'))
    root.classList.remove('motion-ready')
  }
  function start() {
    release()
    if (preference.matches || window.__speMotionBoot?.expired) return
    root.classList.add('motion-ready')
    const hero = document.querySelector(
      '.home-hero,.page-head,.exploration-hero',
    )
    const parts = hero
      ? [...hero.querySelectorAll('h1,.lead,.actions,.surface,.ascii-panel')]
          .filter((e, i, a) => !a.some((p) => p !== e && p.contains(e)))
          .slice(0, 4)
      : []
    parts.forEach((e, i) => {
      e.style.setProperty('--enter-delay', `${i * 40}ms`)
      e.classList.add('hero-enter')
      e.addEventListener(
        'animationend',
        () => e.classList.remove('hero-enter'),
        { once: true },
      )
    })
    const stamp = (e) =>
      e.querySelectorAll('.stamp').forEach((s) => {
        s.classList.add('stamp-enter')
        s.addEventListener(
          'animationend',
          () => s.classList.remove('stamp-enter'),
          { once: true },
        )
      })
    if (hero) stamp(hero)
    if (!('IntersectionObserver' in window)) return
    try {
      observer = new IntersectionObserver(
        (entries) =>
          entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) {
              target.classList.remove('reveal-pending')
              stamp(target)
              observer.unobserve(target)
            }
          }),
        { threshold: 0, rootMargin: '0px 0px -24px 0px' },
      )
      targets.forEach((e) => {
        e.classList.add('reveal-target')
        if (e.getBoundingClientRect().top > innerHeight + 12) {
          e.classList.add('reveal-pending')
          observer.observe(e)
        }
      })
    } catch {
      release()
    }
  }
  preference.addEventListener('change', start)
  start()
  document.addEventListener('focusin', (e) =>
    e.target.closest('.reveal-pending')?.classList.remove('reveal-pending'),
  )
  window.addEventListener('beforeprint', release)
  window.addEventListener('hashchange', () =>
    targets.forEach((e) => e.classList.remove('reveal-pending')),
  )
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') release()
  })
  document.querySelectorAll('.toolbar').forEach((toolbar) => {
    const marker = document.createElement('span')
    marker.className = 'chip-indicator'
    marker.setAttribute('aria-hidden', 'true')
    toolbar.append(marker)
    const locate = () => {
      const active = toolbar.querySelector('[aria-pressed=true]')
      if (!active || preference.matches) {
        marker.style.opacity = '0'
        return
      }
      const r = active.getBoundingClientRect(),
        parent = toolbar.getBoundingClientRect()
      marker.style.transform = `translate(${r.left - parent.left}px,${r.bottom - parent.top + 4}px) scaleX(${r.width})`
      marker.style.opacity = '1'
    }
    let measurement = 0
    const schedule = () => {
      cancelAnimationFrame(measurement)
      measurement = requestAnimationFrame(locate)
    }
    new MutationObserver(schedule).observe(toolbar, {
      attributes: true,
      attributeFilter: ['aria-pressed'],
      subtree: true,
      childList: true,
    })
    preference.addEventListener('change', schedule)
    if ('ResizeObserver' in window)
      new ResizeObserver(schedule).observe(toolbar)
    document.fonts?.ready.then(schedule)
    schedule()
  })
})()
;(() => {
  const preference = (window.__speReducedMotion ??= matchMedia(
    '(prefers-reduced-motion: reduce)',
  ))
  const glyphs = '.:+x#%'
  const random = () => glyphs[Math.floor(Math.random() * glyphs.length)]
  let observer
  function observe() {
    observer?.disconnect()
    if (preference.matches || !('IntersectionObserver' in window)) return
    observer = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return
          target.classList.add('ascii-divider-enter')
          setTimeout(() => target.classList.remove('ascii-divider-enter'), 240)
          observer.unobserve(target)
        }),
      { threshold: 0.12 },
    )
    document
      .querySelectorAll('.section-title')
      .forEach((element) => observer.observe(element))
  }
  preference.addEventListener('change', observe)
  observe()
  document
    .querySelectorAll('.button,.inline-link,.rule-link')
    .forEach((button) => {
      const svg = button.querySelector('svg')
      if (!svg) return
      const arrow = document.createElement('span'),
        layer = document.createElement('span')
      arrow.className = 'ascii-arrow'
      arrow.setAttribute('aria-hidden', 'true')
      layer.className = 'ascii-arrow-glyph'
      layer.textContent = '→'
      svg.before(arrow)
      arrow.append(svg, layer)
      let timer = 0,
        end = 0
      const reset = () => {
        clearInterval(timer)
        clearTimeout(end)
        layer.textContent = '→'
      }
      const play = () => {
        reset()
        if (preference.matches) return
        timer = setInterval(() => (layer.textContent = random()), 30)
        end = setTimeout(reset, 180)
      }
      button.addEventListener('pointerenter', (event) => {
        if (
          event.pointerType !== 'touch' &&
          matchMedia('(hover: hover) and (pointer: fine)').matches
        )
          play()
      })
      button.addEventListener('pointerleave', reset)
      button.addEventListener('blur', reset)
      preference.addEventListener('change', reset)
    })
  document.addEventListener('spe:loading', (event) => {
    const button = event.target,
      layer = button.querySelector('.ascii-arrow-glyph')
    if (!layer || preference.matches) return
    let index = 0
    const timer = setInterval(
      () => (layer.textContent = ['|', '/', '−', '\\'][index++ % 4]),
      35,
    )
    setTimeout(() => {
      clearInterval(timer)
      layer.textContent = '→'
    }, 160)
  })
})()
;(() => {
  const preference = (window.__speReducedMotion ??= matchMedia(
    '(prefers-reduced-motion: reduce)',
  ))
  const running = new Map(),
    seen = new WeakSet(),
    stats = (window.__speMotion = { text: [], images: [], activeImages: 0 })
  let imageObserver,
    frame = 0,
    textObserver,
    textEpoch = 0,
    fontTimer = 0
  const automated = () =>
    window.__speForceImageFx !== true &&
    (navigator.webdriver === true || /HeadlessChrome/i.test(navigator.userAgent))
  const enabled = () =>
    !preference.matches &&
    !automated() &&
    !window.__speMotionBoot?.expired &&
    'IntersectionObserver' in window
  const alphabet = (character) =>
    /[0-9]/.test(character)
      ? '0123456789'
      : character === character.toUpperCase()
        ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        : 'abcdefghijklmnopqrstuvwxyz'

  const measure = document.createElement('canvas').getContext('2d'),
    pools = new Map()
  function settle(element) {
    const item = running.get(element)
    if (!item) return
    clearTimeout(item.safety)
    item.sources.forEach(({ wrapper, node }) => wrapper.replaceWith(node))
    item.layer.remove()
    element.dataset.asciiState = 'final'
    running.delete(element)
  }
  function tick(now) {
    frame = 0
    const positions = [...running].map(([element, item]) => ({
      element,
      item,
      rect: element.getBoundingClientRect(),
    }))
    positions.forEach(({ item, element, rect }) => {
      if (!element.isConnected || element.textContent !== item.original) {
        settle(element)
        return
      }
      const progress = Math.min(1, (now - item.start) / item.duration)
      if (progress === 1) {
        settle(element)
        return
      }
      item.layer.style.transform = `translate(${rect.left + scrollX}px,${rect.top + scrollY}px)`
      const head = Math.floor(progress * (item.chars.length + 4)),
        resolved = Math.max(0, head - 4)
      item.chars.forEach(({ span, character, pool }, index) => {
        const visible =
          index < resolved || (index < head && /[a-zA-Z0-9]/.test(character))
        span.style.opacity = visible ? '1' : '0'
        span.textContent =
          index < resolved
            ? character
            : index < head
              ? pool[Math.floor(Math.random() * pool.length)]
              : ''
      })
    })
    if (running.size) frame = requestAnimationFrame(tick)
  }
  function stream(element) {
    element.classList.remove('stream-preparing')
    if (!enabled() || seen.has(element)) return
    seen.add(element)
    const original = element.textContent,
      box = element.getBoundingClientRect(),
      layer = document.createElement('span'),
      sources = [],
      chars = []
    layer.className = 'response-layer'
    layer.setAttribute('aria-hidden', 'true')
    layer.style.cssText = `left:0;top:0;transform:translate(${box.left + scrollX}px,${box.top + scrollY}px);width:${box.width}px;height:${box.height}px`
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) =>
          node.textContent.trim() &&
          !node.parentElement.closest('svg,[aria-hidden="true"]')
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT,
      }),
      nodes = []
    while (walker.nextNode()) nodes.push(walker.currentNode)
    nodes.forEach((node) => {
      const font = getComputedStyle(node.parentElement)
      let offset = 0
      for (const character of node.textContent) {
        const range = document.createRange()
        range.setStart(node, offset)
        offset += character.length
        range.setEnd(node, offset)
        const r = range.getBoundingClientRect()
        if (!character.trim()) continue
        const span = document.createElement('span')
        span.className = 'response-glyph'
        span.style.cssText = `left:${r.left - box.left}px;top:${r.top - box.top}px;width:${r.width}px;height:${r.height}px;line-height:${r.height}px`
        for (const property of [
          'fontFamily',
          'fontSize',
          'fontWeight',
          'fontStyle',
          'fontStretch',
          'fontVariant',
          'textTransform',
          'letterSpacing',
          'color',
        ])
          span.style[property] = font[property]
        const face = `${font.fontStyle} ${font.fontWeight} ${font.fontSize} ${font.fontFamily}`,
          key =
            face +
            '|' +
            font.letterSpacing +
            '|' +
            font.textTransform +
            '|' +
            r.width +
            '|' +
            alphabet(character)
        let pool = pools.get(key)
        if (!pool) {
          if (measure) {
            measure.font = face
            pool = [...alphabet(character)]
              .filter(
                (c) =>
                  measure.measureText(
                    font.textTransform === 'uppercase'
                      ? c.toUpperCase()
                      : font.textTransform === 'lowercase'
                        ? c.toLowerCase()
                        : c,
                  ).width +
                    (parseFloat(font.letterSpacing) || 0) <=
                  r.width + 0.25,
              )
              .join('')
          }
          pool ||= character
          pools.set(key, pool)
        }
        layer.append(span)
        chars.push({ span, character, pool })
      }
      const wrapper = document.createElement('span')
      wrapper.className = 'stream-source'
      node.before(wrapper)
      wrapper.append(node)
      sources.push({ wrapper, node })
    })
    if (!chars.length) return
    document.body.append(layer)
    const duration = Math.min(900, Math.max(160, chars.length * 16))
    running.set(element, {
      layer,
      sources,
      chars,
      original,
      duration,
      start: performance.now(),
      safety: setTimeout(() => settle(element), 920),
    })
    element.dataset.asciiState = 'streaming'
    stats.text.push({ text: original.trim(), duration })
    if (!frame) frame = requestAnimationFrame(tick)
  }
  const candidates = [
    ...new Set(
      [
        ...document.querySelectorAll(
          'h1,h2,h3,.stamp,.hero-origin,.exploration-intro>.meta,.origin,.meta>span,.section-title>.meta,.newsletter-copy>.mono',
        ),
      ].map((e) => (e.matches('h1,h2,h3') ? e.querySelector('a') || e : e)),
    ),
  ]
    .filter(
      (e) =>
        !e.closest('.ascii-panel') &&
        !e.querySelector('.stamp') &&
        !e.closest(
          'button,input,select,textarea,[aria-live],[role="status"],[role="alert"]',
        ),
    )
    .filter(
      (e, _, all) => !all.some((parent) => parent !== e && parent.contains(e)),
    )
  function stopText() {
    textEpoch++
    clearTimeout(fontTimer)
    textObserver?.disconnect()
    running.forEach((_, element) => settle(element))
    cancelAnimationFrame(frame)
    frame = 0
    candidates.forEach((e) => e.classList.remove('stream-preparing'))
  }
  function watchText() {
    stopText()
    if (!enabled()) return
    const epoch = textEpoch
    candidates
      .filter((e) => !seen.has(e))
      .forEach((e) => e.classList.add('stream-preparing'))
    fontTimer = setTimeout(stopText, 1800)
    Promise.resolve(document.fonts?.ready)
      .then(() => {
        if (epoch !== textEpoch) return
        clearTimeout(fontTimer)
        if (!enabled()) {
          stopText()
          return
        }
        textObserver = new IntersectionObserver(
          (entries) =>
            entries.forEach(({ target, isIntersecting }) => {
              if (!isIntersecting) return
              stream(target)
              textObserver.unobserve(target)
            }),
          { threshold: 0.05 },
        )
        candidates
          .filter((e) => !seen.has(e))
          .forEach((e) => textObserver.observe(e))
      })
      .catch(stopText)
  }
  // ---- In-view image reveal -------------------------------------------
  // Every image that enters the viewport gets its own Libraries.dev
  // `pixels-mechanic` mosaic. All of them share one WebGL renderer inside
  // img-fx and render in the same frame loop, so reveals run concurrently:
  // nothing waits for a previous image. The dissolve itself is the library's
  // real GPU reveal, just tuned to REVEAL_SECONDS (stock is ~2.6s).
  const REVEAL_SECONDS = 0.85,
    FRAME_RATE = 30,
    PREWARM_MARGIN = '320px 0px',
    READY_GRACE = 320
  const images = [...document.querySelectorAll('main img')].filter(
      (img) => !img.closest('.chapter,.chapter-emblem,.org-chart'),
    ),
    revealed = new WeakSet(),
    active = new Map(),
    inView = new Set(),
    roots = new Set()
  let capable, modules, prewarmObserver

  function imageEnabled() {
    if (
      !enabled() ||
      !('ResizeObserver' in window) ||
      !('MutationObserver' in window)
    )
      return false
    if (capable === undefined) {
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl2', {
          failIfMajorPerformanceCaveat: true,
        })
        const info = gl?.getExtension('WEBGL_debug_renderer_info')
        const renderer = info
          ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL)
          : ''
        capable =
          !!gl &&
          !/swiftshader|llvmpipe|softpipe|software rasterizer|software renderer|basic render driver/i.test(
            renderer,
          )
        gl?.getExtension('WEBGL_lose_context')?.loseContext()
      } catch {
        capable = false
      }
    }
    return capable || window.__speForceImageFx === true
  }
  function loadImages() {
    return (modules ??= Promise.all([
      import('react'),
      import('react-dom/client'),
      import('img-fx'),
    ])
      .then((loaded) => {
        const fx = loaded[2]
        // Tune once: shorter dissolve, smoother frame rate, cheap DPR.
        fx.setMaxDpr(1)
        fx.setFrameRate(FRAME_RATE)
        Object.values(fx.PRESETS).forEach((preset) =>
          Object.values(preset.modes).forEach((mode) => {
            const reveal = mode.revealConfig
            reveal.duration = reveal.pixDuration = reveal.dotDuration =
              REVEAL_SECONDS
          }),
        )
        return loaded
      })
      .catch((error) => {
        stopImages('unavailable')
        throw error
      }))
  }
  function finishImage(img, state = 'final') {
    const job = active.get(img)
    if (job) {
      job.done = true
      revealed.add(img)
      clearTimeout(job.timer)
      clearTimeout(job.poll)
      clearTimeout(job.grace)
      active.delete(img)
      stats.activeImages--
      // Real photo goes in under the overlay first, then the overlay fades.
      img.classList.remove('stream-image-pending', 'stream-image-enter')
      if (job.host) {
        job.host.classList.add('imgfx-leaving')
        job.pause?.()
        setTimeout(() => {
          job.host.remove()
          job.root?.unmount()
          roots.delete(job)
        }, 160)
      }
      stats.images.push({
        src: img.src,
        state,
        native: !!job.triggered && !!job.host,
        revealStart: job.triggered,
        completed: performance.now(),
        preparation: Math.round(
          (job.triggered || performance.now()) - job.start,
        ),
        duration: job.triggered
          ? Math.round(performance.now() - job.triggered)
          : 0,
      })
      imageObserver?.unobserve(img)
      inView.delete(img)
    }
    img.classList.remove('stream-image-pending', 'stream-image-enter')
    img.dataset.streamImage = state
  }
  function stopImages(state = 'static') {
    imageObserver?.disconnect()
    prewarmObserver?.disconnect()
    inView.clear()
    images.forEach((img) => {
      revealed.add(img)
      finishImage(img, state)
    })
  }
  // Start one image's reveal. Called for every in-view image at once.
  function fire(job) {
    if (job.done || job.triggered) return
    const { img, host } = job
    if (!imageEnabled() || document.hidden) return finishImage(img, 'static')
    job.triggered = performance.now()
    clearTimeout(job.grace)
    clearTimeout(job.timer)
    img.dataset.streamImage = 'revealing'
    if (job.ready && job.trigger) {
      const rect = img.getBoundingClientRect()
      host.style.left = rect.left + scrollX + 'px'
      host.style.top = rect.top + scrollY + 'px'
      host.classList.add('imgfx-live')
      job.trigger()
      job.timer = setTimeout(
        () => finishImage(img),
        REVEAL_SECONDS * 1000 + 700,
      )
    } else {
      // Mosaic not warm yet: a concurrent clean fade, never a queue.
      job.skipped = true
      job.pause?.()
      if (host) host.hidden = true
      img.classList.remove('stream-image-pending')
      img.classList.add('stream-image-enter')
      job.timer = setTimeout(() => finishImage(img), 460)
    }
  }
  function pumpImages() {
    if (!images.length || !imageEnabled() || document.hidden) return
    inView.forEach((img) => {
      if (revealed.has(img)) return
      prepareImage(img)
      const job = active.get(img)
      if (!job || job.triggered) return
      if (job.ready) fire(job)
      else if (!job.grace) job.grace = setTimeout(() => fire(job), READY_GRACE)
    })
  }
  function prepareImage(img) {
    if (active.has(img)) return
    void revealImage(img)
  }
  async function revealImage(img) {
    if (revealed.has(img) || !imageEnabled()) return
    const job = { img, start: performance.now(), done: false }
    active.set(img, job)
    stats.activeImages++
    try {
      const [react, dom, fx] = await loadImages()
      await img.decode()
      if (job.done || job.skipped) return
      if (!imageEnabled() || document.hidden) return finishImage(img, 'static')
      const rect = img.getBoundingClientRect()
      if (!rect.width || !rect.height) return finishImage(img, 'static')
      const React = react.default,
        style = getComputedStyle(img),
        host = document.createElement('div'),
        stage = document.createElement('div')
      job.host = host
      host.className = 'ascii-image-effect imgfx-reveal-host'
      host.setAttribute('aria-hidden', 'true')
      host.style.cssText = `left:${rect.left + scrollX}px;top:${rect.top + scrollY}px;width:${rect.width}px;height:${rect.height}px;border-radius:${style.borderRadius}`
      stage.className = 'ascii-image-stage'
      stage.style.setProperty('--fx-width', rect.width + 'px')
      stage.style.setProperty('--fx-height', rect.height + 'px')
      host.append(stage)
      document.body.append(host)
      img.dataset.streamImage = 'preparing'
      // A small canvas is plenty for a pixel mosaic and keeps many
      // concurrent reveals cheap; CSS scales it to the real box.
      const width = Math.min(120, rect.width),
        height = (width * rect.height) / rect.width
      function Picture() {
        const ref = React.useRef(null)
        const [paused, pause] = React.useState(false)
        job.pause = () => pause(true)
        React.useEffect(() => {
          job.trigger = () => ref.current?.triggerReveal({ hold: 'manual' })
        }, [])
        return React.createElement(
          fx.ImageGeneration,
          {
            ref,
            preset: 'pixels-mechanic',
            images: [img.currentSrc || img.src],
            revealInitialDelay: 0,
            paused,
            onCycle: ({ phase }) => {
              if (phase === 'visible' && job.triggered) finishImage(img)
            },
          },
          React.createElement('div', { style: { width, height } }),
        )
      }
      class Boundary extends React.Component {
        constructor(props) {
          super(props)
          this.state = { failed: false }
        }
        static getDerivedStateFromError() {
          return { failed: true }
        }
        componentDidCatch() {
          queueMicrotask(() => finishImage(img, 'unavailable'))
        }
        render() {
          return this.state.failed ? null : this.props.children
        }
      }
      job.root = dom.createRoot(stage)
      roots.add(job)
      job.root.render(
        React.createElement(Boundary, null, React.createElement(Picture)),
      )
      const ready = () => {
        if (job.done || job.skipped) return
        const shader = stage.querySelector('.image-gen-shader')
        let painted = false
        try {
          painted =
            shader?.width > 0 &&
            shader
              .getContext('2d')
              .getImageData(0, 0, shader.width, shader.height)
              .data.some((value, index) => index % 4 === 3 && value > 0)
        } catch {}
        if (!painted || !job.trigger) {
          job.poll = setTimeout(ready, 40)
          return
        }
        job.ready = true
        if (inView.has(img)) fire(job)
      }
      ready()
    } catch {
      finishImage(img, 'unavailable')
    }
  }
  function watchImages() {
    imageObserver?.disconnect()
    prewarmObserver?.disconnect()
    inView.clear()
    images.forEach((img) => finishImage(img))
    if (!images.length || !imageEnabled()) return
    images
      .filter((img) => !revealed.has(img))
      .forEach((img) => {
        img.classList.add('stream-image-pending')
        img.dataset.streamImage = 'pending'
      })
    imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) inView.add(target)
          else {
            inView.delete(target)
            // Scrolled past mid-reveal: show the photo, drop the overlay.
            if (active.get(target)?.triggered) finishImage(target, 'offscreen')
          }
        })
        pumpImages()
      },
      { threshold: 0.05 },
    )
    prewarmObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting && !revealed.has(target)) {
            prepareImage(target)
            prewarmObserver.unobserve(target)
          }
        }),
      { rootMargin: PREWARM_MARGIN, threshold: 0 },
    )
    images
      .filter((img) => !revealed.has(img))
      .forEach((img) => {
        prewarmObserver.observe(img)
        imageObserver.observe(img)
      })
  }
  preference.addEventListener('change', () => {
    watchText()
    watchImages()
  })
  watchText()
  watchImages()
  window.addEventListener('resize', () => {
    stopText()
    active.forEach((_, img) => finishImage(img, 'resized'))
  })
  window.addEventListener('beforeprint', () => {
    stopText()
    stopImages()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopText()
      active.forEach((_, img) => finishImage(img))
    } else pumpImages()
  })
  window.addEventListener('pagehide', () => {
    stopText()
    stopImages()
    roots.forEach((job) => job.root?.unmount())
  })

  document.addEventListener('keydown', stopText, { once: true })
  const boot = window.__speMotionBoot
  if (boot) {
    clearTimeout(boot.timer)
    document.documentElement.classList.remove('motion-boot')
  }
})()
