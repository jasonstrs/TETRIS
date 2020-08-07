import { Injectable } from '@angular/core';
import { ROWS, COLS, Points } from '../constants';
import { IPiece } from '../tetris/interfaceTetris';


@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor() { }

  getEmptyBoard(): number[][] {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  isEmpty(value:number):boolean{
    return value ===0;
  }

  insideWall(x:number){
    if (x>=0 && x<COLS)
      return true;
    return false;
  }

  aboveFloor(y:number){
    return y<=ROWS;
  }

  notOccupied(board:number[][],x:number,y:number){
    if(board[y] == undefined)
      return false;
    return board[y][x] === 0;
  }

  validMove(p:IPiece,board:number[][]):boolean {
    var boolean=true;
    for (var i=0;i<p.shape[0].length;i++) 
      for(var j=0;j<p.shape[0].length;j++) {
        var x = p.x + j;
        var y = p.y + i;
        if ( !(this.isEmpty(p.shape[i][j]) || (this.insideWall(x) && this.aboveFloor(y) && this.notOccupied(board, x, y))))
          boolean=false;
      }
    return boolean;
  }

  rotate(p: IPiece): IPiece {
    // Cloning with JSON
    let clone: IPiece = JSON.parse(JSON.stringify(p));
    // Transpose matrix
    for (let y = 0; y < clone.shape.length; ++y) 
      for (let x = 0; x < y; ++x) 
        [clone.shape[x][y], clone.shape[y][x]] = [clone.shape[y][x], clone.shape[x][y]];
      
    // Reverse the order of the columns.
    clone.shape.forEach(row => row.reverse());
    return clone;
  }
  

  getLineClearPoints(lines: number,level:number): number {
    const linePoints =  lines === 1 ? Points.SINGLE :
           lines === 2 ? Points.DOUBLE :
           lines === 3 ? Points.TRIPLE :
           lines === 4 ? Points.TETRIS : 0;

    return (level+1)*linePoints;
  }
  
}
