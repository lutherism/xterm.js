import { IRenderLayer } from './Interfaces';
import { IBuffer, ICharMeasure, ITerminal } from '../Interfaces';
import { CHAR_DATA_ATTR_INDEX } from '../Buffer';
import { TANGO_COLORS } from './Color';
import { GridCache } from './GridCache';
import { FLAGS } from './Types';

export class BackgroundRenderLayer implements IRenderLayer {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _state: {start: [number, number], end: [number, number]};

  constructor(container: HTMLElement) {
    this._canvas = document.createElement('canvas');
    this._canvas.classList.add('xterm-bg-layer');
    this._ctx = this._canvas.getContext('2d');
    this._ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this._ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    container.appendChild(this._canvas);
    this._state = {
      start: null,
      end: null
    };
  }

  public resize(terminal: ITerminal, canvasWidth: number, canvasHeight: number, charSizeChanged: boolean): void {
    this._canvas.width = canvasWidth * window.devicePixelRatio;
    this._canvas.height = canvasHeight * window.devicePixelRatio;
    this._canvas.style.width = `${canvasWidth}px`;
    this._canvas.style.height = `${canvasHeight}px`;
  }

  public render(terminal: ITerminal, startRow: number, endRow: number): void {
    const scaledCharWidth = Math.ceil(terminal.charMeasure.width) * window.devicePixelRatio;
    const scaledCharHeight = Math.ceil(terminal.charMeasure.height) * window.devicePixelRatio;

    const start = terminal.selectionManager.selectionStart;
    const end = terminal.selectionManager.selectionEnd;

    // TODO: Need to redraw selection if the viewport has moved

    // Selection has not changed
    if (this._state.start === start || this._state.end === end) {
      return;
    }

    // Remove all selections
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // Selection does not exist
    if (!start || !end) {
      return;
    }

    // Translate from buffer position to viewport position
    const viewportStartRow = start[1] - terminal.buffer.ydisp;
    const viewportEndRow = end[1] - terminal.buffer.ydisp;
    const viewportCappedStartRow = Math.max(viewportStartRow, 0);
    const viewportCappedEndRow = Math.min(viewportEndRow, terminal.rows - 1);

    // No need to draw the selection
    if (viewportCappedStartRow >= terminal.rows || viewportCappedEndRow < 0) {
      return;
    }

    // Create the selections
    // Draw first row
    const startCol = viewportStartRow === viewportCappedStartRow ? start[0] : 0;
    const endCol = viewportCappedStartRow === viewportCappedEndRow ? end[0] : terminal.cols;
    this._ctx.fillRect(startCol * scaledCharWidth, viewportCappedStartRow * scaledCharHeight, (endCol - startCol) * scaledCharWidth, scaledCharHeight);
    // documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, startCol, endCol));
    // Draw middle rows
    // const middleRowsCount = viewportCappedEndRow - viewportCappedStartRow - 1;
    // documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow + 1, 0, this._terminal.cols, middleRowsCount));
    // // Draw final row
    // if (viewportCappedStartRow !== viewportCappedEndRow) {
    //   // Only draw viewportEndRow if it's not the same as viewporttartRow
    //   const endCol = viewportEndRow === viewportCappedEndRow ? end[0] : this._terminal.cols;
    //   documentFragment.appendChild(this._createSelectionElement(viewportCappedEndRow, 0, endCol));
    // }
    // this._terminal.selectionContainer.appendChild(documentFragment);
  }
}
