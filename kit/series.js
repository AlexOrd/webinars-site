/* One config for the whole webinar series (SPEC §13). Every page loads this before js/dos-kit.js.
   Replace the placeholders; anything still containing YOUR_ is skipped automatically. */
window.DOS_SERIES = {
  siteName: 'Вебінари Олександра Ординського',
  author: {
    name: 'Олександр Ординський',
    title: 'Senior Full-Stack розробник · 10 років у розробці',
  },
  hub: 'https://webinars.ordynski.com/',
  ga4: 'G-YOUR_ID',               // Google Analytics 4 Measurement ID, e.g. G-AB12CD34EF
  socials: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/YOUR_HANDLE' },
    { label: 'GitHub', url: 'https://github.com/AlexOrd' },
    { label: 'Telegram', url: 'https://t.me/YOUR_HANDLE' },
    { label: 'Facebook', url: 'https://www.facebook.com/YOUR_HANDLE' },
    { label: 'YouTube', url: 'https://www.youtube.com/@YOUR_HANDLE' },
    { label: 'Сайт курсу СП', url: 'https://sp.ordynski.com/' },
  ],
};
