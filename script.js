  <script>
       const canvas = document.getElementById('game');
          const context = canvas.getContext('2d');
          const grid = 64;
          const numRows = 13;
          const numCols = 15;
          let maxLevels = 3; // Número máximo de níveis
          let playerWon = false; // Variável para controlar se o jogador venceu
          let currentLevel = 1; // Inicialize o nível atual
          let gameOver = false;

    
          class Player {
            constructor() {
                this.row = 1;
                this.col = 1;
                this.numBombs = 1;
                this.bombSize = 2;
                this.radius = grid * 0.65;
                this.image = new Image();
                this.imagePath = 'mutano.png';
                this.init();
            }

            init() {
                this.image.src = this.imagePath;
                this.image.onload = () => {
                    this.render();
                };
            }

            render() {
                const x = (this.col + 0.5) * grid;
                const y = (this.row + 0.5) * grid;

                context.drawImage(this.image, x - this.radius, y - this.radius, this.radius * 2, this.radius * 2);
            }
        }

  
          const player = new Player();
  
          class Bomb {
    constructor(row, col, size, owner) {
        this.row = row;
        this.col = col;
        this.radius = grid * 0.4;
        this.size = size;
        this.owner = owner;
        this.alive = true;
        this.type = types.bomb;

        this.timer = 2000;

        this.update = function (dt) {
            this.timer -= dt;

            if (this.timer <= 0) {
                return blowUpBomb(this);
            }

            const interval = Math.ceil(this.timer / 500);
            if (interval % 2 === 0) {
                this.radius = grid * 0.4;
            } else {
                this.radius = grid * 0.5;
            }
        };

        this.render = function () {
            const x = (this.col + 0.5) * grid;
            const y = (this.row + 0.5) * grid;

            // características da bomba
            context.fillStyle = 'black';
            context.beginPath();
            context.arc(x, y, this.radius, 0, 2 * Math.PI);
            context.fill();

            // características da bomba
            const fuseY = this.radius === grid * 0.5 ? grid * 0.15 : 0;
            context.strokeStyle = 'white';
            context.lineWidth = 5;
            context.beginPath();
            context.arc(
                (this.col + 0.75) * grid,
                (this.row + 0.25) * grid - fuseY,
                10, Math.PI, -Math.PI / 2
            );
            context.stroke();
        };
    }
}

class Explosion {
    constructor(row, col, dir, center) {
        this.row = row;
        this.col = col;
        this.dir = dir;
        this.alive = true;

        // tempo pra explosão (2seg)
        this.timer = 200;

        this.update = function (dt) {
            this.timer -= dt;

            if (this.timer <= 0) {
                this.alive = false;
            }
        };

        this.render = function () {
            const x = this.col * grid;
            const y = this.row * grid;
            const horizontal = this.dir.col;
            const vertical = this.dir.row;

            // Características do fogo bomba
            context.fillStyle = '#D72B16';
            context.fillRect(x, y, grid, grid);

            context.fillStyle = '#F39642';

            if (center || horizontal) {
                context.fillRect(x, y + 6, grid, grid - 12);
            }
            if (center || vertical) {
                context.fillRect(x + 6, y, grid - 12, grid);
            }

            context.fillStyle = '#FFE5A8'; // yellow

            if (center || horizontal) {
                context.fillRect(x, y + 12, grid, grid - 24);
            }
            if (center || vertical) {
                context.fillRect(x + 12, y, grid - 24, grid);
            }
        };
    }
}

function checkGameStatus() {
    const playerRow = player.row;
    const playerCol = player.col;
    const enemyRow = 3;
    const enemyCol = 1;

    if (playerRow === 11 && playerCol === 13) {
        // O jogador venceu o nível
        currentLevel++;
        if (currentLevel <= maxLevels) {
            generateLevel();
        } else {
            // O jogador venceu o jogo (completou todos os níveis)
            gameOver = true;
            playerWon = true;
        }
    } else if (playerRow === enemyRow && playerCol === enemyCol) {
        if (!playerWon) {
    // Mostrar o GIF de Game Over
        const gameOverGif = document.getElementById('gameOverGif');
        gameOverGif.style.display = 'block';
        document.body.style.backgroundImage = 'url(gameover.jpg)';
    // Ocultar o canvas do jogo
        canvas.style.display = 'none';
}
        gameOver = true;
        playerWon = false;
    }
    
}
  
          const softWallCanvas = document.createElement('canvas');
          const softWallCtx = softWallCanvas.getContext('2d');
          softWallCanvas.width = softWallCanvas.height = grid;
  
          softWallCtx.fillStyle = 'black';
          softWallCtx.fillRect(0, 0, grid, grid);
          softWallCtx.fillStyle = '#a9a9a9';
  
          softWallCtx.fillRect(1, 1, grid - 2, 20);
  
          softWallCtx.fillRect(0, 23, 20, 18);
          softWallCtx.fillRect(22, 23, 42, 18);
  
          softWallCtx.fillRect(0, 43, 42, 20);
          softWallCtx.fillRect(44, 43, 20, 20);
  
          const wallCanvas = document.createElement('canvas');
          const wallCtx = wallCanvas.getContext('2d');
          wallCanvas.width = wallCanvas.height = grid;
  
          wallCtx.fillStyle = 'black';
          wallCtx.fillRect(0, 0, grid, grid);
          wallCtx.fillStyle = 'white';
          wallCtx.fillRect(0, 0, grid - 2, grid - 2);
          wallCtx.fillStyle = '#a9a9a9';
          wallCtx.fillRect(2, 2, grid - 4, grid - 4);
  
          const types = {
              wall: '▉',
              softWall: 1,
              bomb: 2
          };
  
          let entities = [];
  
          let cells = [];
          const template = [
              ['▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉'],
              ['▉', 'x', 'x',, , , , , , , , 'x', 'x', '▉'],
              ['▉', 'x', '▉',, '▉',, '▉',, '▉',, '▉',, '▉', 'x', '▉'],
              ['▉', 'x',, , , , , , , , , , , 'x', '▉'],
              ['▉',, '▉',, '▉',, '▉',, '▉',, '▉',, '▉',, '▉'],
              ['▉',, , , , , , , , , , , , , '▉'],
              ['▉',, '▉',, '▉',, '▉',, '▉',, '▉',, '▉',, '▉'],
              ['▉',, , , , , , , , , , , , , '▉'],
              ['▉',, '▉',, '▉',, '▉',, '▉',, '▉',, '▉',, '▉'],
              ['▉', 'x',, , , , , , , , , , 'x', '▉'],
              ['▉', 'x', '▉',, '▉',, '▉',, '▉',, '▉',, '▉', 'x', '▉'],
              ['▉', 'x', 'x',, , , , , , , , 'x', 'x', '▉'],
              ['▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉', '▉']
          ];
  
          function generateLevel() {
              cells = [];
  
              for (let row = 0; row < numRows; row++) {
                  cells[row] = [];
  
                  for (let col = 0; col < numCols; col++) {
  
                      if (!template[row][col] && Math.random() < 0.90) {
                          cells[row][col] = types.softWall;
                      } else if (template[row][col] === types.wall) {
                          cells[row][col] = types.wall;
                      }
                  }
              }
          }
  
          function blowUpBomb(bomb) {
              if (!bomb.alive) return;
  
              bomb.alive = false;
  
              cells[bomb.row][bomb.col] = null;
  
              const dirs = [{
                  // up
                  row: -1,
                  col: 0
              }, {
                  // down
                  row: 1,
                  col: 0
              }, {
                  // left
                  row: 0,
                  col: -1
              }, {
                  // right
                  row: 0,
                  col: 1
              }];
              dirs.forEach((dir) => {
                  for (let i = 0; i < bomb.size; i++) {
                      const row = bomb.row + dir.row * i;
                      const col = bomb.col + dir.col * i;
                      const cell = cells[row][col];
  
                      if (cell === types.wall) {
                          return;
                      }
  
                      entities.push(new Explosion(row, col, dir, i === 0 ? true : false));
                      cells[row][col] = null;
  
                      if (cell === types.bomb) {
                          const nextBomb = entities.find((entity) => {
                              return (
                                  entity.type === types.bomb &&
                                  entity.row === row && entity.col === col
                              );
                          });
                          blowUpBomb(nextBomb);
                      }
  
                      if (cell) {
                          return;
                      }
                  }
              });
          }
  
 
          // const player2 = {
          //     row: 1,
          //     col: 1,
          //     numBombs: 1,
          //     bombSize: 2,
          //     radius: grid * 0.65,
          //     image: new Image(),
          //     imagePath: 'mutano.png',
  
          //     init() {
          //         this.image.src = this.imagePath;
          //         this.image.onload = () => {
          //             this.render();
          //         };
          //     },
  
          //     render() {
          //         const x = (this.col + 0.5) * grid;
          //         const y = (this.row + 0.5) * grid;
  
          //         context.drawImage(this.image, x - this.radius, y - this.radius, this.radius * 2, this.radius * 2);
          //     }
          // }
  
          player.init();
  
          let last;
          let dt;
          function loop(timestamp) {
    requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!last) {
        last = timestamp;
    }
    dt = timestamp - last;
    last = timestamp;

    // Verifique se o jogo está no estado 'gameOver'
    if (gameOver) {
        // Exiba a mensagem de 'Game Over'
        context.fillStyle = 'white';
        context.font = '48px roboto';
        const message = playerWon ? 'Você Venceu!' : 'Você perdeu!';
        const messageWidth = context.measureText(message).width;
        const x = (canvas.width - messageWidth) / 2;
        const y = canvas.height / 2;
        context.fillText(message, x, y);
    } else {
        // O jogo ainda está em andamento, desenhe os elementos do jogo
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                switch (cells[row][col]) {
                    case types.wall:
                        context.drawImage(wallCanvas, col * grid, row * grid);
                        break;
                    case types.softWall:
                        context.drawImage(softWallCanvas, col * grid, row * grid);
                        break;
                }
            }
        }

        entities.forEach((entity) => {
            entity.update(dt);
            entity.render();
        });

        entities = entities.filter((entity) => entity.alive);

        player.render();

        checkGameStatus();
    }
}
        //   function loop(timestamp) {
        //       requestAnimationFrame(loop);
        //       context.clearRect(0, 0, canvas.width, canvas.height);
  
        //       if (!last) {
        //           last = timestamp;
        //       }
        //       dt = timestamp - last;
        //       last = timestamp;
  
        //       for (let row = 0; row < numRows; row++) {
        //           for (let col = 0; col < numCols; col++) {
        //               switch (cells[row][col]) {
        //                   case types.wall:
        //                       context.drawImage(wallCanvas, col * grid, row * grid);
        //                       break;
        //                   case types.softWall:
        //                       context.drawImage(softWallCanvas, col * grid, row * grid);
        //                       break;
        //               }
        //           }
        //       }
  
        //       entities.forEach((entity) => {
        //           entity.update(dt);
        //           entity.render();
        //       });
  
        //       entities = entities.filter((entity) => entity.alive);
  
        //       player.render();
  
        //       checkGameStatus();
        //   }
  
          document.addEventListener('keydown', function (e) {
              let row = player.row;
              let col = player.col;
  
              if (e.which === 37) {
                  col--;
              } else if (e.which === 38) {
                  row--;
              } else if (e.which === 39) {
                  col++;
              } else if (e.which === 40) {
                  row++;
              } else if (
                  e.which === 32 &&
                  !cells[row][col] &&
                  entities.filter((entity) => {
                      return entity.type === types.bomb && entity.owner === player
                  }).length < player.numBombs
              ) {
                  const bomb = new Bomb(row, col, player.bombSize, player);
                  entities.push(bomb);
                  cells[row][col] = types.bomb;
              }
              if (!cells[row][col]) {
                  player.row = row;
                  player.col = col;
              }
          });
  
          generateLevel();
          requestAnimationFrame(loop);
    </script>
