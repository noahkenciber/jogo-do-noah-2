import * as THREE from 'three';

class Game {
    constructor() {
        this.score = 0;
        this.coins = 0;
        this.isPlaying = false;
        this.isGameOver = false;

        // Configuração Three.js
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050505);
        this.scene.fog = new THREE.Fog(0x050505, 10, 50);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Iluminação Realista
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(5, 10, 5);
        sunLight.castShadow = true;
        this.scene.add(sunLight);

        // Chão/Terreno Real (Asfalto/Pista)
        const groundGeometry = new THREE.PlaneGeometry(20, 1000);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111,
            roughness: 0.8
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Jogador (Boneco Totalmente Preto)
        const playerGeo = new THREE.BoxGeometry(1, 2, 1);
        const playerMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0 });
        this.player = new THREE.Mesh(playerGeo, playerMat);
        this.player.position.y = 1;
        this.player.castShadow = true;
        this.scene.add(this.player);

        // Estado do Jogador
        this.playerLane = 0; // -1, 0, 1
        this.playerTargetX = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;

        // Obstáculos
        this.obstacles = [];
        this.spawnTimer = 0;

        // UI
        this.scoreEl = document.getElementById('score-value');
        this.coinsEl = document.getElementById('coins-value');
        this.startBtn = document.getElementById('start-button');
        this.restartBtn = document.getElementById('restart-button');
        this.startOverlay = document.getElementById('start-screen');
        this.gameOverOverlay = document.getElementById('game-over-screen');

        this.init();
    }

    init() {
        this.setupEvents();
        this.animate();
    }

    setupEvents() {
        this.startBtn.onclick = () => this.start();
        this.restartBtn.onclick = () => this.start();

        window.addEventListener('keydown', (e) => {
            if (!this.isPlaying) return;
            if (e.key === 'ArrowLeft' && this.playerLane < 1) this.playerLane++;
            if (e.key === 'ArrowRight' && this.playerLane > -1) this.playerLane--;
            if (e.key === ' ' && !this.isJumping) {
                this.isJumping = true;
                this.jumpVelocity = 0.2;
            }
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    start() {
        this.isPlaying = true;
        this.isGameOver = false;
        this.score = 0;
        this.coins = 0;
        this.playerLane = 0;
        this.player.position.set(0, 1, 0);
        
        // Limpar obstáculos antigos
        this.obstacles.forEach(o => this.scene.remove(o.mesh));
        this.obstacles = [];

        this.startOverlay.classList.remove('active');
        this.gameOverOverlay.classList.remove('active');
    }

    spawnObstacle() {
        const lane = Math.floor(Math.random() * 3) - 1;
        const geo = new THREE.BoxGeometry(2, Math.random() * 2 + 1, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(lane * 3, mesh.geometry.parameters.height / 2, -100);
        mesh.castShadow = true;
        this.scene.add(mesh);
        this.obstacles.push({ mesh, lane });
    }

    gameOver() {
        this.isPlaying = false;
        this.isGameOver = true;
        document.getElementById('final-score').innerText = Math.floor(this.score);
        this.gameOverOverlay.classList.add('active');
    }

    update(deltaTime) {
        if (!this.isPlaying) return;

        this.score += deltaTime * 0.1;
        this.scoreEl.innerText = Math.floor(this.score);

        // Movimento do Jogador (Lanes)
        this.playerTargetX = this.playerLane * 3;
        this.player.position.x += (this.playerTargetX - this.player.position.x) * 0.1;

        // Pulo do Jogador
        if (this.isJumping) {
            this.player.position.y += this.jumpVelocity;
            this.jumpVelocity -= 0.01;
            if (this.player.position.y <= 1) {
                this.player.position.y = 1;
                this.isJumping = false;
            }
        }

        // Spawn de Obstáculos
        this.spawnTimer += deltaTime;
        if (this.spawnTimer > 1000) {
            this.spawnObstacle();
            this.spawnTimer = 0;
        }

        // Mover Obstáculos e Chão (Simular movimento)
        const speed = 0.5 + (this.score * 0.0001);
        this.obstacles.forEach((obs, index) => {
            obs.mesh.position.z += speed;

            // Colisão
            const dx = Math.abs(obs.mesh.position.x - this.player.position.x);
            const dz = Math.abs(obs.mesh.position.z - this.player.position.z);
            const dy = this.player.position.y - obs.mesh.geometry.parameters.height;

            if (dx < 1.5 && dz < 1 && dy < 0) {
                this.gameOver();
            }

            if (obs.mesh.position.z > 10) {
                this.scene.remove(obs.mesh);
                this.obstacles.splice(index, 1);
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = 16.6; // Simulado
        this.update(delta);
        this.renderer.render(this.scene, this.camera);
    }
}

new Game();
