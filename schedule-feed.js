/* Public class schedules come from the private master Sheet through the
   read-only SMASH content connector. */
(() => {
  const contentApi = 'https://smash-content-api.synkmarketingtx.workers.dev/content';
  const feeds = {
    kids: `${contentApi}/kids`,
    adults: `${contentApi}/adults`
  };

  window.loadSmashSchedule = (type, fallbackUrl) => fetch(feeds[type], { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`Schedule feed returned ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      const rows = payload.items || [];
      if (!rows.length) throw new Error('Schedule feed is empty');
      return rows;
    })
    .catch(() => fetch(fallbackUrl).then((response) => response.json()));
})();
