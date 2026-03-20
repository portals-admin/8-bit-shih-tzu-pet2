/**
 * Pixel Pup — Main Game Logic
 * Animation state machine, pet mechanics, interaction handling
 */

(function () {
  // === CANVAS SETUP ===
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('canvas-wrap');

  // Internal resolution (pixelated look)
  const W = 256;
  const H = 256;
  canvas.width = W;
  canvas.height = H;

  // === PET STATE ===
  const pet = {
    happiness: 70,
    energy: 80,
    love: 50,
    state: 'idle', // idle, happy, petting, eating, playing, sleeping
    stateTimer: 0,
    frame: 0,
    lastInteraction: Date.now(),
    petCount: 0,
  };

  // State durations (in frames, ~60fps)
  const STATE_DURATION = {
    idle: Infinity,
    happy: 180,
    petting: 120,
    eating: 150,
    playing: 240,
    sleeping: Infinity,
  };

  // Mood messages
  const MOODS = {
    idle: [
      'waiting for pets...',
      '*tail wag*',
      'bork?',
      'henlo fren!',
      '*sniff sniff*',
      'play with me!',
    ],
    happy: [
      'SO HAPPY!!!',
      '*happy tippy taps*',
      'BORK BORK!',
      'best day ever!',
      'i love u!!!',
    ],
    petting: [
      '*happy squint*',
      'mmm yes right there',
      'more pets pls',
      'so comfy...',
      '*melting*',
    ],
    eating: [
      '*cronch cronch*',
      'yummy treat!',
      'nom nom nom',
      'is there more?',
    ],
    playing: [
      'ZOOMIES!!!',
      '*boing boing*',
      'catch me!!',
      'so much fun!',
      'weeeee!',
    ],
    sleeping: [
      'zzZ zzZ zzZ',
      '*soft snoring*',
      '*dreaming of treats*',
      'shhh... sleeping',
      '*twitchy paws*',
    ],
  };

  // === MOOD TEXT ===
  const moodEl = document.getElementById('mood-text');
  let currentMoodIdx = 0;
  let moodChangeTimer = 0;

  function updateMoodText() {
    const msgs = MOODS[pet.state] || MOODS.idle;
    currentMoodIdx = Math.floor(Math.random() * msgs.length);
    moodEl.textContent = msgs[currentMoodIdx];
  }

  // === STATUS BARS ===
  const happyFill = document.getElementById('happy-fill');
  const energyFill = document.getElementById('energy-fill');
  const loveFill = document.getElementById('love-fill');

  function updateStatusBars() {
    happyFill.style.width = pet.happiness + '%';
    energyFill.style.width = pet.energy + '%';
    loveFill.style.width = pet.love + '%';

    // Color changes at low levels
    happyFill.style.backgroundColor = pet.happiness < 30 ? '#ff4444' : '#f7c948';
    energyFill.style.backgroundColor = pet.energy < 30 ? '#ff4444' : '#4ecdc4';
    loveFill.style.backgroundColor = pet.love < 20 ? '#ff4444' : '#ff6b9d';
  }

  // === STATE MACHINE ===
  function setState(newState) {
    if (pet.state === newState) return;
    pet.state = newState;
    pet.stateTimer = 0;
    updateMoodText();
  }

  function transitionCheck() {
    pet.stateTimer++;
    moodChangeTimer++;

    if (moodChangeTimer > 180) {
      moodChangeTimer = 0;
      updateMoodText();
    }

    const duration = STATE_DURATION[pet.state];
    if (pet.stateTimer >= duration) {
      setState('idle');
    }

    // Auto-sleep if energy is very low
    if (pet.energy <= 5 && pet.state !== 'sleeping') {
      setState('sleeping');
      updateMoodText();
    }

    // Passive stat decay
    if (pet.frame % 120 === 0) {
      pet.happiness = Math.max(0, pet.happiness - 1);
      pet.energy = Math.max(0, pet.energy - 0.5);
    }

    // Sleeping recovers energy
    if (pet.state === 'sleeping' && pet.frame % 60 === 0) {
      pet.energy = Math.min(100, pet.energy + 2);
      if (pet.energy >= 100) {
        setState('idle');
        moodEl.textContent = '*yawn* all rested!';
      }
    }

    // Snore sound while sleeping
    if (pet.state === 'sleeping' && pet.frame % 180 === 0) {
      AudioSystem.snore();
    }
  }

  // === INTERACTIONS ===
  function doPet() {
    AudioSystem.pet();
    pet.happiness = Math.min(100, pet.happiness + 8);
    pet.love = Math.min(100, pet.love + 5);
    pet.petCount++;
    setState('petting');
    spawnHearts(3);

    if (pet.petCount % 5 === 0) {
      AudioSystem.happyBark();
    }
  }

  function doTreat() {
    AudioSystem.eat();
    pet.happiness = Math.min(100, pet.happiness + 12);
    pet.energy = Math.min(100, pet.energy + 15);
    pet.love = Math.min(100, pet.love + 3);
    setState('eating');
    spawnSparkles(5);
  }

  function doPlay() {
    if (pet.energy < 10) {
      moodEl.textContent = 'too sleepy to play...';
      return;
    }
    AudioSystem.play();
    pet.happiness = Math.min(100, pet.happiness + 15);
    pet.energy = Math.max(0, pet.energy - 20);
    pet.love = Math.min(100, pet.love + 8);
    setState('playing');
    spawnSparkles(8);
  }

  function doSleep() {
    if (pet.state === 'sleeping') {
      // Wake up
      setState('idle');
      moodEl.textContent = '*yawn* good morning!';
      AudioSystem.bark();
      return;
    }
    setState('sleeping');
  }

  // === PARTICLES ===
  const particlesLayer = document.getElementById('particles-layer');

  function spawnHearts(count) {
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.className = 'heart-particle';
      heart.textContent = ['❤', '💕', '💖', '🤍'][Math.floor(Math.random() * 4)];
      heart.style.left = (30 + Math.random() * 40) + '%';
      heart.style.top = (30 + Math.random() * 20) + '%';
      heart.style.animationDelay = (i * 0.15) + 's';
      particlesLayer.appendChild(heart);
      setTimeout(() => heart.remove(), 1500);
    }
  }

  function spawnSparkles(count) {
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('div');
      spark.className = 'sparkle-particle';
      spark.style.left = (20 + Math.random() * 60) + '%';
      spark.style.top = (20 + Math.random() * 40) + '%';
      spark.style.animationDelay = (i * 0.08) + 's';
      spark.style.background = ['#f7c948', '#ff6b9d', '#4ecdc4', '#fff'][Math.floor(Math.random() * 4)];
      particlesLayer.appendChild(spark);
      setTimeout(() => spark.remove(), 1000);
    }
  }

  function spawnZzz() {
    if (pet.state !== 'sleeping') return;
    const zzz = document.createElement('div');
    zzz.className = 'zzz';
    zzz.textContent = 'z';
    zzz.style.left = (55 + Math.random() * 15) + '%';
    zzz.style.top = (30 + Math.random() * 10) + '%';
    zzz.style.fontSize = (10 + Math.random() * 10) + 'px';
    particlesLayer.appendChild(zzz);
    setTimeout(() => zzz.remove(), 2200);
  }

  // === CANVAS CLICK / TAP ===
  canvas.addEventListener('click', (e) => {
    AudioSystem.resume();
    if (!AudioSystem.musicStarted) {
      AudioSystem.startMusic();
      AudioSystem.musicStarted = true;
    }

    if (pet.state === 'sleeping') {
      doSleep(); // wake up
      return;
    }
    doPet();
    pet.lastInteraction = Date.now();
  });

  // Prevent double-tap zoom on mobile
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
  });

  // === BUTTON HANDLERS ===
  document.getElementById('btn-pet').addEventListener('click', () => {
    AudioSystem.resume();
    if (pet.state === 'sleeping') { doSleep(); return; }
    doPet();
  });

  document.getElementById('btn-treat').addEventListener('click', () => {
    AudioSystem.resume();
    if (pet.state === 'sleeping') { doSleep(); }
    doTreat();
  });

  document.getElementById('btn-play').addEventListener('click', () => {
    AudioSystem.resume();
    if (pet.state === 'sleeping') { doSleep(); }
    doPlay();
  });

  document.getElementById('btn-sleep').addEventListener('click', () => {
    AudioSystem.resume();
    doSleep();
  });

  // Sound toggle
  const soundBtn = document.getElementById('sound-toggle');
  soundBtn.addEventListener('click', () => {
    const on = AudioSystem.toggle();
    soundBtn.textContent = on ? '🔊' : '🔇';
    soundBtn.classList.toggle('muted', !on);
    if (on && !AudioSystem.musicStarted) {
      AudioSystem.startMusic();
      AudioSystem.musicStarted = true;
    }
  });

  // === DRAW LOOP ===
  function drawDog() {
    // Center the dog sprite in canvas
    ctx.save();
    // The sprite draws on a ~64-pixel grid with PIXEL=4, so 256px total
    // We position it centered
    const offsetX = (W - 64 * PIXEL) / 2;
    const offsetY = (H - 64 * PIXEL) / 2 - 10;
    ctx.translate(offsetX, offsetY);

    switch (pet.state) {
      case 'happy':
        ShihTzuSprites.happy(ctx, pet.frame);
        break;
      case 'petting':
        ShihTzuSprites.petting(ctx, pet.frame);
        break;
      case 'eating':
        ShihTzuSprites.eating(ctx, pet.frame);
        break;
      case 'playing':
        ShihTzuSprites.playing(ctx, pet.frame);
        break;
      case 'sleeping':
        ShihTzuSprites.sleeping(ctx, pet.frame);
        break;
      default:
        ShihTzuSprites.idle(ctx, pet.frame);
    }

    ctx.restore();
  }

  // Sleeping zzz timer
  let zzzTimer = 0;

  function gameLoop() {
    pet.frame++;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Draw background scene
    drawScene(ctx, W, H, pet.frame);

    // Draw dog
    drawDog();

    // State transitions
    transitionCheck();

    // Status bar update (every 10 frames for perf)
    if (pet.frame % 10 === 0) {
      updateStatusBars();
    }

    // Zzz particles for sleeping
    if (pet.state === 'sleeping') {
      zzzTimer++;
      if (zzzTimer % 50 === 0) spawnZzz();
    } else {
      zzzTimer = 0;
    }

    // Idle auto-mood check — if not interacted for a while, get sad
    if (Date.now() - pet.lastInteraction > 30000 && pet.state === 'idle') {
      if (pet.frame % 300 === 0) {
        pet.happiness = Math.max(0, pet.happiness - 3);
        moodEl.textContent = 'play with me...?';
      }
    }

    requestAnimationFrame(gameLoop);
  }

  // === INIT ===
  AudioSystem.init();
  updateStatusBars();
  updateMoodText();
  gameLoop();
})();
