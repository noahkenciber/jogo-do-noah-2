// JOGO DO NOAH 2 - Versão 3D Ultra Compatível
(function() {
    class Game {
        constructor() {
            console.log("🛠️ Inicializando Sistema 3D...");
            
            this.score = 0;
            this.coins = 0;
            this.isPlaying = false;
            this.isGameOver = false;

            // Configuração Three.js
            try {
                this.scene = new THREE.Scene();
                this.scene.background = new THREE.Color(0x0a0a0a);
                this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 60);

                this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.camera.position.set(0, 4, 10);
                this.camera.lookAt(0, 2, 0);

                this.renderer = new THREE.WebGLRenderer({ antialias: true });
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.shadowMap.enabled = true;
                
                const container = document.getElementById('game-container');
                if (container) {
                    container.appendChild(this.renderer.domElement);
                } else {
                    document.body.appendChild(this.renderer.domElement);
                }

                console.log("✅ Engine 3D Pronta.");
            } catch (e) {
                console.error("❌ Erro ao iniciar Three.js:", e);
                alert("Erro ao carregar o 3D. Verifique sua conexão com a internet.");
                return;
            }

            // Luzes
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            this.scene.add(ambientLight);

            this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
            this.sunLight.position.set(5, 15, 5);
            this.sunLight.castShadow = true;
            this.scene.add(this.sunLight);

            // Chão (Pista Realista)
            const groundGeo = new THREE.PlaneGeometry(30, 2000);
            const groundMat = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.9 });
            this.ground = new THREE.Mesh(groundGeo, groundMat);
            this.ground.rotation.x = -Math.PI / 2;
            this.ground.receiveShadow = true;
            this.scene.add(this.ground);

            // Jogador (Boneco Preto)
            const playerGeo = new THREE.BoxGeometry(1.2, 2.2, 1.2);
            const playerMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2 });
            this.player = new THREE.Mesh(playerGeo, playerMat);
            this.player.position.y = 1.1;
            this.player.castShadow = true;
            this.scene.add(this.player);

            // Obstáculos
            this.obstacles = [];
            this.spawnTimer = 0;
            this.playerLane = 0; // -1, 0, 1

            // UI
            this.scoreEl = document.getElementById('score-value');
            this.startOverlay = document.getElementById('start-screen');
            this.gameOverOverlay = document.getElementById('game-over-screen');

            this.init();
        }

        init() {
            // Eventos de Clique (Ultra Robustos)
            const startBtn = document.getElementById('start-button');
            const restartBtn = document.getElementById('restart-button');

            if (startBtn) {
                startBtn.addEventListener('click', (e) => {
                    console.log("🖱️ Clique detectado via EventListener!");
                    this.start();
                });
                // Backup para garantir toque em mobile
                startBtn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.start();
                });
            }

            if (restartBtn) {
                restartBtn.onclick = () => this.start();
            }

            // Teclado
            window.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    if (!this.isPlaying) this.start();
                    else this.jump();
                }
                if (this.isPlaying) {
                    if (e.key === 'ArrowLeft' && this.playerLane < 1) this.playerLane++;
                    if (e.key === 'ArrowRight' && this.playerLane > -1) this.playerLane--;
                }
            });

            window.addEventListener('resize', () => {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            });

            this.animate();
        }

        start() {
            console.log("🏁 Jogo Iniciado!");
            this.isPlaying = true;
            this.isGameOver = false;
            this.score = 0;
            this.playerLane = 0;
            this.player.position.set(0, 1.1, 0);

            this.obstacles.forEach(o => this.scene.remove(o));
            this.obstacles = [];

            if (this.startOverlay) this.startOverlay.classList.remove('active');
            if (this.gameOverOverlay) this.gameOverOverlay.classList.remove('active');
        }

        jump() {
            if (this.player.position.y > 1.2) return;
            this.jumpVel = 0.25;
        }

        spawnObstacle() {
            const lane = Math.floor(Math.random() * 3) - 1;
            const h = Math.random() * 2 + 1;
            const geo = new THREE.BoxGeometry(2, h, 1);
            const mat = new THREE.MeshStandardMaterial({ color: 0x444444 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(lane * 4, h/2, -100);
            mesh.castShadow = true;
            this.scene.add(mesh);
            this.obstacles.push(mesh);
        }

        update() {
            if (!this.isPlaying) return;

            this.score += 0.1;
            if (this.scoreEl) this.scoreEl.innerText = Math.floor(this.score);

            // Suavizar movimento lateral
            this.player.position.x += (this.playerLane * 4 - this.player.position.x) * 0.15;

            // Gravidade/Pulo
            if (this.jumpVel) {
                this.player.position.y += this.jumpVel;
                this.jumpVel -= 0.015;
                if (this.player.position.y <= 1.1) {
                    this.player.position.y = 1.1;
                    this.jumpVel = 0;
                }
            }

            // Spawn
            this.spawnTimer++;
            if (this.spawnTimer > 60) {
                this.spawnObstacle();
                this.spawnTimer = 0;
            }

            // Mover Obstáculos e Colisão
            const speed = 0.7 + (this.score * 0.0001);
            for (let i = this.obstacles.length - 1; i >= 0; i--) {
                const obs = this.obstacles[i];
                obs.position.z += speed;

                // Colisão AABB simples
                const boxPlayer = new THREE.Box3().setFromObject(this.player);
                const boxObs = new THREE.Box3().setFromObject(obs);

                if (boxPlayer.intersectsBox(boxObs)) {
                    this.gameOver();
                }

                if (obs.position.z > 20) {
                    this.scene.remove(obs);
                    this.obstacles.splice(i, 1);
                }
            }
        }

        gameOver() {
            this.isPlaying = false;
            this.isGameOver = true;
            if (this.gameOverOverlay) {
                document.getElementById('final-score').innerText = Math.floor(this.score);
                this.gameOverOverlay.classList.add('active');
            }
        }

        animate() {
            requestAnimationFrame(() => this.animate());
            this.update();
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Inicialização Garantida
    window.addEventListener('DOMContentLoaded', () => {
        new Game();
    });
})();
