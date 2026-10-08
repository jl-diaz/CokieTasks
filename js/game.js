/**
 * game.js - Motor del minijuego Cokie Astronauta
 * 
 * Implementa un simulador arcade con bucle de animación a 60 FPS normalizado
 * por delta de tiempo, física de gravedad y propulsión, renderizado de obstáculos
 * procedimentales, detección de colisiones AABB con tolerancia y soporte multitáctil/teclado.
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

  // Constantes del motor físico
  const GRAVITY = 0.35;
  const JUMP = -6.5;
  const OBSTACLE_WIDTH = 70;
  const OBSTACLE_SPEED = 3.5;
  const BIRD_WIDTH = 54;
  const BIRD_HEIGHT = 52;
  const HITBOX_MARGIN = 9;

  // Variables de estado de sesión
  let isPlaying = false;
  let isGameOver = false;
  let score = 0;
  let birdY = 200;
  let birdVelocity = 0;
  let obstacles = [];
  let animationFrameId = null;
  let lastTimestamp = 0;

  // Dimensiones del lienzo interactivo
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

  // Genera un par de columnas de energía con apertura aleatoria
  const spawnObstacle = () => {
    const currentGap = Math.min(220, Math.max(180, arenaHeight * 0.42));
    const minHeight = Math.max(60, arenaHeight * 0.12);
    const maxHeight = arenaHeight - currentGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);

    const pipeWrapper = document.createElement('div');
    pipeWrapper.className = 'absolute top-0 bottom-0 pointer-events-none';
    pipeWrapper.style.width = `${OBSTACLE_WIDTH}px`;
    pipeWrapper.style.transform = `translateX(${arenaWidth}px)`;

    pipeWrapper.innerHTML = `
      <div class="game-pipe game-pipe-top" style="width: ${OBSTACLE_WIDTH}px; height: ${topHeight}px;">
        <div class="game-pipe-energy"></div>
        <div class="game-pipe-cap game-pipe-cap-bottom"></div>
      </div>
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

  // Posiciona y orienta el sprite en el espacio de juego
  const renderBird = (rotationDeg) => {
    const birdX = arenaWidth / 2 - BIRD_WIDTH / 2;
    birdEl.style.left = `${birdX}px`;
    birdEl.style.top = `${birdY}px`;
    birdEl.style.transform = `rotate(${rotationDeg}deg)`;
  };

  // Impulso vertical del personaje
  const jump = (e) => {
    if (e && e.target && e.target.closest('#game-retry-btn')) {
      return;
    }

    if (!isPlaying && !isGameOver) {
      startGame();
      birdVelocity = JUMP;
      return;
    }

    if (isGameOver) {
      return;
    }

    birdVelocity = JUMP;
  };

  const startGame = () => {
    isPlaying = true;
    isGameOver = false;
    score = 0;
    if (scoreDisplay) scoreDisplay.textContent = '0';
    if (startOverlay) startOverlay.classList.add('hidden');
    if (gameOverOverlay) gameOverOverlay.classList.add('hidden');

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

  // Finalización de partida y despliegue de resultados
  const triggerGameOver = () => {
    isGameOver = true;
    isPlaying = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    if (finalScoreEl) finalScoreEl.textContent = score;
    if (gameOverOverlay) {
      gameOverOverlay.classList.remove('hidden');
      gameOverOverlay.classList.add('task-enter');
    }
  };

  // Ciclo principal de actualización y renderizado
  const gameLoop = (timestamp) => {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    let timeScale = deltaTime / 16.666;
    if (timeScale > 3) timeScale = 3;
    if (timeScale < 0.1) timeScale = 0.1;
    if (isNaN(timeScale)) timeScale = 1;

    if (isPlaying && !isGameOver) {
      birdVelocity += GRAVITY * timeScale;
      birdY += birdVelocity * timeScale;

      const rot = Math.min(Math.max(birdVelocity * 2.5, -25), 45);
      renderBird(rot);

      const birdX = arenaWidth / 2 - BIRD_WIDTH / 2;

      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        obs.x -= OBSTACLE_SPEED * timeScale;
        obs.el.style.transform = `translateX(${obs.x}px)`;

        const hitTop = birdY + HITBOX_MARGIN < obs.topHeight;
        const hitBottom = birdY + BIRD_HEIGHT - HITBOX_MARGIN > obs.topHeight + obs.gap;
        const hitX = obs.x < birdX + BIRD_WIDTH - HITBOX_MARGIN && obs.x + OBSTACLE_WIDTH > birdX + HITBOX_MARGIN;

        if (hitX && (hitTop || hitBottom)) {
          triggerGameOver();
          return;
        }

        if (obs.x + OBSTACLE_WIDTH < birdX && !obs.passed) {
          score += 1;
          obs.passed = true;
          if (scoreDisplay) scoreDisplay.textContent = score;
        }
      }

      // Límites del escenario
      if (birdY > arenaHeight - BIRD_HEIGHT + 10 || birdY < -20) {
        triggerGameOver();
        return;
      }

      // Reciclaje de obstáculos fuera de pantalla
      if (obstacles.length > 0 && obstacles[0].x < -OBSTACLE_WIDTH) {
        obstacles[0].el.remove();
        obstacles.shift();
      }

      // Invocación del siguiente obstáculo
      const lastObs = obstacles[obstacles.length - 1];
      if (lastObs && lastObs.x < arenaWidth - 230) {
        spawnObstacle();
      }
    }

    if (isPlaying && !isGameOver) {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  };

  // Entrada de usuario táctil y por puntero
  arena.addEventListener('click', jump);
  arena.addEventListener('touchstart', (e) => {
    if (isPlaying) {
      e.preventDefault();
    }
    jump(e);
  }, { passive: false });

  // Entrada por teclado
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      const gameContainer = document.getElementById('section-game');
      const isVisible = gameContainer && !gameContainer.classList.contains('hidden');
      if (isVisible) {
        e.preventDefault();
        jump();
      }
    }
  });

  // Reintento de partida
  if (retryBtn) {
    retryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetGame();
    });
  }

  // Inicialización de dimensiones y posición de reposo
  updateArenaDimensions();
  renderBird(0);
}
