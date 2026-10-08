/**
 * game.js - Cokie Astronauta (Easter-Egg recreado fielmente de Cokie_College)
 * 
 * Requisitos específicos:
 * - Físicas y mecánicas idénticas a easter-egg.jsx (gravedad, salto, velocidad, tubos de energía).
 * - Gráficos originales: CokieAstronauta.png, GalaxyBG.jpg y tuberías de energía sci-fi.
 * - SOLO muestra la puntuación actual al perder, SIN registrar ni guardar récord alguno.
 * - 100% responsivo para móviles y desktop.
 * - JavaScript no intrusivo con addEventListener (click, touchstart, keydown).
 */

export function initGame() {
  const arena = document.getElementById('game-arena');
  const birdEl = document.getElementById('game-bird');
  const scoreDisplay = document.getElementById('game-score-display');
  const startOverlay = document.getElementById('game-start-overlay');
  const gameOverOverlay = document.getElementById('game-gameover-overlay');
  const finalScoreEl = document.getElementById('game-final-score');
  const retryBtn = document.getElementById('game-retry-btn');
  const obstacleContainer = document.getElementById('game-obstacle-container');

  if (!arena || !birdEl) return;

  // Parámetros de física idénticos a easter-egg.jsx
  const GRAVITY = 0.35;
  const JUMP = -6.5;
  const OBSTACLE_WIDTH = 70;
  const OBSTACLE_SPEED = 3.5;
  const BIRD_WIDTH = 54;
  const BIRD_HEIGHT = 52;
  const HITBOX_MARGIN = 9;

  // Estado del juego
  let isPlaying = false;
  let isGameOver = false;
  let score = 0;
  let birdY = 200;
  let birdVelocity = 0;
  let obstacles = [];
  let animationFrameId = null;
  let lastTimestamp = 0;

  // Dimensiones dinámicas del contenedor
  let arenaWidth = arena.clientWidth || 600;
  let arenaHeight = arena.clientHeight || 500;

  const updateArenaDimensions = () => {
    arenaWidth = arena.clientWidth;
    arenaHeight = arena.clientHeight;
    if (!isPlaying && !isGameOver) {
      birdY = arenaHeight / 2 - BIRD_HEIGHT / 2;
      renderBird(0);
    }
  };

  window.addEventListener('resize', updateArenaDimensions);

  // Crear un nuevo par de tuberías de energía
  const spawnObstacle = () => {
    const currentGap = Math.min(220, Math.max(180, arenaHeight * 0.42));
    const minHeight = Math.max(60, arenaHeight * 0.12);
    const maxHeight = arenaHeight - currentGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

    // Crear elementos en el DOM para el obstáculo
    const pipeWrapper = document.createElement('div');
    pipeWrapper.className = 'absolute top-0 bottom-0 pointer-events-none';
    pipeWrapper.style.width = `${OBSTACLE_WIDTH}px`;
    pipeWrapper.style.transform = `translateX(${arenaWidth}px)`;

    pipeWrapper.innerHTML = `
      <!-- Tubo Superior -->
      <div class="game-pipe game-pipe-top" style="width: ${OBSTACLE_WIDTH}px; height: ${topHeight}px;">
        <div class="game-pipe-energy"></div>
        <div class="game-pipe-cap game-pipe-cap-bottom"></div>
      </div>
      <!-- Tubo Inferior -->
      <div class="game-pipe game-pipe-bottom" style="width: ${OBSTACLE_WIDTH}px; height: ${arenaHeight - topHeight - currentGap}px;">
        <div class="game-pipe-energy"></div>
        <div class="game-pipe-cap game-pipe-cap-top"></div>
      </div>
    `;

    obstacleContainer.appendChild(pipeWrapper);

    const newObs = {
      x: arenaWidth,
      topHeight: topHeight,
      gap: currentGap,
      passed: false,
      el: pipeWrapper
    };

    obstacles.push(newObs);
  };

  // Posicionar el astronauta Cokie
  const renderBird = (rotationDeg) => {
    const birdX = arenaWidth / 2 - BIRD_WIDTH / 2;
    birdEl.style.left = `${birdX}px`;
    birdEl.style.top = `${birdY}px`;
    birdEl.style.transform = `rotate(${rotationDeg}deg)`;
  };

  // Acción de salto / impulso
  const jump = (e) => {
    // Si el evento viene del botón de reintentar, no saltar aquí
    if (e && e.target && e.target.closest('#game-retry-btn')) {
      return;
    }

    if (!isPlaying && !isGameOver) {
      // Iniciar partida
      startGame();
      birdVelocity = JUMP;
      return;
    }

    if (isGameOver) {
      return;
    }

    // Impulso hacia arriba
    birdVelocity = JUMP;
  };

  const startGame = () => {
    isPlaying = true;
    isGameOver = false;
    score = 0;
    if (scoreDisplay) scoreDisplay.textContent = '0';
    if (startOverlay) startOverlay.classList.add('hidden');
    if (gameOverOverlay) gameOverOverlay.classList.add('hidden');

    // Limpiar obstáculos previos
    obstacles.forEach(obs => obs.el.remove());
    obstacles = [];

    birdY = arenaHeight / 2 - BIRD_HEIGHT / 2;
    birdVelocity = 0;
    lastTimestamp = 0;

    spawnObstacle();

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(gameLoop);
  };

  const resetGame = () => {
    startGame();
  };

  // Fin de la partida
  const triggerGameOver = () => {
    isGameOver = true;
    isPlaying = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // Mostrar modal de Game Over mostrando EXCLUSIVAMENTE la puntuación (sin récords)
    if (finalScoreEl) finalScoreEl.textContent = score;
    if (gameOverOverlay) {
      gameOverOverlay.classList.remove('hidden');
      gameOverOverlay.classList.add('task-enter');
    }
  };

  // Bucle principal de físicas a 60fps con DeltaTime normalizado
  const gameLoop = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    let timeScale = deltaTime / 16.666;
    if (timeScale > 3) timeScale = 3;
    if (timeScale < 0.1) timeScale = 0.1;
    if (isNaN(timeScale)) timeScale = 1;

    if (isPlaying && !isGameOver) {
      // Aplicar gravedad
      birdVelocity += GRAVITY * timeScale;
      birdY += birdVelocity * timeScale;

      // Calcular rotación angular según velocidad vertical
      const rot = Math.min(Math.max(birdVelocity * 2.5, -25), 45);
      renderBird(rot);

      const birdX = arenaWidth / 2 - BIRD_WIDTH / 2;

      // Actualizar obstáculos
      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.x -= OBSTACLE_SPEED * timeScale;
        obs.el.style.transform = `translateX(${obs.x}px)`;

        // Detección de colisión precisa con margen de tolerancia (HITBOX_MARGIN)
        const hitTop = birdY + HITBOX_MARGIN < obs.topHeight;
        const hitBottom = birdY + BIRD_HEIGHT - HITBOX_MARGIN > obs.topHeight + obs.gap;
        const hitX = obs.x < birdX + BIRD_WIDTH - HITBOX_MARGIN && obs.x + OBSTACLE_WIDTH > birdX + HITBOX_MARGIN;

        if (hitX && (hitTop || hitBottom)) {
          triggerGameOver();
          return;
        }

        // Contador de puntuación cuando el obstáculo es superado
        if (obs.x + OBSTACLE_WIDTH < birdX && !obs.passed) {
          score += 1;
          obs.passed = true;
          if (scoreDisplay) scoreDisplay.textContent = score;
        }
      }

      // Colisión contra el techo o el suelo
      if (birdY > arenaHeight - BIRD_HEIGHT + 10 || birdY < -20) {
        triggerGameOver();
        return;
      }

      // Eliminar tubos que salieron de la pantalla por la izquierda
      if (obstacles.length > 0 && obstacles[0].x < -OBSTACLE_WIDTH) {
        obstacles[0].el.remove();
        obstacles.shift();
      }

      // Generar nuevo tubo cuando el último avance lo suficiente
      const lastObs = obstacles[obstacles.length - 1];
      if (lastObs && lastObs.x < arenaWidth - 230) {
        spawnObstacle();
      }
    }

    if (isPlaying && !isGameOver) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  };

  // Asignación NO INTRUSIVA de eventos (EventListeners)

  // 1. Clic o toque en el área del juego
  arena.addEventListener('click', jump);
  arena.addEventListener('touchstart', (e) => {
    // Evitar scroll táctil accidental mientras se juega
    if (isPlaying) {
      e.preventDefault();
    }
    jump(e);
  }, { passive: false });

  // 2. Control con teclado (Espacio o Flecha Arriba)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      // Prevenir el scroll de página al usar la barra espaciadora
      const gameContainer = document.getElementById('game-section');
      const isVisible = gameContainer && !gameContainer.classList.contains('hidden');
      if (isVisible) {
        e.preventDefault();
        jump();
      }
    }
  });

  // 3. Botón de reintentar
  if (retryBtn) {
    retryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetGame();
    });
  }

  // Inicializar dimensiones y estado
  updateArenaDimensions();
  renderBird(0);
}
