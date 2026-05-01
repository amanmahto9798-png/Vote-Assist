/* ═══════════════════════════════════════════════════════
   VoteAssist — script.js   (All features + I18n + Chatbot)
═══════════════════════════════════════════════════════ */

/* ─── Multi-Language Support ─────────────────────────── */
let currentLang = localStorage.getItem('voteassist-lang') || 'en';

function updateUI() {
    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = getTranslation(key);
        if (text) el.textContent = text;
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const text = getTranslation(key);
        if (text) el.setAttribute('placeholder', text);
    });

    // Update language toggle label
    const label = document.getElementById('langLabel');
    if (label) label.textContent = currentLang === 'en' ? 'हिं' : 'EN';

    // Re-render components that rely on dynamic text
    buildQuiz();
    updateFakeNewsScore();
    renderSuggestionChips();
    // (Optional) Could re-render chart if needed, but labels are mostly years
}

function getTranslation(key) {
    if (!window.translations || !window.translations[currentLang]) return null;
    return window.translations[currentLang][key] || window.translations['en'][key];
}

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    localStorage.setItem('voteassist-lang', currentLang);
    updateUI();
}
window.toggleLanguage = toggleLanguage;

/* ─── Smooth navigation ──────────────────────────────── */
function navigate(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}
window.navigate = navigate;

/* ─── Intersection Observer (slide-in + active nav) ─── */
const slides   = document.querySelectorAll('.slide');
const navLinks = document.querySelectorAll('.nav-links a');

const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');

        const id = entry.target.id;
        navLinks.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === `#${id}`) a.classList.add('active');
        });

        if (id === 'timeline' && !window.chartRendered) {
            renderChart(); window.chartRendered = true;
        }
    });
}, { threshold: 0.15 });

slides.forEach(s => slideObserver.observe(s));

navLinks.forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const targetId = a.getAttribute('href').slice(1);
        navigate(targetId);
    });
});

/* ─── Dark / Light Mode Toggle ───────────────────────── */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('voteassist-theme', theme);
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });
}

// Load saved theme
applyTheme(localStorage.getItem('voteassist-theme') || 'light');

/* ─── Mobile Hamburger Menu ──────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        const open = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open);
    });
}

function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (hamburger) {
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
    }
}
window.closeMobileMenu = closeMobileMenu;

/* ─── Countdown Timer ────────────────────────────────── */
const TARGET_DATE = new Date('2026-11-15T08:00:00');

function updateCountdown() {
    const now  = new Date();
    const diff = TARGET_DATE - now;
    if (diff <= 0) {
        ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '00';
        });
        return;
    }
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);
    
    if (document.getElementById('cd-days')) {
        document.getElementById('cd-days').textContent  = String(days).padStart(2,'0');
        document.getElementById('cd-hours').textContent = String(hours).padStart(2,'0');
        document.getElementById('cd-mins').textContent  = String(mins).padStart(2,'0');
        document.getElementById('cd-secs').textContent  = String(secs).padStart(2,'0');
    }
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ─── Chart.js: Voter Turnout ────────────────────────── */
function renderChart() {
    const canvas = document.getElementById('turnoutChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, 'rgba(77,182,172,0.45)');
    gradient.addColorStop(1, 'rgba(77,182,172,0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1999','2004','2009','2014','2019','2024'],
            datasets: [{
                label: 'Lok Sabha Voter Turnout (%)',
                data: [59.99, 58.07, 58.21, 66.44, 67.40, 65.79],
                borderColor: '#26a69a', backgroundColor: gradient,
                borderWidth: 3, fill: true, tension: 0.4,
                pointBackgroundColor: '#3d5a80',
                pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 6
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color:'#607d8b', font:{ family:'Inter', size:12, weight:'600' } } },
                tooltip: {
                    backgroundColor:'#fff', titleColor:'#1a2332', bodyColor:'#37474f',
                    borderColor:'rgba(0,0,0,0.1)', borderWidth:1, padding:10,
                    callbacks: { label: ctx => ` Turnout: ${ctx.parsed.y}%` }
                }
            },
            scales: {
                y: { min:50, max:80, grid:{ color:'rgba(0,0,0,0.06)' }, border:{ display:false },
                     ticks:{ color:'#607d8b', font:{ family:'Inter',size:11 }, callback:v=>v+'%' } },
                x: { grid:{ display:false }, border:{ display:false },
                     ticks:{ color:'#607d8b', font:{ family:'Inter',size:11 } } }
            }
        }
    });
}

/* ─── Mermaid Step Details Modal ─────────────────────── */
const stepDetails = {
    "A": { titleKey:"track.1", descKey:"desc.A" },
    "B": { titleKey:"track.2", descKey:"desc.B" },
    "C": { titleKey:"tl.1",    descKey:"desc.C" },
    "D": { titleKey:"tl.2",    descKey:"desc.D" },
    "E": { titleKey:"tl.3",    descKey:"desc.E" },
    "F": { titleKey:"tl.4",    descKey:"desc.F" },
    "G": { titleKey:"tl.5",    descKey:"desc.G" },
    "H": { titleKey:"tl.6",    descKey:"desc.H" },
    "I": { titleKey:"tl.6",    descKey:"desc.I" }
};

window.showDetails = function(stepId) {
    if (!stepDetails[stepId]) return;
    const title = getTranslation(stepDetails[stepId].titleKey);
    const desc  = getTranslation(stepDetails[stepId].descKey);
    document.getElementById('modalTitle').textContent       = title;
    document.getElementById('modalDescription').textContent = desc;
    document.getElementById('detailsModal').classList.add('show');
};

window.closeModal = function() {
    document.getElementById('detailsModal').classList.remove('show');
};

document.addEventListener('keydown', e => { if (e.key === 'Escape') { window.closeModal(); } });
window.onclick = e => { if (e.target === document.getElementById('detailsModal')) window.closeModal(); };

/* ─── QUIZ ───────────────────────────────────────────── */
let quizAnswers = {};

function buildQuiz() {
    quizAnswers = {};
    const container = document.getElementById('quizContainer');
    if (!container) return;
    container.innerHTML = '';

    const qCount = 6;
    for (let qi = 0; qi < qCount; qi++) {
        const qKey = `quiz.q${qi+1}`;
        const questionText = getTranslation(qKey);
        
        const div = document.createElement('div');
        div.className = 'quiz-question';
        div.id = `qq-${qi}`;

        let optionsHTML = '';
        for (let oi = 0; oi < 4; oi++) {
            const oKey = `quiz.q${qi+1}.o${oi+1}`;
            const optionText = getTranslation(oKey);
            optionsHTML += `
                <li>
                    <label id="ql-${qi}-${oi}">
                        <input type="radio" name="q${qi}" value="${oi}" onchange="recordAnswer(${qi}, ${oi})">
                        ${optionText}
                    </label>
                </li>`;
        }

        div.innerHTML = `<p>Q${qi+1}. ${questionText}</p><ul class="quiz-options">${optionsHTML}</ul>`;
        container.appendChild(div);
    }

    const row = document.createElement('div');
    row.className = 'quiz-submit-row';
    row.innerHTML = `<button class="cta-btn" onclick="submitQuiz()" id="quizSubmitBtn">${getTranslation('quiz.submit')}</button>`;
    container.appendChild(row);

    const result = document.getElementById('quizResult');
    if (result) result.style.display = 'none';
}

function recordAnswer(qi, oi) { quizAnswers[qi] = oi; }

function submitQuiz() {
    const qCount = 6;
    const correctAnswers = [1, 2, 1, 2, 2, 1]; // Indices: 18 years, Form 6, EVM, 272, ECI, VVPAT verification

    if (Object.keys(quizAnswers).length < qCount) {
        alert(currentLang === 'hi' ? 'कृपया जमा करने से पहले सभी प्रश्नों के उत्तर दें!' : 'Please answer all questions before submitting!');
        return;
    }

    let score = 0;
    for (let qi = 0; qi < qCount; qi++) {
        const selected = quizAnswers[qi];
        const correct = correctAnswers[qi];

        for (let oi = 0; oi < 4; oi++) {
            const label = document.getElementById(`ql-${qi}-${oi}`);
            if (label) label.classList.remove('correct','wrong');
        }

        const correctLabel  = document.getElementById(`ql-${qi}-${correct}`);
        const selectedLabel = document.getElementById(`ql-${qi}-${selected}`);
        
        if (correctLabel)  correctLabel.classList.add('correct');
        if (selected === correct) {
            score++;
        } else if (selectedLabel) {
            selectedLabel.classList.add('wrong');
        }
        document.querySelectorAll(`input[name="q${qi}"]`).forEach(r => r.disabled = true);
    }

    const pct    = Math.round((score / qCount) * 100);
    const result = document.getElementById('quizResult');
    if (result) {
        result.style.display = 'block';
        const titleKey = score === qCount ? 'Perfect Score!' : score >= 4 ? 'Great Job!' : 'Keep Learning!';
        // Since we don't have these specific keys in translations.js yet, we use defaults or add them
        document.getElementById('resultEmoji').textContent = score === qCount ? '🎉' : score >= 4 ? '👏' : '📚';
        document.getElementById('resultTitle').textContent = titleKey;
        document.getElementById('resultText').textContent  = (currentLang === 'hi' ? `आपका स्कोर ${score} में से ${qCount} है` : `You scored ${score} out of ${qCount}`) + ` (${pct}%)`;
        document.getElementById('scoreBarFill').style.width = pct + '%';
        document.getElementById('quizSubmitBtn').disabled = true;
        result.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }

    if (score === qCount) launchConfetti();
}

function resetQuiz() { buildQuiz(); }
window.resetQuiz = resetQuiz;

/* ─── PROGRESS TRACKER ───────────────────────────────── */
const TRACKER_KEY = 'voteassist-tracker';

function loadTracker() {
    const saved = JSON.parse(localStorage.getItem(TRACKER_KEY) || '{}');
    document.querySelectorAll('#trackerList input[type=checkbox]').forEach(cb => {
        if (saved[cb.id]) {
            cb.checked = true;
            cb.closest('li').classList.add('done');
        }
    });
    updateTrackerUI();
}

function updateTracker() {
    const saved = {};
    document.querySelectorAll('#trackerList input[type=checkbox]').forEach(cb => {
        saved[cb.id] = cb.checked;
        cb.closest('li').classList.toggle('done', cb.checked);
    });
    localStorage.setItem(TRACKER_KEY, JSON.stringify(saved));
    updateTrackerUI();
}
window.updateTracker = updateTracker;

function updateTrackerUI() {
    const all     = document.querySelectorAll('#trackerList input[type=checkbox]');
    const checked = document.querySelectorAll('#trackerList input[type=checkbox]:checked');
    const pct     = Math.round((checked.length / all.length) * 100);
    const fill    = document.getElementById('trackerBarFill');
    const label   = document.getElementById('trackerPct');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = pct + '%';
    if (checked.length === all.length && all.length > 0) launchConfetti();
}

function resetTracker() {
    document.querySelectorAll('#trackerList input[type=checkbox]').forEach(cb => {
        cb.checked = false;
        cb.closest('li').classList.remove('done');
    });
    localStorage.removeItem(TRACKER_KEY);
    updateTrackerUI();
}
window.resetTracker = resetTracker;

/* ─── CANDIDATE COMPARISON TABLE ─────────────────────── */
const comparisonData = [
    { category:'economy',        issueKey:'compare.economy',      a:'Tax cuts for businesses, boost FDI',    b:'Increase minimum wage, public welfare',  c:'Privatisation of state enterprises' },
    { category:'healthcare',     issueKey:'compare.healthcare',   a:'PPP model for hospitals',               b:'Universal health insurance for all',     c:'Boost Ayushman Bharat scheme' },
    { category:'education',      issueKey:'compare.education',    a:'Digital classrooms nationwide',         b:'Hire 1 lakh teachers, mid-day meals',    c:'Curriculum reform & STEM focus' },
    { category:'environment',    issueKey:'compare.environment',  a:'Carbon-neutral target by 2070',         b:'50% renewable energy by 2035',           c:'Stricter industrial pollution norms' },
    { category:'infrastructure', issueKey:'compare.infra',        a:'Bullet train on 5 corridors',           b:'Rural roads & bus connectivity',         c:'Waterways development' }
];

function buildComparison() {
    const tbody = document.getElementById('compareBody');
    if (!tbody) return;
    tbody.innerHTML = comparisonData.map(row => `
        <tr data-category="${row.category}">
            <td class="issue-col">${getTranslation(row.issueKey)}</td>
            <td>${row.a}</td>
            <td>${row.b}</td>
            <td>${row.c}</td>
        </tr>`).join('');
}

function filterComparison() {
    const val = document.getElementById('issueFilter').value;
    document.querySelectorAll('#compareTable tbody tr').forEach(tr => {
        tr.classList.toggle('hidden', val !== 'all' && tr.dataset.category !== val);
    });
}
window.filterComparison = filterComparison;

/* ─── FAKE NEWS CHECKER ──────────────────────────────── */
function updateFakeNewsScore() {
    const boxes   = document.querySelectorAll('#fakeNewsList input[type=checkbox]');
    const checked = [...boxes].filter(b => b.checked).length;
    const result  = document.getElementById('fakeNewsResult');
    if (!result) return;
    result.className = 'fakenews-result';
    
    if (checked === 0) {
        result.textContent = '';
    } else if (checked <= 2) {
        result.classList.add('fn-safe');
        result.textContent = (currentLang === 'hi' ? `⚠️ ${checked} लाल झंडा(झंडे) — कुछ सावधानी के साथ आगे बढ़ें। साझा करने से पहले सत्यापित करें।` : `⚠️ ${checked} red flag(s) — Proceed with some caution. Verify before sharing.`);
    } else if (checked <= 4) {
        result.classList.add('fn-warn');
        result.textContent = (currentLang === 'hi' ? `🚨 ${checked} लाल झंडे — गलत सूचना का उच्च संदेह! साझा न करें।` : `🚨 ${checked} red flags — HIGH suspicion of misinformation! Do not share.`);
    } else {
        result.classList.add('fn-danger');
        result.textContent = (currentLang === 'hi' ? `🛑 ${checked} लाल झंडे — बहुत संभव है कि यह फेक न्यूज़ है। इसे अनदेखा करें और रिपोर्ट करें!` : `🛑 ${checked} red flags — Very likely FAKE NEWS. Ignore and report it!`);
    }
}
window.updateFakeNewsScore = updateFakeNewsScore;

/* ─── CHATBOT LOGIC — SMARTER BRAIN ───────────────────── */
const botData = {
    registration: {
        keywords: ['register', 'registration', 'form 6', 'how to vote', 'apply', 'पंजीकरण', 'नाम'],
        en: "To register, use Form 6 on the ECI Voter Portal (voterportal.eci.gov.in). You need proof of age (18+) and residence.",
        hi: "पंजीकरण के लिए, ECI मतदाता पोर्टल (voterportal.eci.gov.in) पर फॉर्म 6 का उपयोग करें। आपको आयु (18+) और निवास के प्रमाण की आवश्यकता होगी।",
        action: () => navigate('process')
    },
    id_docs: {
        keywords: ['id', 'card', 'document', 'proof', 'aadhaar', 'pan', 'passport', 'पहचान', 'दस्तावेज'],
        en: "You need your Voter ID (EPIC). Other valid IDs: Aadhaar, PAN, Passport, Driving License, or MGNREGA Job Card.",
        hi: "आपको अपने मतदाता पहचान पत्र (EPIC) की आवश्यकता है। अन्य मान्य आईडी: आधार, पैन, पासपोर्ट, ड्राइविंग लाइसेंस, या मनरेगा जॉब कार्ड।",
        action: () => navigate('dosanddonts')
    },
    evm_vvpat: {
        keywords: ['evm', 'vvpat', 'machine', 'secure', 'counting', 'मशीन'],
        en: "EVMs are 100% secure. VVPAT lets you see a paper slip for 7 seconds to verify your vote was cast correctly.",
        hi: "EVM 100% सुरक्षित हैं। VVPAT आपको 7 सेकंड के लिए एक पेपर पर्ची देखने देता है ताकि आप सत्यापित कर सकें कि आपका वोट सही ढंग से डाला गया था।",
        action: () => navigate('process')
    },
    dates: {
        keywords: ['date', 'when', 'schedule', 'next', 'bihar', 'तारीख', 'कब'],
        en: "The Bihar Assembly Elections are expected around Nov 15, 2026. Official dates are announced by the ECI 2 months before.",
        hi: "बिहार विधानसभा चुनाव 15 नवंबर, 2026 के आसपास होने की उम्मीद है। आधिकारिक तारीखों की घोषणा चुनाव आयोग द्वारा 2 महीने पहले की जाती है।",
        action: () => navigate('intro')
    },
    polling_station: {
        keywords: ['where', 'polling', 'station', 'booth', 'location', 'केंद्र'],
        en: "Find your booth at 'electoralsearch.eci.gov.in' using your EPIC number or name.",
        hi: "अपना बूथ 'electoralsearch.eci.gov.in' पर अपने EPIC नंबर या नाम का उपयोग करके खोजें।",
        action: () => navigate('tracker')
    },
    fake_news: {
        keywords: ['fake', 'news', 'misinformation', 'verify', 'whatsapp', 'झूठ'],
        en: "Check for red flags: ALL CAPS, no author, or weird URLs. Use our 'Fake News Checker' in the Voter Guide section!",
        hi: "लाल झंडों की जांच करें: बड़े अक्षर, कोई लेखक नहीं, या अजीब URL। हमारे 'फेक न्यूज़ जाँचकर्ता' का उपयोग करें!",
        action: () => navigate('dosanddonts')
    },
    quiz: {
        keywords: ['quiz', 'test', 'knowledge', 'प्रश्नोत्तरी', 'परीक्षा'],
        en: "Want to test your knowledge? Scroll down to our Voter Readiness Quiz section!",
        hi: "अपनी जानकारी परखना चाहते हैं? हमारे मतदाता तैयारी प्रश्नोत्तरी अनुभाग पर जाएं!",
        action: () => navigate('quiz')
    }
};

const suggestionChips = [
    { en: "How to register?", hi: "पंजीकरण कैसे करें?", key: 'registration' },
    { en: "Documents needed?", hi: "क्या दस्तावेज चाहिए?", key: 'id_docs' },
    { en: "When is the election?", hi: "चुनाव कब है?", key: 'dates' },
    { en: "Is EVM safe?", hi: "क्या EVM सुरक्षित है?", key: 'evm_vvpat' }
];

function toggleChat() {
    const win = document.getElementById('chatbotWindow');
    win.classList.toggle('open');
    if (win.classList.contains('open')) {
        document.getElementById('chatBadge').style.display = 'none';
        if (document.getElementById('chatMessages').children.length === 0) {
            addChatMessage(getTranslation('bot.welcome'), 'bot');
            renderSuggestionChips();
        }
    }
}
window.toggleChat = toggleChat;

function renderSuggestionChips() {
    const container = document.getElementById('quickQuestions');
    container.innerHTML = suggestionChips.map(chip => `
        <button class="quick-chip" onclick="handleChipClick('${chip.key}', '${currentLang === 'hi' ? chip.hi : chip.en}')">
            ${currentLang === 'hi' ? chip.hi : chip.en}
        </button>
    `).join('');
}

function handleChipClick(key, text) {
    addChatMessage(text, 'user');
    processBotResponse(key);
}
window.handleChipClick = handleChipClick;

function addChatMessage(text, side) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = `msg ${side}`;
    msg.innerHTML = `
        <div class="msg-avatar">${side === 'bot' ? '🗳️' : '👤'}</div>
        <div class="msg-bubble">${text}</div>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const tid = document.createElement('div');
    tid.className = 'msg bot typing-msg';
    tid.id = 'typingIndicator';
    tid.innerHTML = `
        <div class="msg-avatar">🗳️</div>
        <div class="msg-bubble typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    container.appendChild(tid);
    container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
    const tid = document.getElementById('typingIndicator');
    if (tid) tid.remove();
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    addChatMessage(text, 'user');
    input.value = '';
    
    // Find best matching key based on keywords
    let bestMatch = null;
    let maxScore = 0;
    const lowerText = text.toLowerCase();

    for (const key in botData) {
        let score = 0;
        botData[key].keywords.forEach(kw => {
            if (lowerText.includes(kw.toLowerCase())) score++;
        });
        if (score > maxScore) {
            maxScore = score;
            bestMatch = key;
        }
    }

    processBotResponse(bestMatch);
}
window.sendChat = sendChat;

function processBotResponse(key) {
    showTypingIndicator();

    setTimeout(() => {
        hideTypingIndicator();
        if (key && botData[key]) {
            const response = currentLang === 'hi' ? botData[key].hi : botData[key].en;
            addChatMessage(response, 'bot');
            // Trigger auto-navigation if relevant
            if (botData[key].action) {
                setTimeout(() => botData[key].action(), 1000);
            }
        } else {
            addChatMessage(getTranslation('bot.fallback'), 'bot');
        }
    }, 800);
}

/* ─── CONFETTI ───────────────────────────────────────── */
function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 8 + Math.random() * 8,
        h: 4 + Math.random() * 4,
        color: ['#26a69a','#4db6ac','#3d5a80','#e64a19','#fb8c00','#7b1fa2'][Math.floor(Math.random()*6)],
        speed: 2 + Math.random() * 4,
        angle: Math.random() * 360,
        spin:  (Math.random() - 0.5) * 6
    }));

    let frame = 0;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
            ctx.restore();
            p.y     += p.speed;
            p.angle += p.spin;
        });
        frame++;
        if (frame < 200) requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
}

/* ─── Init ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    updateUI(); // This calls buildQuiz and builds comparison
    buildComparison();
    loadTracker();
    initVerification();
});

/* ─── SMART VERIFICATION SYSTEM LOGIC ────────────────── */
const VOTED_LIST_KEY = 'voteassist-voted-list';
let currentVoterId = '';

function initVerification() {
    const fingerBtn = document.getElementById('fingerBtn');
    if (!fingerBtn) return;

    let scanTimer;
    const scanner = document.getElementById('fingerScanner');

    fingerBtn.addEventListener('mousedown', () => {
        scanner.classList.add('scanning');
        scanTimer = setTimeout(() => {
            scanner.classList.remove('scanning');
            scanner.innerHTML = '<span class="finger-icon">✅</span>';
            setTimeout(() => {
                showVerifyStep(3);
                sendFakeOtp();
            }, 800);
        }, 2000);
    });

    fingerBtn.addEventListener('mouseup', () => {
        if (scanTimer) {
            clearTimeout(scanTimer);
            scanner.classList.remove('scanning');
        }
    });

    fingerBtn.addEventListener('mouseleave', () => {
        if (scanTimer) {
            clearTimeout(scanTimer);
            scanner.classList.remove('scanning');
        }
    });
}

function showVerifyStep(step) {
    document.querySelectorAll('.verify-step').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`vstep-${step}`);
    if (target) target.classList.add('active');
    
    const result = document.getElementById('verifyResult');
    if (result) result.style.display = step === 'result' ? 'block' : 'none';
}

window.checkVoterId = function() {
    const input = document.getElementById('voterIdInput');
    const vid = input.value.trim().toUpperCase();
    
    if (vid.length < 10) {
        alert(getTranslation('verify.invalid'));
        return;
    }

    const votedList = JSON.parse(localStorage.getItem(VOTED_LIST_KEY) || '[]');
    if (votedList.includes(vid)) {
        showVerificationResult('error', getTranslation('verify.duplicate'));
        return;
    }

    currentVoterId = vid;
    showVerifyStep(2);
};

window.simulateFaceScan = function() {
    const scanner = document.getElementById('faceScanner');
    scanner.classList.add('scanning');
    
    setTimeout(() => {
        scanner.classList.remove('scanning');
        scanner.innerHTML = '<span class="face-icon">✅</span>';
        setTimeout(() => {
            showVerifyStep(3);
            sendFakeOtp();
        }, 800);
    }, 1500);
};

function sendFakeOtp() {
    // Just a simulation
    console.log("OTP Sent: 123456");
}

window.verifyOtp = function() {
    const otp = document.getElementById('otpInput').value;
    if (otp === '123456' || otp.length === 6) { // Accept 123456 or any 6 digits for simulation
        const votedList = JSON.parse(localStorage.getItem(VOTED_LIST_KEY) || '[]');
        votedList.push(currentVoterId);
        localStorage.setItem(VOTED_LIST_KEY, JSON.stringify(votedList));
        
        showVerificationResult('success', getTranslation('verify.success'));
        launchConfetti();
    } else {
        alert("Invalid OTP. Try 123456");
    }
};

function showVerificationResult(type, message) {
    showVerifyStep('result');
    const res = document.getElementById('verifyResult');
    res.className = `verify-result ${type}`;
    document.getElementById('vResultIcon').textContent = type === 'success' ? '✅' : '🚫';
    document.getElementById('vResultTitle').textContent = type === 'success' ? 'Success' : 'Alert';
    document.getElementById('vResultText').textContent = message;
}

window.resetVerification = function() {
    document.getElementById('voterIdInput').value = '';
    document.getElementById('otpInput').value = '';
    document.getElementById('fingerScanner').innerHTML = '<div class="scan-line"></div><span class="finger-icon">☝️</span>';
    document.getElementById('faceScanner').innerHTML = '<div class="scan-circle"></div><span class="face-icon">👤</span>';
    showVerifyStep(1);
};

/* ─── AI FRAUD DETECTION LOGIC ────────────────────────── */
window.runFraudScan = function() {
    const btn = document.getElementById('scanBtn');
    const log = document.getElementById('fraudLog');
    const reasoning = document.getElementById('fraudReasoning');
    const statusText = document.getElementById('fraudStatusText');
    const statusDot = document.getElementById('fraudStatusDot');
    const alertBox = document.getElementById('fraudAlertBox');

    // Reset UI
    btn.disabled = true;
    log.innerHTML = `<div class="log-entry system">[${new Date().toLocaleTimeString()}] Integrity monitor initialized...</div>`;
    reasoning.innerHTML = '<div class="placeholder-text">Analyzing stream...</div>';
    statusText.textContent = getTranslation('fraud.status.scanning');
    statusDot.classList.add('pulse');
    statusDot.classList.remove('alert');
    alertBox.style.display = 'none';

    const steps = [
        { msg: "Connecting to centralized election server...", type: "system", delay: 800 },
        { msg: "Fetching real-time voting streams (Booths 1-1000)...", type: "process", delay: 1200 },
        { msg: "Applying Bayesian pattern recognition...", type: "process", delay: 1500 },
        { msg: "Cross-referencing biometric logs with Voter ID database...", type: "process", delay: 1000 },
        { msg: "WARNING: High frequency delta detected in Cluster 4!", type: "warn", delay: 1800 },
        { msg: "ANOMALY FOUND: Identity collision in Booth #104 & #892", type: "danger", delay: 1200 },
        { msg: "CRITICAL: Unusual throughput spike in Booth #402", type: "danger", delay: 1000 }
    ];

    let currentDelay = 0;
    steps.forEach((step, index) => {
        currentDelay += step.delay;
        setTimeout(() => {
            const entry = document.createElement('div');
            entry.className = `log-entry ${step.type}`;
            entry.textContent = `[${new Date().toLocaleTimeString()}] ${step.msg}`;
            log.appendChild(entry);
            log.scrollTop = log.scrollHeight;

            if (index === steps.length - 1) {
                finalizeFraudScan();
            }
        }, currentDelay);
    });
};

function finalizeFraudScan() {
    const statusText = document.getElementById('fraudStatusText');
    const statusDot = document.getElementById('fraudStatusDot');
    const reasoning = document.getElementById('fraudReasoning');
    const alertBox = document.getElementById('fraudAlertBox');
    const btn = document.getElementById('scanBtn');

    statusText.textContent = getTranslation('fraud.status.alert');
    statusDot.classList.remove('pulse');
    statusDot.classList.add('alert');
    btn.disabled = false;

    // AI Reasoning UI
    reasoning.innerHTML = `
        <div class="reason-box">
            <span class="type">${getTranslation('fraud.type.multiple')}</span>
            <p>${getTranslation('fraud.reason.multiple')}</p>
        </div>
        <div class="reason-box">
            <span class="type">${getTranslation('fraud.type.spike')}</span>
            <p>${getTranslation('fraud.reason.spike')}</p>
        </div>
    `;

    // Alert UI
    document.getElementById('alertType').textContent = getTranslation('fraud.type.spike');
    document.getElementById('alertDesc').textContent = getTranslation('fraud.desc.spike');
    document.getElementById('fraudAlertBox').style.display = 'block';

    setTimeout(() => {
        document.getElementById('fraudAlertBox').style.display = 'none';
    }, 6000);
}

/* ─── ADMIN DASHBOARD LOGIC ────────────────────────── */
let adminChart = null;

function initAdminDashboard() {
    renderBoothTable();
    renderAdminChart();
    
    // Live update loop
    setInterval(updateAdminStats, 3000);
}

function renderBoothTable() {
    const body = document.getElementById('boothStatusBody');
    if (!body) return;
    
    const booths = [
        { id: 'B-101', loc: 'Patna Central', load: 45, status: 'active' },
        { id: 'B-402', loc: 'Gaya North', load: 92, status: 'alert' },
        { id: 'B-205', loc: 'Muzaffarpur', load: 78, status: 'busy' },
        { id: 'B-112', loc: 'Bhagalpur', load: 30, status: 'active' },
        { id: 'B-501', loc: 'Darbhanga', load: 65, status: 'busy' }
    ];

    body.innerHTML = booths.map(b => `
        <tr>
            <td><strong>${b.id}</strong></td>
            <td>${b.loc}</td>
            <td>
                <div class="load-bar-wrap"><div class="load-bar-fill" style="width: ${b.load}%"></div></div>
            </td>
            <td><span class="status-badge ${b.status}">${b.status}</span></td>
        </tr>
    `).join('');
}

function renderAdminChart() {
    const canvas = document.getElementById('boothActivityChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    adminChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00'],
            datasets: [{
                label: 'Votes / Hr',
                data: [1200, 1900, 3000, 2500, 2200, 2800],
                backgroundColor: 'rgba(38, 166, 154, 0.6)',
                borderColor: '#26a69a',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function updateAdminStats() {
    // Randomly update numbers to simulate real-time data
    const verified = document.getElementById('stat-verified');
    if (!verified) return;

    let val = parseInt(verified.textContent.replace(/,/g, ''));
    val += Math.floor(Math.random() * 10);
    verified.textContent = val.toLocaleString();

    // Update chart with new data point occasionally
    if (adminChart) {
        const newData = adminChart.data.datasets[0].data;
        newData[newData.length - 1] += Math.floor(Math.random() * 20);
        adminChart.update('none');
    }
}

// Update DOMContentLoaded to include admin init
document.addEventListener('DOMContentLoaded', () => {
    updateUI(); 
    buildComparison();
    loadTracker();
    initVerification();
    initAdminDashboard();
});

/* ─── EDGE CASE HANDLING LOGIC ─────────────────────── */
let forceScanFailure = false;
let isOffline = false;

window.simulateScanFailure = function() {
    forceScanFailure = true;
    alert("Simulation: Next biometric scan will fail.");
};

window.toggleNetwork = function() {
    isOffline = !isOffline;
    const banner = document.getElementById('offlineBanner');
    banner.style.display = isOffline ? 'block' : 'none';
};

window.requestManualAssist = function() {
    showModal(getTranslation('verify.manual.btn'), getTranslation('verify.manual.msg'));
    
    // In a real system, this would alert an official. 
    // Here we simulate successful manual verification after 3s.
    setTimeout(() => {
        const title = document.getElementById('vResultTitle');
        const text = document.getElementById('vResultText');
        const icon = document.getElementById('vResultIcon');
        
        title.textContent = "Manual Success";
        text.textContent = "Official has verified your documents.";
        icon.textContent = "📑✅";
        
        showVerifyStep('result');
        saveVoted(currentVoterId);
    }, 3000);
};

// Modify existing initVerification to handle forced failure
const originalInitVerification = window.initVerification;
window.initVerification = function() {
    const fingerBtn = document.getElementById('fingerBtn');
    if (!fingerBtn) return;

    let holdTimer;
    fingerBtn.onmousedown = () => {
        document.getElementById('fingerScanner').classList.add('scanning');
        holdTimer = setTimeout(() => {
            document.getElementById('fingerScanner').classList.remove('scanning');
            
            if (forceScanFailure) {
                forceScanFailure = false; // reset
                alert(getTranslation('verify.mismatch'));
                showVerifyStep(3); // Fallback to OTP
            } else {
                showVerifyStep(3);
            }
        }, 2000);
    };

    fingerBtn.onmouseup = () => {
        clearTimeout(holdTimer);
        document.getElementById('fingerScanner').classList.remove('scanning');
    };

    // Mobile support
    fingerBtn.ontouchstart = fingerBtn.onmousedown;
    fingerBtn.ontouchend = fingerBtn.onmouseup;
};

/* ─── PRIVACY & ETHICS LOGIC ───────────────────────── */
window.startVerifiedFlow = function() {
    const consent = document.getElementById('privacyConsent');
    if (!consent.checked) {
        alert("Please provide your consent to continue.");
        return;
    }
    showVerifyStep(1);
};

// Override resetVerification to go back to consent step
const originalResetVerification = window.resetVerification;
window.resetVerification = function() {
    document.getElementById('voterIdInput').value = '';
    document.getElementById('otpInput').value = '';
    document.getElementById('privacyConsent').checked = false;
    
    // Clear simulation flags
    forceScanFailure = false;
    
    document.getElementById('faceScanner').innerHTML = '<div class="scan-circle"></div><span class="face-icon">👤</span>';
    showVerifyStep(0); // Back to consent
};
