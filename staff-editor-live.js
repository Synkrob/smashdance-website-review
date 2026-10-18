/* Read-only staff-editor preview. It uses the same visitor-safe Cloudflare
   content feed as the review site, but deliberately does not write to the
   private Google Sheet. */
(() => {
  const api = 'https://smash-content-api.synkmarketingtx.workers.dev/content';
  const state = { kids: [], adults: [], workshops: [], videos: [], program: 'kids', day: 'Monday' };
  const isActive = value => ['yes', 'true', 'active', '1'].includes(String(value || '').trim().toLowerCase());
  const clean = value => String(value || '').trim();
  const timeLines = value => clean(value).replace(/\s+(AM|PM)$/i, '<br>$1');
  const text = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    return node;
  };
  const setStatus = (message, tag, failed = false) => {
    document.querySelector('#content-status').innerHTML = failed
      ? `<strong>Connection needs attention.</strong> ${message}`
      : `<strong>Live content connected.</strong> ${message}`;
    const label = document.querySelector('#content-status-tag');
    label.textContent = tag;
    label.style.background = failed ? '#f6e4df' : '#e9f4e8';
    label.style.color = failed ? '#8d3828' : '#287032';
  };
  const endpoint = name => fetch(`${api}/${name}`, { cache: 'no-store' })
    .then(response => { if (!response.ok) throw new Error(`${name} feed returned ${response.status}`); return response.json(); })
    .then(payload => Array.isArray(payload.items) ? payload.items : []);

  const renderClassCard = item => {
    const card = document.createElement('article');
    card.className = 'class-card';
    const clock = text('div', 'class-time', '');
    clock.innerHTML = timeLines(item.start_time || 'Time TBD');
    const copy = text('div', 'class-copy', '');
    const meta = text('div', 'class-meta', '');
    meta.append(text('span', '', item.age_range || item.audience || 'Audience to be confirmed'), text('span', '', isActive(item.active) ? 'Active' : 'Hidden'));
    copy.append(meta, text('h4', '', item.class_name || 'Unnamed class'), text('p', '', item.short_description || 'No public description yet.'));
    const actions = text('div', 'class-actions', '');
    const toggle = text('span', 'toggle', '');
    const indicator = document.createElement('button');
    indicator.type = 'button'; indicator.className = `switch ${isActive(item.active) ? 'is-on' : ''}`;
    indicator.disabled = true; indicator.setAttribute('aria-label', `${item.class_name || 'Class'} status`);
    toggle.append(indicator, document.createTextNode(isActive(item.active) ? 'Live on site' : 'Hidden on site'));
    const preview = text('button', 'button button--small button--navy', 'View Details');
    preview.type = 'button';
    preview.addEventListener('click', () => window.alert(`${item.class_name || 'Class'}\n\n${item.short_description || 'No public description yet.'}\n\nThis is real connected content. Editing will be added in the next phase.`));
    actions.append(toggle, preview); copy.append(actions); card.append(clock, copy);
    return card;
  };
  const renderClasses = () => {
    const label = state.program === 'kids' ? 'KIDS CLASSES' : 'ADULT CLASSES';
    document.querySelector('#schedule-program-label').textContent = label;
    document.querySelector('#schedule-title').textContent = state.program === 'kids' ? 'Kids weekly class cards' : 'Adult weekly class cards';
    const grid = document.querySelector('#live-class-grid');
    const rows = state[state.program]
      .filter(item => clean(item.day).toLowerCase() === state.day.toLowerCase())
      .sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0));
    grid.replaceChildren();
    if (!rows.length) grid.append(text('p', 'help', `No ${label.toLowerCase()} are currently listed for ${state.day}.`));
    else rows.forEach(item => grid.append(renderClassCard(item)));
  };
  const renderWorkshops = () => {
    const list = document.querySelector('#live-workshop-list');
    const rows = state.workshops.sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0));
    list.replaceChildren();
    if (!rows.length) list.append(text('p', 'help', 'No connected workshop rows were found.'));
    rows.forEach(item => {
      const card = text('article', 'workshop-card', '');
      const thumb = text('div', 'workshop-thumb', (item.title || 'WORKSHOP').split(/\s+/).slice(0, 2).join('\n').toUpperCase());
      const copy = text('div', 'workshop-copy', '');
      copy.append(text('p', 'eyebrow', item.event_date || 'DATE TO BE CONFIRMED'), text('h4', '', item.title || 'Untitled workshop'), text('p', '', item.description || 'No public description yet.'));
      const actions = text('div', 'class-actions', '');
      const status = text('span', 'toggle', '');
      const indicator = document.createElement('button'); indicator.type = 'button'; indicator.disabled = true;
      indicator.className = `switch ${isActive(item.active || item.smashdance) ? 'is-on' : ''}`;
      status.append(indicator, document.createTextNode(isActive(item.active || item.smashdance) ? 'Live on site' : 'Hidden on site'));
      const details = text('button', 'button button--small button--navy', 'View Details'); details.type = 'button';
      details.addEventListener('click', () => window.alert(`${item.title || 'Workshop'}\n\nDate: ${item.event_date || 'TBD'}\nTime: ${[item.start_time, item.end_time].filter(Boolean).join(' to ') || 'TBD'}\n\nThis is real connected content. Flyer upload and publishing will be added in the next phase.`));
      actions.append(status, details); copy.append(actions); card.append(thumb, copy); list.append(card);
    });
  };
  const renderVideos = () => {
    const root = document.querySelector('#live-video-groups');
    root.replaceChildren();
    const groups = new Map();
    state.videos.forEach(item => {
      const page = item.page || 'Unassigned page';
      groups.set(page, [...(groups.get(page) || []), item]);
    });
    if (!groups.size) { root.append(text('p', 'help', 'No connected video rows were found.')); return; }
    groups.forEach((items, page) => {
      const group = text('div', 'video-page-group', '');
      const heading = text('h4', '', ''); heading.append(document.createTextNode(page), text('span', '', ` ${items.length} VIDEO ROW${items.length === 1 ? '' : 'S'}`));
      const grid = text('div', 'video-grid', '');
      items.sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0)).forEach((item, index) => {
        const card = text('article', 'video-card', '');
        card.append(text('div', 'video-mark', '▶'));
        const copy = text('div', '', '');
        copy.append(text('h4', '', item.title || `Video row ${index + 1}`), text('p', '', item.placement || 'Page placement needs to be named in the connected Sheet.'));
        card.append(copy, text('div', 'video-link', item.youtube_url || 'YouTube URL not yet exposed by the Sheet'), text('button', 'button button--small button--navy', 'Connection Test'));
        grid.append(card);
      });
      group.append(heading, grid); root.append(group);
    });
  };
  const attachControls = () => {
    document.querySelectorAll('[data-program]').forEach(button => button.addEventListener('click', () => {
      state.program = button.dataset.program || state.program; renderClasses();
    }));
    document.querySelectorAll('.day-tabs button').forEach(button => button.addEventListener('click', () => {
      state.day = button.textContent.trim(); renderClasses();
    }));
  };
  Promise.all([endpoint('kids'), endpoint('adults'), endpoint('workshops'), endpoint('videos')])
    .then(([kids, adults, workshops, videos]) => {
      Object.assign(state, { kids, adults, workshops, videos });
      document.querySelector('#kids-count').textContent = kids.filter(item => isActive(item.active)).length;
      document.querySelector('#adults-count').textContent = adults.filter(item => isActive(item.active)).length;
      document.querySelector('#workshops-count').textContent = workshops.filter(item => isActive(item.active || item.smashdance)).length;
      document.querySelector('#videos-count').textContent = videos.length;
      renderClasses(); renderWorkshops(); renderVideos();
      setStatus(`${kids.length} Kids rows, ${adults.length} Adult rows, ${workshops.length} Workshop rows, and ${videos.length} Video rows are loading from the same connected source as the public review site.`, 'LIVE DATA');
    })
    .catch(error => {
      document.querySelector('#live-class-grid').replaceChildren(text('p', 'help', 'The connected content could not be loaded. Refresh once and check the connector if it continues.'));
      document.querySelector('#live-workshop-list').replaceChildren(text('p', 'help', 'The connected content could not be loaded.'));
      document.querySelector('#live-video-groups').replaceChildren(text('p', 'help', 'The connected content could not be loaded.'));
      setStatus('The editor could not reach the live content connector. The page layout is still safe, but live data testing is not available until the connection responds.', 'OFFLINE', true);
      console.info('SMASH staff editor live feed unavailable', error);
    });
  attachControls();
})();
