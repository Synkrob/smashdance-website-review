(() => {
  const adultTrialUrl = 'https://www.paypal.com/ncp/payment/46SME54LD237U';

  const applyAdultTrialLink = () => {
    document.querySelectorAll('a').forEach((link) => {
      const label = link.textContent.trim().toLowerCase();
      if (label.includes('try adult class') || label.includes('try an adult class')) {
        link.href = adultTrialUrl;
      }
    });
  };

  applyAdultTrialLink();
  new MutationObserver(applyAdultTrialLink).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
