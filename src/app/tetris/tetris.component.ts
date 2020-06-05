import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { COLS, BLOCK_SIZE, ROWS, KEYCODE, COLORS, Points, LINES_PER_LEVEL, Level } from '../constants';
import { BoardService } from '../services/board.service';
import { Piece } from './Piece';
import { IPiece } from './interfaceTetris';

@Component({
  selector: 'app-tetris',
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.css']
})
export class TetrisComponent implements OnInit {
  // reference canvas
  @ViewChild('board',{static:true})
  canvas:ElementRef<HTMLCanvasElement>;

  // reference next canvas
  @ViewChild('next',{static:true})
  canvasNext:ElementRef<HTMLCanvasElement>;

  @HostListener('window:keydown', ['$event'])
  keyEvent(event:KeyboardEvent){
    if(this.moves[event.keyCode]){ // si ça correspond à nos events
      event.preventDefault();

      var p = this.moves[event.keyCode](this.piece);

      // on check si c'est un clic sur espace
      if(event.keyCode === KEYCODE.SPACE){
        while(this.boardService.validMove(p,this.board)){
          this.piece.move(p);
          this.points += Points.HARD_DROP;
          p=this.moves[KEYCODE.SPACE](this.piece);
        }
      } else if (this.boardService.validMove(p,this.board)){
        this.piece.move(p); // on déplace ensuite la piece
        this.draw();
        if(event.key === "ArrowDown")
          this.points += Points.SOFT_DROP;
      }
    }
  }

  ctx:CanvasRenderingContext2D;
  ctxNext:CanvasRenderingContext2D;
  points:number=0;
  lines:number=0;
  level:number=0;
  board:number[][];
  clear:any;
  piece:Piece;
  pieceNext:Piece;
  time:number;
  onActif:boolean=false; // permet de savoir si l'utilisateur joue ou non 
  audio:any;

  moves = {
    [KEYCODE.LEFT]:  (p: IPiece): IPiece => ({ ...p, x: p.x - 1 }),
    [KEYCODE.RIGHT]: (p: IPiece): IPiece => ({ ...p, x: p.x + 1 }),
    [KEYCODE.DOWN]:    (p: IPiece): IPiece => ({ ...p, y: p.y + 1 }),
    [KEYCODE.SPACE]:    (p: IPiece): IPiece => ({ ...p, y: p.y + 1 }),
    [KEYCODE.UP]:       (p: IPiece): IPiece => this.boardService.rotate(p)
  };

  constructor(private boardService:BoardService) { }

  ngOnInit(): void {
    this.initBoard();
    this.initNext();
    this.resetGame();
    this.drawGrid();
  }

  initBoard(){
    this.ctx = this.canvas.nativeElement.getContext('2d');

    this.ctx.canvas.width = COLS * BLOCK_SIZE;
    this.ctx.canvas.height = ROWS * BLOCK_SIZE;
    this.ctx.scale(BLOCK_SIZE,BLOCK_SIZE); // on change l'échelle, un carré 1,1 équivaut à un carré BLOCK_SIZE BLOCK_SIZE
  }

  initNext(){
    this.ctxNext = this.canvasNext.nativeElement.getContext('2d');
    this.ctxNext.canvas.width=4*BLOCK_SIZE;
    this.ctxNext.canvas.height=4*BLOCK_SIZE;
    this.ctxNext.scale(BLOCK_SIZE,BLOCK_SIZE);
  }

  play() {
    this.launchMusic();

    this.onActif=true;
    this.resetGame();
    this.board = this.boardService.getEmptyBoard();
    this.piece = new Piece(this.ctx);
    this.pieceNext = new Piece(this.ctx);
    this.drawGrid();
    this.piece.draw();
    this.pieceNext.drawNext(this.ctxNext);
    this.animate();
  }

  animate(){
    this.clear = setInterval(()=>{
      if(!this.drop()) // GAME OVER
        this.gameOver();
    },this.time);
  }

  drop() {
    let p = <Piece>this.moves[KEYCODE.DOWN](this.piece);
    if (this.boardService.validMove(p, this.board)) {
      this.piece.move(p);
    }
    else {
      clearInterval(this.clear);
      this.freeze();
      this.clearLines();

      if(this.piece.y === 0) // GAME OVER
        return false;
      
      this.piece = this.pieceNext;
      this.pieceNext = new Piece(this.ctx);
      this.pieceNext.drawNext(this.ctxNext);
      this.animate();
    }
    this.draw();
    return true;
  }

  freeze() {
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.board[y + this.piece.y][x + this.piece.x] = value;
        }
      });
    });
  }

  drawBoard() {
    this.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = COLORS[value];
          this.ctx.fillRect(x, y, 1, 1);
        }
      });
    });
  }

  drawBorder(xPos, yPos, width, height) { // on dessine un carré noir
    this.ctx.fillStyle='#000';
    this.ctx.fillRect(xPos, yPos, width, height);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawGrid();
    this.piece.draw();
    this.drawBoard();
  }

  clearLines(){
    let nbLigne=0;

    this.board.forEach((row,y)=>{
      // si il y a des valeurs sur toutes la lignes
      if (row.every(value => value > 0)){
        // on supprime la ligne
        this.board.splice(y,1);

        // on ajoute une ligne de 0 en haut !
        this.board.unshift(Array(COLS).fill(0));
        nbLigne++;
      }
    });

    if(nbLigne > 0){
      this.points += this.boardService.getLineClearPoints(nbLigne,this.level);
      this.lines += nbLigne;

      // on regarde si on peut passer au niveau suivant
      if(this.lines >= LINES_PER_LEVEL){ 
        this.level++; // on augmente le niveau
        this.lines -= LINES_PER_LEVEL; // on soustrait les lignes
        if (this.level < Level.length) // si on est pas au max
          this.time = Level[this.level]; // on augmente la vitesse
      }
    }
    
  }

  resetGame(){
    clearInterval(this.clear); // on clear
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // on vide le canvas
    this.ctxNext.clearRect(0, 0, this.ctxNext.canvas.width, this.ctxNext.canvas.height); // on vide le canvas next
    this.time = Level[0]; // on stocke le temps du level 0
    this.points=0;
    this.lines=0;
    this.level=0;
    this.board=this.boardService.getEmptyBoard();
  }

  gameOver(){
    clearInterval(this.clear);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(1, 3, 8, 1.2);
    this.ctx.font = '1px Arial';
    this.ctx.fillStyle = 'red';
    this.ctx.fillText('GAME OVER', 1.2, 4);
  }

  leaveGame(){
    this.stopMusic();
    this.onActif=false;
    this.resetGame();
    this.drawGrid();
  }

  drawGrid(){
    this.board.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 0) {
          this.drawBorder(x,y,1,1);
          this.ctx.fillStyle='#FFF';
          this.ctx.fillRect(x+0.005, y+0.005, 1-0.005, 1-0.005); // on fait un rectangle blanc plus petit
        }
      });
    });
  }

  launchMusic(){
    this.audio = new Audio('assets/originalTetris.mp4');
    this.audio.play();
  }

  stopMusic(){
    this.audio.pause();
    this.audio.currentTime=0;
  }

  

}
