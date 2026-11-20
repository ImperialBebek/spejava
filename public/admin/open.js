fetch('/admin/config.json')
  .then(response => response.json())
  .then(config => {
    if (!config.studioUrl) return
    const url = new URL(config.studioUrl)
    if (url.protocol === 'https:' && url.hostname.endsWith('.sanity.studio')) window.location.replace(url.href)
  })
  .catch(() => {
    document.getElementById('editor-status').textContent = 'The editor could not load. Please reload or contact the site administrator.'
  })
