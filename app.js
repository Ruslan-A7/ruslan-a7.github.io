const profile = {
  name: 'RA7',
  handle: '@ra7',
  avatar: '/assets/avatar.svg'
};

const translations = {
  uk: { scrollHint: 'Прокрутіть, щоб відкрити', eyebrow: 'Цифрова візитівка', available: 'Доступний для нових ідей', aboutLabel: 'Коротко про мене', aboutTitle: 'Створюю речі,<br><em>які хочеться</em><br>відкрити.', bio: 'Розробник і дослідник цифрових продуктів. Люблю ясні інтерфейси, сильні ідеї та деталі, які залишаються з вами.', licenseLink: 'Ліцензія', buildingTitle: 'Сайт ще<br><em>в розробці.</em>', buildingText: 'Це тимчасова сторінка, але вже зараз тут є місце для важливого.', readLicense: 'Переглянути ліцензію', footerText: 'Зроблено з увагою до деталей', licenseTitle: 'Ліцензія', licenseIntro: 'Умови використання цього цифрового простору.', homeButton: 'На головну', topButton: 'Вверх' },
  en: { scrollHint: 'Scroll to reveal', eyebrow: 'Digital calling card', available: 'Available for new ideas', aboutLabel: 'A little about me', aboutTitle: 'I create things<br><em>worth opening</em><br>again.', bio: 'Developer and digital product explorer. I love clear interfaces, strong ideas, and details that stay with you.', licenseLink: 'License', buildingTitle: 'The site is still<br><em>in progress.</em>', buildingText: 'A temporary page, with room for something meaningful already here.', readLicense: 'Read the license', footerText: 'Made with attention to detail', licenseTitle: 'License', licenseIntro: 'Terms for using this digital space.', homeButton: 'Back home', topButton: 'Top' }
};

let language = localStorage.getItem('site-language') || 'uk';
const setLanguage = (next) => {
  language = next;
  localStorage.setItem('site-language', language);
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    element.innerHTML = translations[language][element.dataset.i18n];
  });
  document.querySelectorAll('[data-language-toggle]').forEach((button) => { button.textContent = language === 'uk' ? 'EN' : 'UA'; });
};

document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => setLanguage(language === 'uk' ? 'en' : 'uk')));
setLanguage(language);

document.querySelectorAll('[data-profile-name]').forEach((element) => { element.textContent = profile.name; });
document.querySelectorAll('[data-profile-handle]').forEach((element) => { element.textContent = profile.handle; });
document.querySelectorAll('[data-profile-avatar]').forEach((element) => { element.src = profile.avatar; });

const card = document.querySelector('[data-card]');
const progress = document.querySelector('[data-progress]');
const hint = document.querySelector('.card-hint');
if (card) {
  const updateCard = () => {
    const section = document.querySelector('.card-scroll');
    const range = section.offsetHeight - window.innerHeight;
    const amount = Math.min(1, Math.max(0, window.scrollY / range));
    card.style.setProperty('--turn', amount);
    card.style.setProperty('--tilt', Math.sin(amount * Math.PI) * 3);
    card.style.setProperty('--lift', Math.sin(amount * Math.PI) * 12);
    if (progress) progress.style.width = `${amount * 100}%`;
    if (hint) hint.style.opacity = amount > .08 ? '0' : '1';
  };
  window.addEventListener('scroll', updateCard, { passive: true });
  updateCard();
}

const topButton = document.querySelector('[data-scroll-top]');
if (topButton) {
  window.addEventListener('scroll', () => topButton.classList.toggle('is-visible', window.scrollY > 200), { passive: true });
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

const licenseContent = document.querySelector('[data-license-content]');
if (licenseContent) {
  const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const renderInline = (value) => escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  const renderMarkdown = (markdown) => {
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    const output = [];
    let paragraph = [];
    let listType = null;
    let codeLines = null;
    const flushParagraph = () => { if (paragraph.length) { output.push(`<p>${renderInline(paragraph.join(' '))}</p>`); paragraph = []; } };
    const closeList = () => { if (listType) { output.push(`</${listType}>`); listType = null; } };
    lines.forEach((line) => {
      if (line.trim().startsWith('```')) {
        if (codeLines) { output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`); codeLines = null; } else { flushParagraph(); closeList(); codeLines = []; }
        return;
      }
      if (codeLines) { codeLines.push(line); return; }
      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      const list = line.match(/^\s*([-*+] |\d+(?:\.\d+)*[.)] )(.+)$/);
      if (!line.trim()) { flushParagraph(); return; }
      if (heading) { flushParagraph(); closeList(); const level = heading[1].length; output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`); return; }
      if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { flushParagraph(); closeList(); output.push('<hr>'); return; }
      if (list) { flushParagraph(); const nextType = /^\d/.test(list[1]) ? 'ol' : 'ul'; if (listType !== nextType) { closeList(); output.push(`<${nextType}>`); listType = nextType; } output.push(`<li>${renderInline(list[2])}</li>`); return; }
      if (/^>\s?/.test(line)) { flushParagraph(); closeList(); output.push(`<blockquote>${renderInline(line.replace(/^>\s?/, ''))}</blockquote>`); return; }
      closeList(); paragraph.push(line.trim());
    });
    if (codeLines) output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
    flushParagraph(); closeList();
    return output.join('');
  };
  fetch('/LICENSE.md').then((response) => {
    if (!response.ok) throw new Error('License unavailable');
    return response.text();
  }).then((markdown) => { licenseContent.innerHTML = renderMarkdown(markdown); })
    .catch(() => { licenseContent.innerHTML = '<p>License unavailable offline.</p>'; });
}

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
