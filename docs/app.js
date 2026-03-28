(() => {
    'use strict';

    const MANIFEST_URL = 'sounds/manifest.json';
    let soundFiles = [];
    let timerIdCounter = 0;

    // Each timer state
    // { id, intervalId, remaining, total, running, audio }
    const timers = new Map();

    // ---- Load sound manifest ----
    async function loadManifest() {
        try {
            const res = await fetch(MANIFEST_URL);
            if (!res.ok) throw new Error('manifest fetch failed');
            const data = await res.json();
            soundFiles = Array.isArray(data.sounds) ? data.sounds.filter(f => typeof f === 'string' && f.trim()) : [];
        } catch {
            soundFiles = [];
        }
    }

    function pickRandomSound() {
        if (!soundFiles.length) return null;
        const name = soundFiles[Math.floor(Math.random() * soundFiles.length)];
        return `sounds/${name}`;
    }

    // ---- DOM helpers ----
    const template = document.getElementById('timer-template');
    const container = document.getElementById('timers-container');

    function formatTime(totalSeconds) {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function createTimerCard() {
        const id = ++timerIdCounter;
        const frag = template.content.cloneNode(true);
        const card = frag.querySelector('.timer-card');

        card.dataset.id = id;

        const display    = card.querySelector('.timer-display');
        const labelInput = card.querySelector('.timer-label');
        const minInput   = card.querySelector('.input-minutes');
        const secInput   = card.querySelector('.input-seconds');
        const startBtn   = card.querySelector('.btn-start');
        const stopBtn    = card.querySelector('.btn-stop');
        const resetBtn   = card.querySelector('.btn-reset');
        const deleteBtn  = card.querySelector('.btn-delete');
        const statusEl   = card.querySelector('.timer-status');

        // Timer state
        const state = {
            id,
            intervalId: null,
            remaining: 0,
            total: 0,
            running: false,
            audio: null,
        };
        timers.set(id, state);

        function getInputSeconds() {
            const m = Math.max(0, parseInt(minInput.value, 10) || 0);
            const s = Math.min(59, Math.max(0, parseInt(secInput.value, 10) || 0));
            return m * 60 + s;
        }

        function setInputsDisabled(disabled) {
            minInput.disabled = disabled;
            secInput.disabled = disabled;
        }

        function updateDisplay(seconds) {
            display.textContent = formatTime(seconds);
        }

        function setStatus(msg) {
            statusEl.textContent = msg;
        }

        function startRinging() {
            card.classList.add('ringing');
            setStatus('🔔 終了！Stopで止めます');
            const src = pickRandomSound();
            if (src) {
                const audio = new Audio(src);
                audio.loop = true;
                audio.play().catch(() => {});
                state.audio = audio;
            }
            stopBtn.disabled = false;
            startBtn.disabled = true;
            resetBtn.disabled = false;
        }

        function stopRinging() {
            card.classList.remove('ringing');
            if (state.audio) {
                state.audio.pause();
                state.audio.currentTime = 0;
                state.audio = null;
            }
            setStatus('');
        }

        function tick() {
            if (state.remaining <= 0) {
                clearInterval(state.intervalId);
                state.intervalId = null;
                state.running = false;
                state.remaining = 0;
                updateDisplay(0);
                startRinging();
                return;
            }
            state.remaining--;
            updateDisplay(state.remaining);
        }

        // ---- Button handlers ----
        startBtn.addEventListener('click', () => {
            if (state.running) return;

            // If not already counting (fresh start or after reset)
            if (state.remaining === 0) {
                const total = getInputSeconds();
                if (total <= 0) {
                    setStatus('⚠ 時間を設定してください');
                    return;
                }
                state.total = total;
                state.remaining = total;
            }

            setInputsDisabled(true);
            setStatus('▶ カウント中…');
            startBtn.disabled = true;
            stopBtn.disabled = false;
            resetBtn.disabled = true;

            state.running = true;
            updateDisplay(state.remaining);
            state.intervalId = setInterval(tick, 1000);
        });

        stopBtn.addEventListener('click', () => {
            if (card.classList.contains('ringing')) {
                // Stop the alarm
                stopRinging();
                state.remaining = 0;
                updateDisplay(0);
                startBtn.disabled = false;
                stopBtn.disabled = true;
                resetBtn.disabled = false;
                setInputsDisabled(false);
                return;
            }

            // Pause the timer
            if (state.running) {
                clearInterval(state.intervalId);
                state.intervalId = null;
                state.running = false;
                startBtn.disabled = false;
                stopBtn.disabled = true;
                resetBtn.disabled = false;
                setStatus('⏸ 一時停止');
            }
        });

        resetBtn.addEventListener('click', () => {
            clearInterval(state.intervalId);
            state.intervalId = null;
            state.running = false;
            state.remaining = 0;
            stopRinging();
            updateDisplay(0);
            startBtn.disabled = false;
            stopBtn.disabled = true;
            resetBtn.disabled = false;
            setInputsDisabled(false);
            setStatus('');
        });

        deleteBtn.addEventListener('click', () => {
            clearInterval(state.intervalId);
            stopRinging();
            timers.delete(id);
            card.remove();
        });

        // Clamp seconds input on blur
        secInput.addEventListener('blur', () => {
            let v = parseInt(secInput.value, 10);
            if (isNaN(v) || v < 0) v = 0;
            if (v > 59) v = 59;
            secInput.value = v;
        });

        minInput.addEventListener('blur', () => {
            let v = parseInt(minInput.value, 10);
            if (isNaN(v) || v < 0) v = 0;
            minInput.value = v;
        });

        // Default state
        stopBtn.disabled = true;
        updateDisplay(0);

        container.appendChild(card);
        labelInput.focus();
    }

    // ---- Add Timer button ----
    document.getElementById('add-timer-btn').addEventListener('click', createTimerCard);

    // ---- Init ----
    loadManifest().then(() => {
        // Start with one timer
        createTimerCard();
    });
})();
