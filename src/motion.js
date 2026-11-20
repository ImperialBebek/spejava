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
    if (preference.matches) return
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
    toolbar.addEventListener('click', locate)
    preference.addEventListener('change', locate)
    if ('ResizeObserver' in window) new ResizeObserver(locate).observe(toolbar)
    locate()
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
