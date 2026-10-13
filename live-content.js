/* Public content feed: only fields intended for visitors are loaded here. */
(() => {
  const workshopsFeed = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSYMiNFgVX3nSDx4Cfg7b0vnJpjt9MvsRxzHsW09NAJoBfeB67_v7YBRE9ngBRevj8BRsSwsh3Nge4j/pub?gid=1923024086&single=true&output=csv';
  const container = document.querySelector('#live-workshop-cards');
  if (!container) return;

  const parseCsv = (text) => {
    const rows = [];
    let row = [];
    let value = '';
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      if (character === '"') {
        if (quoted && text[index + 1] === '"') { value += '"'; index += 1; }
        else quoted = !quoted;
      } else if (character === ',' && !quoted) {
        row.push(value); value = '';
      } else if ((character.charCodeAt(0) === 10 || character.charCodeAt(0) === 13) && !quoted) {
        if (character.charCodeAt(0) === 13 && text.charCodeAt(index + 1) === 10) index += 1;
        row.push(value);
        if (row.some((cell) => cell.trim())) rows.push(row);
        row = [];
        value = '';
      } else value += character;
    }
    row.push(value);
    if (row.some((cell) => cell.trim())) rows.push(row);
    const [headers = [], ...values] = rows;
    return values.map((cells) => Object.fromEntries(headers.map((header, index) => [header.trim(), (cells[index] || '').trim()])));
  };

  const active = (value) => ['yes', 'true', 'active', '1'].includes(String(value).trim().toLowerCase());
  const safeUrl = (value) => {
    try {
      const url = new URL(value, window.location.href);
      return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const driveImage = (value) => {
    const link = safeUrl(value);
    if (!link) return '';
    const url = new URL(link);
    if (!/(^|\.)drive\.google\.com$/.test(url.hostname)) return link;
    const match = link.match(/[-\w]{25,}/);
    return match ? 'https://drive.google.com/thumbnail?id=' + match[0] + '&sz=w1200' : link;
  };
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const workshopCard = (item) => {
    const card = element('article', 'workshop-card workshop-card-live');
    const imageWrap = element('div', 'workshop-card-image');
    const image = document.createElement('img');
    image.loading = 'lazy';
    image.alt = item.image_alt || (item.title || 'SMASH') + ' workshop flyer';
    image.src = driveImage(item.flyer_image_url) || 'assets/sample-workshop-flyers/workshop-flyer-dimensions-template-1080x1350.png';
    imageWrap.append(image);
    const copy = element('div', 'workshop-card-copy');
    if (item.event_date) copy.append(element('p', 'workshop-card-date', item.event_date));
    copy.append(element('h3', '', item.title || 'SMASH Workshop'));
    if (item.description) copy.append(element('p', '', item.description));
    const time = [item.start_time, item.end_time].filter(Boolean).join(' - ');
    if (time) copy.append(element('p', 'workshop-card-time', time));
    const reserveUrl = safeUrl(item.purchase_link);
    if (reserveUrl) {
      const link = element('a', '', item.button_label || 'Reserve Your Spot');
      link.href = reserveUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      copy.append(link);
    } else if (item.button_label) copy.append(element('span', 'workshop-card-demo-button', item.button_label));
    card.append(imageWrap, copy);
    return card;
  };

  fetch(workshopsFeed, { cache: 'no-store' })
    .then((response) => { if (!response.ok) throw new Error('Feed returned ' + response.status); return response.text(); })
    .then((csv) => {
      const workshops = parseCsv(csv)
        .filter((item) => active(item.smashdance))
        .sort((first, second) => Number(first.display_order || 0) - Number(second.display_order || 0));
      if (!workshops.length) return;
      container.replaceChildren(...workshops.map(workshopCard));
      document.querySelectorAll('.workshop-card-sample').forEach((card) => card.remove());
    })
    .catch((error) => console.info('Workshop feed unavailable; showing built-in cards.', error));
})();
