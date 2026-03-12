# 🎮 Guia de Boas Práticas: Antigravity Game Dev

Este documento descreve as melhores práticas para que eu (Antigravity) desenvolva seu jogo da melhor forma, facilitando o uso do **GitHub Desktop** e o deploy automático no **GitHub Pages**.

---

## 🛠️ 1. Estrutura do Projeto

Para garantir que o projeto seja leve, rápido e compatível com o GitHub Pages sem configurações complexas, utilizaremos uma estrutura de **Vanilla Web Tech** (HTML5, CSS3 e JavaScript puro):

- `index.html`: O ponto de entrada do jogo.
- `style.css`: Toda a estilização e animações de UI.
- `src/`: Pasta contendo a lógica do jogo.
    - `main.js`: Inicialização e loop principal.
    - `engine/`: Sistemas de física, colisão e entrada.
    - `entities/`: Jogador, obstáculos e inimigos.
    - `world/`: Geração procedural e cenário.
- `assets/`: Imagens, sons e fontes.

> [!TIP]
> Manter os arquivos na raiz ou em pastas simples garante que o GitHub Pages encontre o `index.html` imediatamente após o commit.

---

## 🚀 2. Fluxo com GitHub Desktop

Para que você consiga fazer o commit sem erros, seguirei estas regras:

1.  **Sem Dependências Pesadas**: Não usarei `node_modules` gigantescos a menos que seja estritamente necessário, para que seu commit no GitHub Desktop seja instantâneo.
2.  **Mensagens de Commit Claras**: Sempre que eu terminar uma funcionalidade, avisarei para você fazer o commit com uma mensagem descritiva (ex: "Adicionado sistema de pulo e colisão").
3.  **Arquivos Pequenos**: Vou dividir o código em módulos para facilitar a leitura e evitar conflitos.

---

## 🌐 3. Deploy no GitHub Pages

O GitHub Pages é a melhor forma de hospedar seu jogo gratuitamente. Para isso:

1.  **Branch `main`**: Manteremos todo o código funcional na branch principal.
2.  **Configuração Automática**:
    - Vá em **Settings** no seu repositório no GitHub.
    - Clique em **Pages** na lateral esquerda.
    - Em **Build and deployment**, selecione **Deploy from a branch**.
    - Escolha a branch `main` e a pasta `/(root)`.
    - Clique em **Save**.
3.  **Domínio**: Seu jogo estará disponível em `https://seu-usuario.github.io/nome-do-repositorio/`.

---

## 🕹️ 4. Desenvolvimento do Jogo (Infinite Runner)

Para o seu jogo específico, aplicarei:

- **Game Loop Otimizado**: Usando `requestAnimationFrame` para 60 FPS estáveis.
- **Object Pooling**: Para gerar obstáculos infinitos sem travar a memória.
- **Design Premium**: Sombras suaves, gradientes modernos e micro-interações.
- **Mobile Friendly**: Seus controles funcionarão tanto no teclado quanto no toque.

---

## ✨ 5. Como pedir alterações

Ao pedir novas funcionalidades, tente ser específico sobre a estética ou mecânica:
- *Ex: "Quero que o fundo mude de cor conforme a pontuação aumenta"*
- *Ex: "Adicione um efeito de rastro neon atrás do personagem"*

---

> [!IMPORTANT]
> O GitHub Pages pode levar até 2-3 minutos para atualizar após o seu commit no GitHub Desktop. Fique atento à aba "Actions" no GitHub para ver o progresso do deploy.
