export function renderApp(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Interviewer - Smart Interview Practice</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Inter', 'sans-serif'] },
          colors: {
            primary: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a' },
            accent: { 50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a' },
          },
          animation: {
            'fade-in': 'fadeIn 0.5s ease-out',
            'slide-up': 'slideUp 0.4s ease-out',
            'slide-down': 'slideDown 0.3s ease-out',
            'pulse-slow': 'pulse 3s infinite',
            'bounce-slow': 'bounce 2s infinite',
            'wave': 'wave 2s ease-in-out infinite',
            'speaking': 'speaking 1.5s ease-in-out infinite',
          },
          keyframes: {
            fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
            slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
            slideDown: { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
            wave: { '0%,100%': { transform: 'scaleY(1)' }, '50%': { transform: 'scaleY(2)' } },
            speaking: { '0%,100%': { boxShadow: '0 0 0 0 rgba(59,130,246,0.4)' }, '50%': { boxShadow: '0 0 0 20px rgba(59,130,246,0)' } },
            'pulse-mic': { '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' }, '70%': { boxShadow: '0 0 0 15px rgba(239, 68, 68, 0)' }, '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' } },
          }
        }
      }
    }
  </script>
  <style>
    * { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    .glass { background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.3); }
    .glass-dark { background: rgba(30,41,59,0.9); backdrop-filter: blur(20px); }
    .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .gradient-text { background: linear-gradient(135deg, #3b82f6, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .card-hover { transition: all 0.3s ease; }
    .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .avatar-ring { animation: speaking 1.5s ease-in-out infinite; }
    .wave-bar { animation: wave 1.2s ease-in-out infinite; }
    .wave-bar:nth-child(2) { animation-delay: 0.1s; }
    .wave-bar:nth-child(3) { animation-delay: 0.2s; }
    .wave-bar:nth-child(4) { animation-delay: 0.3s; }
    .wave-bar:nth-child(5) { animation-delay: 0.4s; }
    @keyframes typing { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
    .typing-dot { animation: typing 1.4s infinite ease-in-out both; }
    .typing-dot:nth-child(2) { animation-delay: 0.16s; }
    .typing-dot:nth-child(3) { animation-delay: 0.32s; }
    .mic-active { animation: pulse-mic 1.5s infinite; background: #ef4444 !important; border-color: #ef4444 !important; }
    .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); }
    .avatar-glow { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
    .score-circle { transition: stroke-dashoffset 1.5s ease-out; }
    .btn-glow { position: relative; overflow: hidden; }
    .btn-glow::after { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%); opacity: 0; transition: opacity 0.3s; }
    .btn-glow:hover::after { opacity: 1; }
    input:focus, textarea:focus, select:focus { outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
    .page-transition { animation: fadeIn 0.3s ease-out; }
    @media print {
      body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      #sidebar, #mic-btn, #submit-answer-btn, .no-print, nav, button { display: none !important; }
      .bg-white { border: none !important; shadow: none !important; }
      .max-w-5xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
      .shadow-sm { box-shadow: none !important; border: 1px solid #e5e7eb !important; }
      canvas { max-width: 100% !important; height: auto !important; margin-bottom: 2rem !important; }
      .print-only { display: block !important; }
      h1, h2, h3 { color: black !important; -webkit-print-color-adjust: exact; }
      .bg-gray-50 { background: white !important; }
      .text-gray-500 { color: #6b7280 !important; }
      .rounded-2xl { border-radius: 0.5rem !important; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body class="bg-gray-50 font-sans antialiased min-h-screen">
  <div id="app"></div>
  <script>
  ${getAppScript()}
  </script>
</body>
</html>`
}

function getAppScript(): string {
  return `
// ========================================
// AI INTERVIEWER - Complete SPA Application
// ========================================

const API = '/api';
let currentUser = null;
let currentToken = localStorage.getItem('ai_interview_token');
let currentPage = 'landing';
let interviewState = null;
let interviewActive = false;
let chartInstances = {};

// ========== UTILITY FUNCTIONS ==========
function $(id) { return document.getElementById(id); }
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (currentToken) headers['Authorization'] = 'Bearer ' + currentToken;
  const res = await fetch(API + path, { ...options, headers, body: options.body ? JSON.stringify(options.body) : undefined });
  const data = await res.json();
  if (!res.ok && res.status === 401) { logout(); throw new Error('Session expired'); }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function showToast(msg, type = 'success') {
  const toast = document.createElement('div');
  const colors = { success: 'bg-green-500', error: 'bg-red-500', info: 'bg-blue-500', warning: 'bg-yellow-500' };
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  toast.className = 'fixed top-4 right-4 z-[9999] px-6 py-3 rounded-xl text-white shadow-2xl animate-slide-down flex items-center gap-3 ' + (colors[type] || colors.info);
  toast.innerHTML = '<i class="fas ' + (icons[type] || icons.info) + '"></i><span>' + msg + '</span>';
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; setTimeout(() => toast.remove(), 500); }, 3500);
}

function formatDate(d) {
  if (!d) return 'N/A';
  let s = String(d).trim();
  
  // Clean SQLite/ISO format to ensure correct parsing
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s) && !s.includes('Z')) {
    s = s.replace(' ', 'T') + 'Z';
  }
  
  const date = new Date(s);
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric'
  });
}

function scoreColor(s) {
  if (s >= 8) return 'text-green-600';
  if (s >= 6) return 'text-blue-600';
  if (s >= 4) return 'text-yellow-600';
  return 'text-red-600';
}

function scoreBg(s) {
  if (s >= 8) return 'bg-green-100 text-green-700';
  if (s >= 5) return 'bg-blue-100 text-blue-700';
  return 'bg-red-100 text-red-700';
}

function printReport() {
  const oldTitle = document.title;
  const interviewId = interviewState?.interviewId || 'Report';
  document.title = 'HR_Assessment_Report_' + interviewId;
  window.print();
  document.title = oldTitle;
}

// ========== SPEECH SYNTHESIS & RECOGNITION ==========
let speechSynth = window.speechSynthesis;
let recognition = null;
let isListening = false;
let isSpeaking = false;

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  const lang = interviewState?.language || 'en';
  recognition.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
  return recognition;
}

function speak(text, onEnd) {
  if (!speechSynth) return onEnd?.();
  if (!text) return onEnd?.();
  speechSynth.cancel();
  speakSingle(text, 'en', onEnd);
}

function speakSingle(text, lang, onEnd) {
  if (!speechSynth) return onEnd?.();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  const voices = speechSynth.getVoices();
  
  let preferred;
  if (lang === 'ur') {
    preferred = voices.find(v => v.lang.startsWith('ur'));
  } else {
    // English preference: Google voices or any English voice
    preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || 
                voices.find(v => v.lang.startsWith('en'));
  }
  
  if (preferred) utterance.voice = preferred;
  else if (lang === 'ur') utterance.lang = 'ur-PK';
  else utterance.lang = 'en-US';

  isSpeaking = true;
  updateAvatarState();
  
  utterance.onend = () => {
    isSpeaking = false;
    updateAvatarState();
    onEnd?.();
  };
  
  utterance.onerror = (e) => {
    console.error('Speech error:', e);
    isSpeaking = false;
    updateAvatarState();
    onEnd?.();
  };
  
  speechSynth.speak(utterance);
}

function stopSpeaking() {
  speechSynth?.cancel();
  isSpeaking = false;
  updateAvatarState();
}

function startListening(onResult, onEnd) {
  if (!recognition) initSpeechRecognition();
  if (!recognition) { showToast('Speech recognition not supported in this browser', 'warning'); return; }
  let finalTranscript = '';
  let interimTranscript = '';
  recognition.onresult = (e) => {
    interimTranscript = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalTranscript += e.results[i][0].transcript + ' ';
      else interimTranscript = e.results[i][0].transcript;
    }
    onResult?.(finalTranscript + interimTranscript, false);
  };
  recognition.onend = () => { isListening = false; updateMicUI(); onEnd?.(finalTranscript.trim()); };
  recognition.onerror = (e) => { if (e.error !== 'no-speech') console.error('Speech error:', e.error); };
  finalTranscript = '';
  isListening = true;
  updateMicUI();
  recognition.start();
}

function stopListening() {
  recognition?.stop();
  isListening = false;
  updateMicUI();
}

function updateMicUI() {
  const micBtn = $('mic-btn');
  const micIcon = micBtn?.querySelector('i');
  const waveVis = $('wave-visualizer');
  if (micBtn) {
    micBtn.className = isListening 
      ? 'w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all shadow-xl active:scale-90 border-2 mic-active text-white'
      : 'w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/30 active:scale-90 border-2 border-white/10';
  }
  if (micIcon) micIcon.className = isListening ? 'fas fa-stop' : 'fas fa-microphone';
  if (waveVis) waveVis.style.opacity = isListening ? '1' : '0';
}

function updateAvatarState() {
  const ring = $('avatar-ring');
  if (ring) {
    ring.className = isSpeaking 
      ? 'w-40 h-40 rounded-full border-4 border-primary-500 mb-4 relative p-1 transition-all duration-500 avatar-glow group avatar-ring' 
      : 'w-40 h-40 rounded-full border-4 border-white/5 mb-4 relative p-1 transition-all duration-500 avatar-glow group';
  }
  const statusText = $('avatar-status');
  if (statusText) statusText.textContent = isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Active Intelligence';
}

// ========== ROUTING ==========
function navigate(page, data) {
  currentPage = page;
  window.history.pushState({ page, data }, '', '/' + (page === 'landing' ? '' : page));
  render(data);
}

window.onpopstate = (e) => {
  const state = e.state || {};
  currentPage = state.page || 'landing';
  render(state.data);
};

// ========== AUTH ==========
async function checkAuth() {
  if (!currentToken) return false;
  try {
    const data = await api('/auth/me');
    currentUser = data.user;
    return true;
  } catch { logout(); return false; }
}

function logout() {
  currentToken = null;
  currentUser = null;
  localStorage.removeItem('ai_interview_token');
  navigate('landing');
}

async function handleLogin(e) {
  e.preventDefault();
  const email = $('login-email').value;
  const password = $('login-password').value;
  const btn = $('login-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Signing in...';
  try {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } });
    currentToken = data.token;
    currentUser = data.user;
    localStorage.setItem('ai_interview_token', data.token);
    showToast('Welcome back, ' + data.user.name + '!');
    navigate('dashboard');
  } catch (err) {
    showToast(err.message, 'error');
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Sign In';
}

async function handleSignup(e) {
  e.preventDefault();
  const name = $('signup-name').value;
  const email = $('signup-email').value;
  const password = $('signup-password').value;
  const btn = $('signup-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creating account...';
  try {
    const data = await api('/auth/signup', { method: 'POST', body: { name, email, password } });
    currentToken = data.token;
    currentUser = data.user;
    localStorage.setItem('ai_interview_token', data.token);
    showToast('Account created! Welcome, ' + data.user.name + '!');
    navigate('dashboard');
  } catch (err) {
    showToast(err.message, 'error');
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-user-plus mr-2"></i>Create Account';
}

// ========== RENDER ENGINE ==========
function render(data) {
  const app = $('app');
  destroyCharts();
  switch(currentPage) {
    case 'landing': app.innerHTML = renderLanding(); break;
    case 'login': app.innerHTML = renderLogin(); break;
    case 'signup': app.innerHTML = renderSignup(); break;
    case 'dashboard': app.innerHTML = renderDashboard(); loadDashboardData(); break;
    case 'new-interview': app.innerHTML = renderNewInterview(); loadResumes(); break;
    case 'interview': 
      app.innerHTML = renderInterview(); 
      // Auto-speak first question
      if (interviewState?.currentQuestion?.text) {
        setTimeout(() => speak(interviewState.currentQuestion.text), 800);
      }
      break;
    case 'results': app.innerHTML = renderResults(data); if(data) loadResults(data); break;
    case 'resumes': app.innerHTML = renderResumes(); loadResumesPage(); break;
    case 'history': app.innerHTML = renderHistory(); loadHistory(); break;
    case 'profile': app.innerHTML = renderProfile(); break;
    default: app.innerHTML = renderLanding();
  }
}

function destroyCharts() {
  Object.values(chartInstances).forEach(c => c?.destroy?.());
  chartInstances = {};
}

// ========== PAGE: LANDING ==========
function renderLanding() {
  return \`
  <div class="min-h-screen page-transition">
    <!-- Nav -->
    <nav class="fixed top-0 w-full z-50 glass border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
            <i class="fas fa-brain text-white text-sm sm:text-lg"></i>
          </div>
          <span class="text-base sm:text-xl font-bold gradient-text whitespace-nowrap">IntervAI</span>
        </div>
        <div class="flex items-center gap-1 sm:gap-3">
          <button onclick="navigate('login')" class="px-2 sm:px-5 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-xs sm:text-base whitespace-nowrap">Sign In</button>
          <button onclick="navigate('signup')" class="px-3 sm:px-5 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 text-xs sm:text-base whitespace-nowrap">Get Started</button>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="pt-32 pb-20 px-4">
      <div class="max-w-6xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 animate-fade-in">
          <i class="fas fa-sparkles"></i>
          <span>Next-Gen Interview Intelligence</span>
        </div>
        <h1 class="text-5xl sm:text-7xl font-extrabold text-gray-900 mb-6 leading-tight animate-slide-up">
          Elevate Your<br><span class="gradient-text">Career Potential</span>
        </h1>
        <p class="text-xl text-gray-500 max-w-2xl mx-auto mb-10 animate-slide-up" style="animation-delay:0.1s">
          Practice with an AI interviewer that adapts to your resume, analyzes your responses in real-time, and provides detailed performance insights.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style="animation-delay:0.2s">
          <button onclick="navigate('signup')" class="px-8 py-4 bg-primary-600 text-white rounded-2xl font-semibold text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 btn-glow">
            <i class="fas fa-play mr-2"></i>Start Practicing Free
          </button>
          <button onclick="navigate('login')" class="px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold text-lg hover:bg-gray-50 transition-all shadow-lg border border-gray-200">
            <i class="fas fa-sign-in-alt mr-2"></i>Sign In
          </button>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-20 px-4 bg-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold text-center text-gray-900 mb-4">Everything You Need</h2>
        <p class="text-gray-500 text-center mb-16 max-w-xl mx-auto">Comprehensive interview preparation powered by artificial intelligence</p>
        <div class="grid md:grid-cols-3 gap-8">
          \${[
            { icon: 'fa-brain', title: 'Cognitive AI Analysis', desc: 'Experience interviews powered by advanced neural models that evaluate depth, logic, and professional presence.', color: 'blue' },
            { icon: 'fa-file-shield', title: 'Resume Insight', desc: 'Securely upload your credentials for an AI-driven gap analysis between your profile and target roles.', color: 'purple' },
            { icon: 'fa-chart-pie', title: 'HR Analytics', desc: 'Receive precision scores on core competencies, technical readiness, and leadership potential.', color: 'green' },
            { icon: 'fa-bolt', title: 'Adaptive Coaching', desc: 'The system evolves with your performance, providing real-time feedback to accelerate your learning curve.', color: 'orange' },
            { icon: 'fa-microphone-lines', title: 'Voice Intelligence', desc: 'Execute natural voice interviews with multi-dialect support and sentiment detection.', color: 'red' },
            { icon: 'fa-award', title: 'Career Progress', desc: 'Access your historical baseline and trajectory to witness your evolution into a top-tier candidate.', color: 'teal' }
          ].map(f => \`
            <div class="p-8 rounded-2xl border border-gray-100 card-hover bg-white">
              <div class="w-14 h-14 rounded-2xl bg-\${f.color}-50 flex items-center justify-center mb-5">
                <i class="fas \${f.icon} text-\${f.color}-500 text-xl"></i>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">\${f.title}</h3>
              <p class="text-gray-500 text-sm leading-relaxed">\${f.desc}</p>
            </div>
          \`).join('')}
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-24 px-4 bg-white relative overflow-hidden">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-20">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Your Path to Mastery</h2>
          <p class="text-gray-500 max-w-xl mx-auto text-lg">Four sophisticated steps to transform your interview performance</p>
        </div>
        
        <div class="relative">
          <!-- Desktop line -->
          <div class="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 z-0"></div>
          
          <div class="grid md:grid-cols-4 gap-12 relative z-10">
            \${[
              { num: '01', icon: 'fa-user-plus', title: 'Seamless Intake', desc: 'Initialize your profile in seconds to begin your professional evolution.' },
              { num: '02', icon: 'fa-microchip', title: 'Resume Extraction', desc: 'Our neural models decompose your resume into core competencies and project milestones.' },
              { num: '03', icon: 'fa-comments', title: 'Interactive Drill', desc: 'Engage in a high-fidelity voice interview that adapts to your unique career trajectory.' },
              { num: '04', icon: 'fa-chart-line', title: 'Strategic Audit', desc: 'Receive precision HR analytics and a tactical roadmap for skill mastery.' }
            ].map(s => \`
              <div class="group text-center">
                <div class="w-20 h-20 rounded-2xl bg-white border-2 border-gray-50 flex items-center justify-center mx-auto mb-6 text-primary-600 shadow-sm transition-all group-hover:border-primary-500 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-primary-100 relative bg-white">
                  <span class="absolute -top-3 -right-3 w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-[10px] font-bold shadow-lg">\${s.num}</span>
                  <i class="fas \${s.icon} text-2xl"></i>
                </div>
                <h4 class="font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">\${s.title}</h4>
                <p class="text-gray-500 text-sm leading-relaxed px-4">\${s.desc}</p>
              </div>
            \`).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-10 px-4 bg-gray-900 text-gray-400">
      <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center"><i class="fas fa-brain text-white text-sm"></i></div>
          <span class="text-white font-semibold">IntervAI</span>
        </div>
        <p class="text-sm">&copy; 2026 IntervAI. Smart Practice for Success.</p>
      </div>
    </footer>
  </div>\`;
}

// ========== PAGE: LOGIN ==========
function renderLogin() {
  return \`
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-purple-50 page-transition">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-200">
            <i class="fas fa-brain text-white text-xl"></i>
          </div>
          <span class="text-3xl font-bold gradient-text">IntervAI</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p class="text-gray-500 mt-1">Sign in to continue your practice</p>
      </div>
      <form onsubmit="handleLogin(event)" class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div class="relative">
            <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input id="login-email" type="email" required placeholder="you@example.com" class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:border-primary-400 transition-all">
          </div>
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div class="relative">
            <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input id="login-password" type="password" required placeholder="••••••••" class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:border-primary-400 transition-all">
          </div>
        </div>
        <button id="login-btn" type="submit" class="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 btn-glow">
          <i class="fas fa-sign-in-alt mr-2"></i>Sign In
        </button>
        <p class="text-center text-gray-500 text-sm mt-6">Don't have an account? <a href="#" onclick="navigate('signup');return false" class="text-primary-600 font-medium hover:underline">Sign Up</a></p>
      </form>
      <button onclick="navigate('landing')" class="w-full text-center text-gray-400 hover:text-gray-600 text-sm mt-4 transition-colors"><i class="fas fa-arrow-left mr-1"></i>Back to home</button>
    </div>
  </div>\`;
}

// ========== PAGE: SIGNUP ==========
function renderSignup() {
  return \`
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-purple-50 page-transition">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary-200">
            <i class="fas fa-brain text-white text-xl"></i>
          </div>
          <span class="text-3xl font-bold gradient-text">IntervAI</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Create Account</h1>
        <p class="text-gray-500 mt-1">Start your interview practice journey</p>
      </div>
      <form onsubmit="handleSignup(event)" class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <div class="relative">
            <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input id="signup-name" type="text" required placeholder="John Doe" class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:border-primary-400 transition-all">
          </div>
        </div>
        <div class="mb-5">
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div class="relative">
            <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input id="signup-email" type="email" required placeholder="you@example.com" class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:border-primary-400 transition-all">
          </div>
        </div>
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div class="relative">
            <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input id="signup-password" type="password" required minlength="6" placeholder="Min 6 characters" class="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:bg-white focus:border-primary-400 transition-all">
          </div>
        </div>
        <button id="signup-btn" type="submit" class="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 btn-glow">
          <i class="fas fa-user-plus mr-2"></i>Create Account
        </button>
        <p class="text-center text-gray-500 text-sm mt-6">Already have an account? <a href="#" onclick="navigate('login');return false" class="text-primary-600 font-medium hover:underline">Sign In</a></p>
      </form>
      <button onclick="navigate('landing')" class="w-full text-center text-gray-400 hover:text-gray-600 text-sm mt-4 transition-colors"><i class="fas fa-arrow-left mr-1"></i>Back to home</button>
    </div>
  </div>\`;
}

// ========== NAVIGATION SIDEBAR ==========
function renderNav() {
  const items = [
    { page: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
    { page: 'new-interview', icon: 'fa-play-circle', label: 'New Interview' },
    { page: 'history', icon: 'fa-history', label: 'History' },
    { page: 'resumes', icon: 'fa-file-alt', label: 'Resumes' },
    { page: 'profile', icon: 'fa-user-circle', label: 'My Profile' },
  ];
  return \`
  <aside class="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 z-40 hidden lg:block">
    <div class="p-6">
      <div class="flex items-center gap-3 mb-10">
        <div class="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center"><i class="fas fa-brain text-white"></i></div>
        <span class="font-bold text-lg gradient-text">IntervAI</span>
      </div>
      <nav class="space-y-1">
        \${items.map(item => \`
          <button onclick="navigate('\${item.page}')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all \${currentPage === item.page ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}">
            <i class="fas \${item.icon} w-5 text-center"></i>
            <span>\${item.label}</span>
          </button>
        \`).join('')}
        
        \${(interviewState?.interviewId || localStorage.getItem('last_interview_id')) ? \`
        <button onclick="navigate('results', '\${interviewState?.interviewId || localStorage.getItem('last_interview_id')}')" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mt-6 \${currentPage === 'results' ? 'bg-purple-50 text-purple-700 border border-purple-100 font-bold' : 'bg-gray-50 text-gray-700 border border-gray-100 hover:bg-gray-100'}">
          <i class="fas fa-file-invoice w-5 text-center text-purple-500"></i>
          <span>Assessment Report</span>
        </button>
        \` : ''}
      </nav>
    </div>
    <div class="absolute bottom-0 left-0 w-full p-6 border-t border-gray-100 bg-white">
      <div class="flex items-center gap-3 mb-3">
        <div id="sidebar-avatar" class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm overflow-hidden border border-gray-100">
          \${localStorage.getItem('user_avatar_' + currentUser?.email) ? '<img src="' + localStorage.getItem('user_avatar_' + currentUser?.email) + '" class="w-full h-full object-cover">' : (currentUser?.name?.charAt(0) || 'U')}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">\${currentUser?.name || 'User'}</p>
          <p class="text-xs text-gray-500 truncate">\${currentUser?.email || ''}</p>
        </div>
      </div>
      <button onclick="logout()" class="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-100 lg:border-none">
        <i class="fas fa-sign-out-alt"></i><span>Sign Out</span>
      </button>
    </div>
  </aside>
  <!-- Mobile header -->
  <header class="lg:hidden fixed top-0 w-full z-40 glass border-b border-gray-100">
    <div class="flex items-center justify-between px-4 h-14">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center"><i class="fas fa-brain text-white text-sm"></i></div>
        <span class="font-bold gradient-text">IntervAI</span>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="navigate('profile')" class="w-9 h-9 rounded-full bg-primary-50 border border-primary-100 overflow-hidden flex items-center justify-center text-primary-600 font-bold text-xs">
          \${localStorage.getItem('user_avatar_' + currentUser?.email) ? '<img src="' + localStorage.getItem('user_avatar_' + currentUser?.email) + '" class="w-full h-full object-cover">' : (currentUser?.name?.charAt(0) || 'U')}
        </button>
        <button onclick="toggleMobileMenu()" class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100"><i class="fas fa-bars"></i></button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden bg-white border-t border-gray-100 p-4 space-y-1">
      \${items.map(item => \`
        <button onclick="navigate('\${item.page}');toggleMobileMenu()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium \${currentPage === item.page ? 'bg-primary-50 text-primary-700' : 'text-gray-600'}">
          <i class="fas \${item.icon} w-5"></i>\${item.label}
        </button>
      \`).join('')}
      \${(interviewState?.interviewId || localStorage.getItem('last_interview_id')) ? \`
        <button onclick="navigate('results', '\${interviewState?.interviewId || localStorage.getItem('last_interview_id')}');toggleMobileMenu()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-purple-50 text-purple-700">
          <i class="fas fa-file-invoice w-5"></i>Assessment Report
        </button>
      \` : ''}
      <button onclick="logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600"><i class="fas fa-sign-out-alt w-5"></i>Sign Out</button>
    </div>
  </header>\`;
}

function toggleMobileMenu() {
  const menu = $('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

function pageWrapper(content) {
  return \`\${renderNav()}<main class="lg:ml-64 pt-16 lg:pt-0 min-h-screen bg-gray-50 page-transition">\${content}</main>\`;
}

// ========== PAGE: DASHBOARD ==========
function renderDashboard() {
  return pageWrapper(\`
    <div class="p-4 sm:p-8 max-w-7xl mx-auto">
      <div class="mb-8 flex items-center gap-4">
        <div class="hidden sm:block w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white">
          \${localStorage.getItem('user_avatar_' + currentUser?.email) ? '<img src="' + localStorage.getItem('user_avatar_' + currentUser?.email) + '" class="w-full h-full object-cover">' : '<div class="w-full h-full gradient-bg flex items-center justify-center text-white text-2xl font-bold">' + (currentUser?.name?.charAt(0) || 'U') + '</div>'}
        </div>
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back, \${currentUser?.name?.split(' ')[0] || 'User'} <span class="inline-block animate-bounce-slow">👋</span></h1>
          <p class="text-gray-500 mt-1 uppercase tracking-wider text-[10px] font-bold">IntervAI Gold Member</p>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div id="stats-cards" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        \${[1,2,3,4].map(() => '<div class="h-28 rounded-2xl bg-white border border-gray-100 animate-pulse"></div>').join('')}
      </div>
      
      <!-- Quick Actions -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button onclick="navigate('new-interview')" class="p-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white card-hover text-left">
          <i class="fas fa-play-circle text-2xl mb-3 opacity-80"></i>
          <h3 class="font-semibold text-lg">Start Interview</h3>
          <p class="text-sm opacity-80 mt-1">Begin a new AI-powered practice session</p>
        </button>
        <button onclick="navigate('resumes')" class="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white card-hover text-left">
          <i class="fas fa-file-upload text-2xl mb-3 opacity-80"></i>
          <h3 class="font-semibold text-lg">Upload Resume</h3>
          <p class="text-sm opacity-80 mt-1">Get personalized interview questions</p>
        </button>
        <button onclick="navigate('history')" class="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 text-white card-hover text-left">
          <i class="fas fa-chart-line text-2xl mb-3 opacity-80"></i>
          <h3 class="font-semibold text-lg">View Progress</h3>
          <p class="text-sm opacity-80 mt-1">Track your improvement over time</p>
        </button>
      </div>

      <!-- Charts Row -->
      <div class="grid lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4"><i class="fas fa-chart-radar mr-2 text-primary-500"></i>Skills Radar</h3>
          <div class="relative" style="height:280px"><canvas id="radar-chart"></canvas></div>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 mb-4"><i class="fas fa-chart-line mr-2 text-green-500"></i>Score Trends</h3>
          <div class="relative" style="height:280px"><canvas id="trend-chart"></canvas></div>
        </div>
      </div>

      <!-- Recent Interviews & Analysis -->
      <div class="grid lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-hidden">
          <h3 class="text-lg font-semibold text-gray-900 mb-4"><i class="fas fa-history mr-2 text-blue-500"></i>Recent Interviews</h3>
          <div id="recent-interviews" class="space-y-3">
            <div class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl"></i></div>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-hidden">
          <h3 class="text-lg font-semibold text-gray-900 mb-4"><i class="fas fa-chart-bar mr-2 text-purple-500"></i>Performance by Type</h3>
          <div class="relative h-[250px] sm:h-[280px]"><canvas id="type-chart"></canvas></div>
        </div>
      </div>
    </div>
  \`);
}

async function loadDashboardData() {
  try {
    const data = await api('/dashboard/stats');
    const s = data.stats;
    const avg = s.averageScores;

    // Stats cards
    $('stats-cards').innerHTML = [
      { icon: 'fa-video', label: 'Total Interviews', value: s.totalInterviews, color: 'blue' },
      { icon: 'fa-check-circle', label: 'Completed', value: s.completedInterviews, color: 'green' },
      { icon: 'fa-star', label: 'Avg Score', value: avg.overall ? avg.overall + '/10' : 'N/A', color: 'yellow' },
      { icon: 'fa-file-alt', label: 'Resumes', value: s.totalResumes, color: 'purple' }
    ].map(c => \`
      <div class="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm animate-fade-in card-hover">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl bg-\${c.color}-50 flex items-center justify-center"><i class="fas \${c.icon} text-\${c.color}-500"></i></div>
        </div>
        <p class="text-2xl font-bold text-gray-900">\${c.value}</p>
        <p class="text-sm text-gray-500">\${c.label}</p>
      </div>
    \`).join('');

    // Radar chart
    if (avg.overall > 0) {
      const ctx = $('radar-chart')?.getContext('2d');
      if (ctx) chartInstances.radar = new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Overall', 'Communication', 'Technical', 'Confidence', 'Clarity'],
          datasets: [{
            label: 'Your Scores',
            data: [avg.overall, avg.communication, avg.technical, avg.confidence, avg.clarity],
            borderColor: 'rgba(59,130,246,0.8)',
            backgroundColor: 'rgba(59,130,246,0.15)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(59,130,246,1)',
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 10, ticks: { stepSize: 2 } } }, plugins: { legend: { display: false } } }
      });
    }

    // Trend chart
    if (data.scoreTrends?.length > 0) {
      const labels = data.scoreTrends.map((t,i) => 'Interview ' + (i+1));
      const ctx2 = $('trend-chart')?.getContext('2d');
      if (ctx2) chartInstances.trend = new Chart(ctx2, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Overall', data: data.scoreTrends.map(t => t.total_score), borderColor: '#3b82f6', tension: 0.4, fill: false },
            { label: 'Technical', data: data.scoreTrends.map(t => t.technical_score), borderColor: '#8b5cf6', tension: 0.4, fill: false },
            { label: 'Communication', data: data.scoreTrends.map(t => t.communication_score), borderColor: '#22c55e', tension: 0.4, fill: false },
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 10 } }, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true } } } }
      });
    }

    // Recent interviews
    if (data.recentInterviews?.length > 0) {
      $('recent-interviews').innerHTML = data.recentInterviews.slice(0, 5).map(i => \`
        <button onclick="navigate('results', '\${i.id}')" class="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all text-left group">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl \${i.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'} flex items-center justify-center">
              <i class="fas \${i.status === 'completed' ? 'fa-check' : 'fa-clock'}"></i>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 capitalize">\${i.type} Interview</p>
              <p class="text-xs text-gray-500">\${formatDate(i.started_at)}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            \${i.status === 'completed' ? '<span class="text-sm font-semibold ' + scoreColor(i.total_score) + '">' + i.total_score + '/10</span>' : '<span class="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">In Progress</span>'}
            <i class="fas fa-chevron-right text-gray-300 group-hover:text-gray-500 text-xs"></i>
          </div>
        </button>
      \`).join('');
    } else {
      $('recent-interviews').innerHTML = '<div class="text-center py-8"><i class="fas fa-video text-4xl text-gray-200 mb-3"></i><p class="text-gray-400">No interviews yet</p><button onclick="navigate(\\'new-interview\\')" class="mt-3 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm">Start Your First Interview</button></div>';
    }

    // Type chart
    if (data.typeStats?.length > 0) {
      const ctx3 = $('type-chart')?.getContext('2d');
      if (ctx3) chartInstances.typeChart = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: data.typeStats.map(t => t.type.charAt(0).toUpperCase() + t.type.slice(1)),
          datasets: [{
            label: 'Avg Score',
            data: data.typeStats.map(t => Math.round(t.avg_score * 10) / 10),
            backgroundColor: ['rgba(59,130,246,0.7)', 'rgba(139,92,246,0.7)', 'rgba(34,197,94,0.7)', 'rgba(249,115,22,0.7)'],
            borderRadius: 8,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 10 } }, plugins: { legend: { display: false } } }
      });
    }
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

// ========== PAGE: NEW INTERVIEW ==========
function renderNewInterview() {
  return pageWrapper(\`
    <div class="p-4 sm:p-8 max-w-3xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900"><i class="fas fa-play-circle mr-2 text-primary-500"></i>New Interview Session</h1>
        <p class="text-gray-500 mt-1">Configure your interview and start practicing</p>
      </div>

      <div class="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <!-- Interview Type -->
        <div class="mb-8">
          <label class="block text-sm font-semibold text-gray-700 mb-3">Interview Type</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="type-selector">
            \${['technical', 'hr', 'behavioral', 'mixed'].map(t => \`
              <button onclick="selectType('\${t}')" id="type-\${t}" class="p-4 rounded-xl border-2 transition-all text-center \${t === 'technical' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}">
                <i class="fas \${{technical:'fa-code',hr:'fa-users',behavioral:'fa-brain',mixed:'fa-random'}[t]} text-xl mb-2 \${t === 'technical' ? 'text-primary-600' : 'text-gray-400'}"></i>
                <p class="text-sm font-medium capitalize \${t === 'technical' ? 'text-primary-700' : 'text-gray-600'}">\${t}</p>
              </button>
            \`).join('')}
          </div>
        </div>

        <!-- Resume Selection -->
        <div class="mb-8">
          <label class="block text-sm font-semibold text-gray-700 mb-3">Resume (Optional)</label>
          <select id="resume-select" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 focus:bg-white focus:border-primary-400 transition-all">
            <option value="">No resume - General questions</option>
          </select>
          <p class="text-xs text-gray-400 mt-2"><i class="fas fa-info-circle mr-1"></i>Upload a resume in the Resumes section for personalized questions</p>
        </div>

        <!-- Language -->
        <div class="mb-8">
          <label class="block text-sm font-semibold text-gray-700 mb-3">Language</label>
          <select id="language-select" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-50 focus:bg-white focus:border-primary-400 transition-all">
            <option value="en">English (Professional)</option>
          </select>
        </div>

        <!-- Start Button -->
        <button id="start-interview-btn" onclick="startInterview()" class="w-full py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 btn-glow">
          <i class="fas fa-video mr-2"></i>Start Interview
        </button>
      </div>
    </div>
  \`);
}

let selectedType = 'technical';
function selectType(t) {
  selectedType = t;
  ['technical','hr','behavioral','mixed'].forEach(x => {
    const el = $('type-' + x);
    if (el) {
      el.className = x === t
        ? 'p-4 rounded-xl border-2 transition-all text-center border-primary-500 bg-primary-50'
        : 'p-4 rounded-xl border-2 transition-all text-center border-gray-200 hover:border-gray-300';
      el.querySelector('i').className = el.querySelector('i').className.replace(/text-primary-600|text-gray-400/g, x === t ? 'text-primary-600' : 'text-gray-400');
      el.querySelector('p').className = 'text-sm font-medium capitalize ' + (x === t ? 'text-primary-700' : 'text-gray-600');
    }
  });
}

async function loadResumes() {
  try {
    const data = await api('/resumes');
    const sel = $('resume-select');
    if (sel && data.resumes) {
      data.resumes.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.filename + ' (' + formatDate(r.uploaded_at) + ')';
        sel.appendChild(opt);
      });
    }
  } catch {}
}

async function startInterview() {
  const btn = $('start-interview-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Preparing interview...';
  try {
    const resumeId = $('resume-select')?.value || null;
    const language = $('language-select')?.value || 'en';
    const data = await api('/interviews/start', {
      method: 'POST',
      body: { resumeId, type: selectedType, language }
    });
    interviewState = {
      interviewId: data.interview.id,
      currentQuestion: data.currentQuestion,
      questionNumber: 1,
      totalQuestions: 8,
      answers: [],
      type: selectedType
    };
    interviewActive = true;
    navigate('interview');
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-video mr-2"></i>Start Interview';
  }
}

// ========== PAGE: INTERVIEW ==========
function renderInterview() {
  if (!interviewState) { navigate('new-interview'); return ''; }
  const q = interviewState.currentQuestion;
  return \`
  <div class="min-h-screen bg-[#0f172a] text-white page-transition font-sans">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-white/5 gap-3 glass-dark z-50 sticky top-0">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-900/20">
          <i class="fas fa-brain text-white text-lg"></i>
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-base tracking-tight capitalize">\${interviewState.type} Session</span>
          <span class="text-[10px] text-primary-400 font-bold uppercase tracking-widest">IntervAI Professional</span>
        </div>
      </div>
      <div class="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
        <div class="flex items-center gap-3 flex-1 sm:flex-initial">
          <div class="flex flex-col items-end">
            <span class="text-[10px] text-gray-400 uppercase font-bold">Progress</span>
            <span class="text-xs font-semibold" id="q-counter">\${interviewState.questionNumber}/\${interviewState.totalQuestions}</span>
          </div>
          <div class="w-24 sm:w-32 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
            <div id="progress-bar" class="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style="width:\${(interviewState.questionNumber / interviewState.totalQuestions) * 100}%"></div>
          </div>
        </div>
        <button onclick="endInterview()" class="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all border border-red-500/20 flex-shrink-0 active:scale-95 group">
          <i class="fas fa-power-off mr-2 group-hover:rotate-12 transition-transform"></i>Terminate
        </button>
      </div>
    </div>

    <!-- Main Interview Area -->
    <div class="flex flex-col items-center px-4 py-12 max-w-5xl mx-auto">
      <!-- AI Avatar Area -->
      <div class="flex flex-col items-center mb-10 w-full">
        <div id="avatar-ring" class="w-40 h-40 rounded-full border-4 border-white/5 mb-4 relative p-1 transition-all duration-500 avatar-glow group">
          <div class="w-full h-full rounded-full overflow-hidden border-2 border-primary-500/30">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400" alt="Sarah" class="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-500">
          </div>
          <div class="absolute inset-0 rounded-full bg-gradient-to-t from-[#0f172a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
             <span class="text-[10px] font-bold tracking-widest uppercase text-white/60">IntervAI Sarah</span>
          </div>
        </div>
        <div class="text-center">
          <h2 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Sarah</h2>
          <div class="flex items-center justify-center gap-2 mt-1">
             <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             <p id="avatar-status" class="text-xs text-gray-400 font-medium uppercase tracking-widest">Active Intelligence</p>
          </div>
        </div>
        
        <!-- Sound wave visualization -->
        <div id="wave-visualizer" class="flex items-center gap-1.5 mt-6 h-10 opacity-0 transition-opacity">
          \${[1,2,3,4,5,6,7].map(() => '<div class="wave-bar w-1.5 bg-primary-500/80 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" style="height:' + (8 + Math.random()*20) + 'px"></div>').join('')}
        </div>
      </div>

      <!-- Content Container -->
      <div class="w-full space-y-6">
        <!-- Question Card -->
        <div class="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl group-hover:bg-primary-600/20 transition-all"></div>
          <div class="flex items-start gap-5 relative z-10">
            <div class="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center flex-shrink-0 border border-primary-500/20">
              <i class="fas fa-quote-left text-primary-400"></i>
            </div>
            <div class="flex-1">
              <p id="question-text" class="text-xl sm:text-2xl font-medium leading-relaxed text-gray-100">\${q.text}</p>
              <div class="mt-4 flex items-center gap-2">
                <button onclick="speakQuestion()" class="px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-[10px] font-bold uppercase tracking-wider border border-primary-500/20 hover:bg-primary-500/20 transition-all">
                  <i class="fas fa-volume-high mr-1"></i>Listen
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Feedback Container -->
        <div id="ai-feedback" class="hidden animate-slide-up">
          <div class="w-full bg-white/[0.05] border border-white/10 rounded-3xl p-6 ring-1 ring-white/5">
             <!-- Feedback content injected here -->
          </div>
        </div>

        <!-- Answer Toolset -->
        <div class="pt-4 flex flex-col items-center gap-8">
          <div class="relative w-full max-w-2xl px-4">
            <textarea id="answer-textarea" placeholder="Respond naturally or use the microphone..." class="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-gray-200 placeholder:text-gray-500 focus:bg-white/[0.08] focus:border-primary-500/50 transition-all resize-none text-lg leading-relaxed shadow-inner"></textarea>
            
            <div class="absolute bottom-6 right-10 flex items-center gap-3">
               <button id="mic-btn" onclick="toggleVoiceInput()" class="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/30 active:scale-90 border-2 border-white/10">
                 <i class="fas fa-microphone"></i>
               </button>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="flex items-center gap-4 w-full justify-center px-4">
            <button onclick="skipQuestion()" class="flex-1 max-w-[160px] py-4 rounded-xl border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/5 transition-all active:scale-95 uppercase tracking-widest">
              <i class="fas fa-forward mr-2 text-xs"></i>Skip
            </button>
            <button id="submit-answer-btn" onclick="submitAnswer()" class="flex-[2] max-w-[320px] py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-200 transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center justify-center gap-3 group">
              <span>Analyze Answer</span>
              <i class="fas fa-arrow-right text-sm group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>\`;
}

function speakQuestion() {
  const text = $('question-text')?.textContent;
  if (text) speak(text);
}

function toggleVoiceInput() {
  if (isListening) {
    stopListening();
  } else {
    stopSpeaking();
    startListening(
      (transcript) => { if ($('answer-textarea')) $('answer-textarea').value = transcript; },
      (final) => { if ($('answer-textarea') && final) $('answer-textarea').value = final; }
    );
  }
}

async function submitAnswer(isFastSkip = false) {
  if (!interviewState || !interviewActive) return;
  const answer = $('answer-textarea')?.value?.trim() || '';
  
  // If it's a skip and nothing is typed, we inform the backend it's an explicit skip
  const explicitSkip = isFastSkip && !answer;

  stopListening();
  stopSpeaking();

  const btn = $('submit-answer-btn');
  const skipBtn = document.querySelector('button[onclick="skipQuestion()"]');
  
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>' + (isFastSkip ? 'Skipping...' : 'Analyzing...');
  }
  if (skipBtn) skipBtn.disabled = true;

  try {
    const data = await api('/interviews/' + interviewState.interviewId + '/answer', {
      method: 'POST',
      body: { 
        questionId: interviewState.currentQuestion.id, 
        answerText: answer,
        isSkip: explicitSkip
      }
    });

    if (!interviewActive) return;

    if (data.completed) {
      showToast('Interview completed! Generating results...', 'success');
      localStorage.setItem('last_interview_id', interviewState.interviewId);
      interviewState.lastResponse = null;
      stopSpeaking(); 
      setTimeout(() => navigate('results', interviewState.interviewId), 1500);
      return;
    }

    interviewState.lastResponse = data;

    // Show feedback only if NOT a fast skip
    if (data.analysis && !isFastSkip) {
      const fb = $('ai-feedback');
      if (fb) {
        fb.classList.remove('hidden');
        fb.innerHTML = \`
          <div class="w-full bg-white/[0.05] border border-white/10 rounded-3xl p-6 ring-1 ring-white/5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30 text-primary-400">
                   <i class="fas fa-chart-simple"></i>
                </div>
                <div>
                   <p class="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Performance Score</p>
                   <p class="text-xl font-bold \${scoreColor(data.analysis.score)}">\${data.analysis.score}/10</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                \${[
                  { l: 'Comm', v: data.analysis.communication },
                  { l: 'Tech', v: data.analysis.technical },
                  { l: 'Conf', v: data.analysis.confidence },
                  { l: 'Clar', v: data.analysis.clarity }
                ].map(s => \`
                  <span class="text-[9px] px-2.5 py-1 rounded-lg \${scoreBg(s.v)} border border-white/5 font-bold uppercase">\${s.l}: \${s.v}</span>
                \`).join('')}
              </div>
            </div>
            <div class="pt-4 border-t border-white/5">
               <p class="text-gray-300 leading-relaxed text-sm"><i class="fas fa-robot mr-2 text-primary-400"></i>\${data.analysis.feedback}</p>
            </div>
          </div>
        \`;
      }

      // Speak feedback then move to next
      speak('Good. ' + (data.analysis.feedback || ''), () => {
        if (!interviewActive) return;
        setTimeout(() => moveToNextQuestion(data), 1000);
      });
    } else {
      // For skips, just move on immediately
      moveToNextQuestion(data);
    }
  } catch (err) {
    showToast(err.message, 'error');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Submit Answer';
    }
    if (skipBtn) skipBtn.disabled = false;
  }
}

function moveToNextQuestion(data) {
  if (!data || !interviewActive) return;
  interviewState.lastResponse = null;
  if (data.nextQuestion) {
    interviewState.currentQuestion = data.nextQuestion;
    interviewState.questionNumber = data.nextQuestion.questionNumber || (interviewState.questionNumber + 1);
    
    // Update UI
    const qText = $('question-text');
    if (qText) {
      qText.textContent = data.nextQuestion.text;
    }
    
    const counter = $('q-counter');
    if (counter) counter.textContent = interviewState.questionNumber;
    
    const progress = $('progress-bar');
    if (progress) progress.style.width = (interviewState.questionNumber / interviewState.totalQuestions * 100) + '%';
    
    const textarea = $('answer-textarea');
    if (textarea) textarea.value = '';
    
    const fb = $('answer-feedback');
    if (fb) fb.classList.add('hidden');
    
    const btn = $('submit-answer-btn');
    const skipBtn = document.querySelector('button[onclick="skipQuestion()"]');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Submit Answer'; }
    if (skipBtn) skipBtn.disabled = false;

    // Speak the question
    speak(data.nextQuestion.text);
  }
}

function skipQuestion() {
  // If feedback is visible, "Skip" should just move to the next question immediately
  const fb = $('answer-feedback');
  if (fb && !fb.classList.contains('hidden') && interviewState?.lastResponse) {
    stopSpeaking();
    moveToNextQuestion(interviewState.lastResponse);
  } else {
    // Normal skip of a question not yet answered
    submitAnswer(true);
  }
}

function endInterview() {
  if (confirm('Are you sure you want to end this interview?')) {
    interviewActive = false;
    stopListening();
    stopSpeaking();
    navigate('results', interviewState?.interviewId);
  }
}

// ========== PAGE: RESULTS ==========
function renderResults(interviewId) {
  return pageWrapper(\`
    <div class="print-only hidden mb-8 text-center border-b-2 border-primary-600 pb-6">
      <h2 class="text-3xl font-bold uppercase tracking-widest text-primary-700">HR Assessment Report</h2>
      <p class="text-gray-500">Generated by AI Interviewer VIP Intelligence</p>
    </div>
    <div class="p-4 sm:p-8 max-w-5xl mx-auto">
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between no-print gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2"><i class="fas fa-chart-bar text-primary-500"></i>Interview Results</h1>
          <p class="text-gray-500 mt-1">Detailed performance analysis</p>
        </div>
        <button onclick="printReport()" class="w-full sm:w-auto px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg font-medium btn-glow">
          <i class="fas fa-file-pdf"></i>Generate PDF Report
        </button>
      </div>
      <div id="results-content">
        <div class="text-center py-20"><i class="fas fa-spinner fa-spin text-4xl text-primary-500"></i><p class="text-gray-500 mt-4">Loading results...</p></div>
      </div>
    </div>
  \`);
}

async function loadResults(interviewId) {
  try {
    localStorage.setItem('last_interview_id', interviewId);
    const data = await api('/interviews/' + interviewId);
    const i = data.interview;
    const qs = data.questions || [];

    $('results-content').innerHTML = \`
      <!-- Score Overview -->
      <div class="grid sm:grid-cols-5 gap-4 mb-8">
        \${[
          { label: 'Overall', score: i.total_score, icon: 'fa-star', color: 'blue' },
          { label: 'Communication', score: i.communication_score, icon: 'fa-comments', color: 'green' },
          { label: 'Technical', score: i.technical_score, icon: 'fa-code', color: 'purple' },
          { label: 'Confidence', score: i.confidence_score, icon: 'fa-shield-alt', color: 'orange' },
          { label: 'Clarity', score: i.clarity_score, icon: 'fa-eye', color: 'teal' }
        ].map(s => \`
          <div class="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center card-hover">
            <div class="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-\${s.color}-50">
              <i class="fas \${s.icon} text-\${s.color}-500"></i>
            </div>
            <p class="text-3xl font-bold \${scoreColor(s.score)}">\${s.score || 0}</p>
            <p class="text-xs text-gray-500 mt-1">\${s.label}</p>
          </div>
        \`).join('')}
      </div>

      <!-- Charts -->
      <div class="grid lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 class="font-semibold text-gray-900 mb-4">Skills Breakdown</h3>
          <div style="height:260px"><canvas id="results-radar"></canvas></div>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 class="font-semibold text-gray-900 mb-4">Per-Question Scores</h3>
          <div style="height:260px"><canvas id="results-bar"></canvas></div>
        </div>
      </div>

      <!-- Feedback & VIP Analytics -->
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-gray-900"><i class="fas fa-comment-dots mr-2 text-primary-500"></i>Overall Feedback</h3>
          \${i.language === 'ur' ? '<span class="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] uppercase font-bold tracking-tight border border-purple-100"><i class="fas fa-language mr-1"></i>Bilingual Fluency Verified</span>' : ''}
        </div>
        <p class="text-gray-600 leading-relaxed mb-6">\${i.overall_feedback || 'No feedback available'}</p>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="p-4 rounded-xl bg-green-50/50 border border-green-100">
            <h4 class="font-medium text-green-700 mb-2 flex items-center gap-1.5"><i class="fas fa-thumbs-up text-xs"></i>Strengths</h4>
            <ul class="space-y-1">\${(i.strengths || []).map(s => '<li class="text-sm text-gray-600 flex items-start gap-2"><i class="fas fa-check text-green-500 mt-1 text-[10px]"></i>' + s + '</li>').join('')}</ul>
          </div>
          <div class="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
            <h4 class="font-medium text-orange-700 mb-2 flex items-center gap-1.5"><i class="fas fa-exclamation-circle text-xs"></i>Skill Gaps</h4>
            <ul class="space-y-1">\${(i.skill_gaps || []).length ? (i.skill_gaps || []).map(w => '<li class="text-sm text-gray-600 flex items-start gap-2"><i class="fas fa-circle text-orange-400 mt-1 text-[6px] py-1.5"></i>' + w + '</li>').join('') : '<li class="text-xs text-gray-400 italic">Analytical trace not found</li>'}</ul>
          </div>
          <div class="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <h4 class="font-medium text-blue-700 mb-2 flex items-center gap-1.5"><i class="fas fa-map-marked-alt text-xs"></i>Study Roadmap</h4>
            <ul class="space-y-1">\${(i.learning_roadmap || []).length ? (i.learning_roadmap || []).map(imp => '<li class="text-sm text-gray-600 flex items-start gap-2"><i class="fas fa-arrow-right text-blue-500 mt-1 text-[10px]"></i>' + imp + '</li>').join('') : '<li class="text-xs text-gray-400 italic">Learning path pending</li>'}</ul>
          </div>
          <div class="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
            <h4 class="font-medium text-purple-700 mb-2 flex items-center gap-1.5"><i class="fas fa-lightbulb text-xs"></i>Next Steps</h4>
            <ul class="space-y-1">\${(i.improvements || []).map(imp => '<li class="text-sm text-gray-600 flex items-start gap-2"><i class="fas fa-bolt text-purple-400 mt-1 text-[10px]"></i>' + imp + '</li>').join('')}</ul>
          </div>
        </div>
      </div>

      <!-- Question Details -->
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <h3 class="font-semibold text-gray-900 mb-4"><i class="fas fa-list mr-2 text-purple-500"></i>Question Details</h3>
        <div class="space-y-4">
          \${qs.map((q, idx) => \`
            <div class="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">\${idx + 1}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 capitalize">\${q.question_type}</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 capitalize">\${q.difficulty}</span>
                </div>
                <span class="text-sm font-bold \${scoreColor(q.score)}">\${q.score || 0}/10</span>
              </div>
              <p class="text-sm font-medium text-gray-900 mb-2">\${q.question_text}</p>
              \${q.answer_text ? '<p class="text-sm text-gray-600 mb-2 bg-white p-3 rounded-lg border border-gray-100"><i class="fas fa-user text-xs text-gray-400 mr-1"></i>' + q.answer_text + '</p>' : '<p class="text-sm text-gray-400 italic">Skipped</p>'}
              \${q.feedback ? '<p class="text-xs text-gray-500 mt-1"><i class="fas fa-comment text-primary-400 mr-1"></i>' + q.feedback + '</p>' : ''}
            </div>
          \`).join('')}
        </div>
      </div>

      <div class="flex gap-4 no-print">
        <button onclick="navigate('new-interview')" class="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all"><i class="fas fa-redo mr-2"></i>New Interview</button>
        <button onclick="navigate('dashboard')" class="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"><i class="fas fa-th-large mr-2"></i>Dashboard</button>
      </div>
    \`;

    // Render charts
    setTimeout(() => {
      const radarCtx = $('results-radar')?.getContext('2d');
      if (radarCtx) chartInstances.resultsRadar = new Chart(radarCtx, {
        type: 'radar',
        data: {
          labels: ['Communication', 'Technical', 'Confidence', 'Clarity'],
          datasets: [{
            label: 'Score',
            data: [i.communication_score, i.technical_score, i.confidence_score, i.clarity_score],
            borderColor: 'rgba(59,130,246,0.8)',
            backgroundColor: 'rgba(59,130,246,0.15)',
            borderWidth: 2
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 10 } }, plugins: { legend: { display: false } } }
      });

      const barCtx = $('results-bar')?.getContext('2d');
      if (barCtx && qs.length) chartInstances.resultsBar = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: qs.map((q, i) => 'Q' + (i + 1)),
          datasets: [{
            label: 'Score',
            data: qs.map(q => q.score || 0),
            backgroundColor: qs.map(q => q.score >= 7 ? 'rgba(34,197,94,0.7)' : q.score >= 4 ? 'rgba(59,130,246,0.7)' : 'rgba(239,68,68,0.7)'),
            borderRadius: 6
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { min: 0, max: 10 } }, plugins: { legend: { display: false } } }
      });
    }, 100);
  } catch (err) {
    $('results-content').innerHTML = '<div class="text-center py-20"><i class="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i><p class="text-gray-500">Could not load results</p><button onclick="navigate(\\'dashboard\\')" class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl">Go to Dashboard</button></div>';
  }
}

// ========== PAGE: RESUMES ==========
function renderResumes() {
  return pageWrapper(\`
    <div class="p-4 sm:p-8 max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900"><i class="fas fa-file-alt mr-2 text-purple-500"></i>My Resumes</h1>
          <p class="text-gray-500 mt-1">Upload and manage your resumes</p>
        </div>
      </div>

      <!-- Upload Section -->
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <h3 class="font-semibold text-gray-900 mb-4">Upload New Resume</h3>
        <p class="text-sm text-gray-500 mb-4">Paste your resume text below. The AI will extract skills, experience, and projects to personalize your interview questions.</p>
        <textarea id="resume-text-input" rows="8" class="w-full border border-gray-200 rounded-xl p-4 text-gray-900 bg-gray-50 focus:bg-white focus:border-primary-400 transition-all resize-none text-sm" placeholder="Paste your resume content here...&#10;&#10;Example:&#10;John Doe - Software Engineer&#10;Skills: JavaScript, React, Node.js, Python&#10;Experience: 5 years at Tech Corp..."></textarea>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
          <input id="resume-filename" type="text" placeholder="Resume name (e.g., My Resume 2026)" class="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 bg-gray-50 focus:bg-white focus:border-primary-400 transition-all">
          <button id="upload-resume-btn" onclick="uploadResume()" class="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center justify-center">
            <i class="fas fa-upload mr-2"></i>Analyze & Save
          </button>
        </div>
      </div>

      <!-- Resume List -->
      <div id="resume-list">
        <div class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-gray-300"></i></div>
      </div>
    </div>
  \`);
}

async function uploadResume() {
  const text = $('resume-text-input')?.value?.trim();
  const filename = $('resume-filename')?.value?.trim() || 'My Resume';
  if (!text) { showToast('Please paste your resume content', 'warning'); return; }

  const btn = $('upload-resume-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analyzing...';

  try {
    await api('/resumes/upload', { method: 'POST', body: { text, filename } });
    showToast('Resume analyzed and saved!');
    $('resume-text-input').value = '';
    $('resume-filename').value = '';
    loadResumesPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-upload mr-2"></i>Analyze & Save';
}

async function loadResumesPage() {
  try {
    const data = await api('/resumes');
    const list = $('resume-list');
    if (!data.resumes?.length) {
      list.innerHTML = '<div class="text-center py-12 bg-white rounded-2xl border border-gray-100"><i class="fas fa-file-alt text-4xl text-gray-200 mb-3"></i><p class="text-gray-400">No resumes uploaded yet</p></div>';
      return;
    }
    list.innerHTML = data.resumes.map(r => {
      const p = r.parsed_data || {};
      return \`
        <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-4 card-hover animate-fade-in">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-gray-900">\${r.filename}</h3>
              <p class="text-sm text-gray-500">Uploaded \${formatDate(r.uploaded_at)}</p>
            </div>
            <button onclick="deleteResume('\${r.id}')" class="text-gray-400 hover:text-red-500 transition-colors"><i class="fas fa-trash"></i></button>
          </div>
          \${p.skills?.length ? '<div class="mb-3"><p class="text-xs font-medium text-gray-500 mb-2">Skills</p><div class="flex flex-wrap gap-1.5">' + p.skills.slice(0, 15).map(s => '<span class="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">' + s + '</span>').join('') + '</div></div>' : ''}
          \${p.expertise_level ? \`<p class="text-xs text-gray-500">Level: <span class="font-medium text-gray-700 capitalize">\${p.expertise_level}</span> &middot; Experience: <span class="font-medium text-gray-700">\${(p.years_of_experience !== undefined && p.years_of_experience !== null) ? (String(p.years_of_experience).toLowerCase().includes('year') || String(p.years_of_experience).toLowerCase().includes('month') ? p.years_of_experience : p.years_of_experience + ' years') : 'N/A'}</span></p>\` : ''}
        </div>
      \`;
    }).join('');
  } catch (err) {
    $('resume-list').innerHTML = '<p class="text-red-500 text-center">Error loading resumes</p>';
  }
}

async function deleteResume(id) {
  if (!confirm('Delete this resume?')) return;
  try {
    await api('/resumes/' + id, { method: 'DELETE' });
    showToast('Resume deleted');
    loadResumesPage();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ========== PAGE: PROFILE ==========
function renderProfile() {
  const avatar = localStorage.getItem('user_avatar_' + currentUser?.email);
  return pageWrapper(\`
    <div class="p-4 sm:p-8 max-w-2xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900"><i class="fas fa-user-circle mr-2 text-primary-500"></i>My Profile</h1>
        <p class="text-gray-500 mt-1">Manage your account and interview presence</p>
      </div>

      <div class="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-6">
        <div class="flex flex-col items-center mb-8">
          <div class="relative group">
            <div id="profile-avatar-preview" class="w-32 h-32 rounded-full border-4 border-gray-50 overflow-hidden bg-primary-50 flex items-center justify-center text-primary-300 text-4xl font-bold mb-4 shadow-inner">
              \${avatar ? '<img src="' + avatar + '" class="w-full h-full object-cover">' : (currentUser?.name?.charAt(0) || 'U')}
            </div>
            <label class="absolute bottom-4 right-0 w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-all border-4 border-white">
              <i class="fas fa-camera text-sm"></i>
              <input type="file" class="hidden" accept="image/*" onchange="handleAvatarUpload(event)">
            </label>
          </div>
          <h2 class="text-xl font-bold text-gray-900">\${currentUser?.name}</h2>
          <p class="text-gray-500">\${currentUser?.email}</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input id="profile-name" type="text" value="\${currentUser?.name}" class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input id="profile-email" type="email" value="\${currentUser?.email}" class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all">
          </div>
          <button id="save-profile-btn" onclick="updateProfile()" class="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 mt-4">
            Save Changes
          </button>
          <div class="pt-4 border-t border-gray-50">
            <p class="text-xs text-center text-gray-400">Account security (password reset) is coming soon in the next VIP update.</p>
          </div>
        </div>
      </div>
    </div>
  \`);
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 1024 * 1024) { showToast('Image too large. Please use an image under 1MB', 'warning'); return; }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    localStorage.setItem('user_avatar_' + currentUser?.email, base64);
    showToast('Profile photo updated successfully!');
    render(); // Re-render current page
  };
  reader.readAsDataURL(file);
}

async function updateProfile() {
  const name = $('profile-name')?.value?.trim();
  const email = $('profile-email')?.value?.trim();

  if (!name || !email) { showToast('Name and email are required', 'warning'); return; }

  const btn = $('save-profile-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';

  try {
    const data = await api('/auth/profile', {
      method: 'PATCH',
      body: { name, email }
    });
    
    // Update local state
    currentUser = data.user;
    currentToken = data.token;
    localStorage.setItem('ai_interview_token', data.token);
    
    showToast('Profile updated successfully!');
    render(); // Full re-render to update sidebar etc.
  } catch (err) {
    showToast(err.message, 'error');
  }
  
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = 'Save Changes';
  }
}

// ========== PAGE: HISTORY ==========
function renderHistory() {
  return pageWrapper(\`
    <div class="p-4 sm:p-8 max-w-5xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900"><i class="fas fa-history mr-2 text-blue-500"></i>Interview History</h1>
        <p class="text-gray-500 mt-1">Review your past interviews and track progress</p>
      </div>
      <div id="history-list">
        <div class="text-center py-12"><i class="fas fa-spinner fa-spin text-3xl text-gray-300"></i></div>
      </div>
    </div>
  \`);
}

async function loadHistory() {
  try {
    const data = await api('/interviews');
    const list = $('history-list');
    if (!data.interviews?.length) {
      list.innerHTML = '<div class="text-center py-16 bg-white rounded-2xl border border-gray-100"><i class="fas fa-video text-5xl text-gray-200 mb-4"></i><p class="text-gray-400 mb-4">No interviews yet</p><button onclick="navigate(\\'new-interview\\')" class="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium">Start Your First Interview</button></div>';
      return;
    }
    list.innerHTML = data.interviews.map(i => \`
      <button onclick="navigate('results', '\${i.id}')" class="w-full bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-4 card-hover animate-fade-in text-left">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl \${i.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'} flex items-center justify-center">
              <i class="fas \${i.status === 'completed' ? 'fa-check-circle' : 'fa-clock'} text-lg"></i>
            </div>
            <div>
              <p class="font-semibold text-gray-900 capitalize">\${i.type} Interview</p>
              <p class="text-sm text-gray-500">\${formatDate(i.started_at)}</p>
            </div>
          </div>
            <div class="flex items-center gap-4">
              \${i.status === 'completed' ? \`
                <div class="hidden sm:flex items-center gap-3">
                  <div class="text-center"><p class="text-xs text-gray-500">Overall</p><p class="font-bold \${scoreColor(i.total_score)}">\${i.total_score}</p></div>
                  <div class="text-center"><p class="text-xs text-gray-500">Comm</p><p class="font-bold text-sm \${scoreColor(i.communication_score)}">\${i.communication_score}</p></div>
                  <div class="text-center"><p class="text-xs text-gray-500">Tech</p><p class="font-bold text-sm \${scoreColor(i.technical_score)}">\${i.technical_score}</p></div>
                </div>
                <span class="sm:hidden text-lg font-bold \${scoreColor(i.total_score)}">\${i.total_score}/10</span>
              \` : '<span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">In Progress</span>'}
              <button onclick="deleteInterview(event, '\${i.id}')" class="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <i class="fas fa-trash-alt"></i>
              </button>
              <i class="fas fa-chevron-right text-gray-300 text-sm"></i>
            </div>
        </div>
      </button>
    \`).join('');
  } catch (err) {
    $('history-list').innerHTML = '<p class="text-red-500 text-center">Error loading history</p>';
  }
}

async function deleteInterview(e, id) {
  e.stopPropagation();
  if (!confirm('Delete this interview from your history?')) return;
  try {
    await api('/interviews/' + id, { method: 'DELETE' });
    showToast('Interview deleted');
    loadHistory();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ========== INIT ==========
async function init() {
  const isAuthed = await checkAuth();
  const path = window.location.pathname.replace('/', '') || 'landing';
  const protectedPages = ['dashboard', 'new-interview', 'interview', 'results', 'resumes', 'history'];
  
  if (isAuthed && (path === 'landing' || path === 'login' || path === 'signup' || path === '')) {
    currentPage = 'dashboard';
  } else if (!isAuthed && protectedPages.includes(path)) {
    currentPage = 'landing';
  } else {
    currentPage = path || 'landing';
  }
  
  // Load voices
  if (speechSynth) speechSynth.onvoiceschanged = () => speechSynth.getVoices();
  
  render();
}

// Start the app
init();
  `;
}
