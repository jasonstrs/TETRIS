import { IPiece } from './interfaceTetris';
import { COLORS,SHAPES } from '../constants';

export class Piece implements IPiece {
    x:number;
    y:number;
    color:string;
    shape:number[][];


    constructor(private ctx: CanvasRenderingContext2D){
        this.spawn();
    }

    spawn(){
        var indexRandom:number = this.randomizeTetrominoType(COLORS.length-1);
        this.color=COLORS[indexRandom];
        this.shape=SHAPES[indexRandom];

        this.x=3;
        this.y=0;
        
    }

    draw(){
        this.ctx.fillStyle=this.color;
        this.shape.forEach((row,y)=>{
            row.forEach((value,x)=>{
                if (value > 0){
                    this.ctx.fillRect(this.x+x,this.y+y,1,1);
                    
                }
            });
            
        });   
    }

    drawNext(ctxNext: CanvasRenderingContext2D){
        ctxNext.clearRect(0, 0, ctxNext.canvas.width, ctxNext.canvas.height);

        ctxNext.fillStyle=this.color;

        for (var i=0;i<this.shape[0].length;i++)  // ce code marche aussi !
            for(var j=0;j<this.shape[0].length;j++)
                if (this.shape[i][j]>0)
                    ctxNext.fillRect(j,i,1,1);
    }

    move(p:Piece){
        this.x=p.x;
        this.y=p.y;
        this.shape=p.shape;
    }

    randomizeTetrominoType(noOfTypes: number): number {
        return Math.floor(Math.random() * noOfTypes+1);
    }
}
