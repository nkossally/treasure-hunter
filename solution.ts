interface CellData {
  type: number;
  level: number;
}

interface Cell {
  left: CellData;
  up: CellData;
  right: CellData;
  down: CellData;
  type: number;
  level: number;
}

class Stacker {
  x: number;
  y: number;
  goldCoordinates: undefined;
  goldLevel: undefined;
  stairLocations: string[];
  stairLevels: number[];
  hasBlock: boolean;
  steps: string[];
  shouldClimbDown: boolean;
  empty: number;
  wall: number;
  block: number;
  gold: number;
  left: string;
  right: string;
  up: string;
  down: string;
  pickup: string;
  drop: string;
  reverseDirection: any;

  constructor() {
    this.x = 0;
    this.y = 0;
    this.goldCoordinates = undefined;
    this.goldLevel = undefined;
    this.stairLocations = [];
    this.stairLevels = [];
    this.hasBlock = false;
    this.steps = [];
    this.shouldClimbDown = false;
    this.empty = 0;
    this.wall = 1;
    this.block = 2;
    this.gold = 3;
    this.left = "left";
    this.right = "right";
    this.up = "up";
    this.down = "down";
    this.pickup = "pickup";
    this.drop = "drop";
    this.reverseDirection = {
      left: "right",
      right: "left",
      up: "down",
      down: "up",
    };
  }

  turn = function (cell: Cell): string {
    if (!this.goldCoordinates) {
      return this.getGoldCoordinates(cell);
    }

    // The number of stairs needed is one less than
    // the level of the cell with gold.
    if (this.stairLocations.length < this.goldLevel - 1) {
      return this.setStairLocations(cell);
    }

    const areStairsBuilt = this.stairLevels[0] === this.goldLevel - 1;
    if (!areStairsBuilt) {
      return this.constructStairs(cell);
    }

    return this.goToGold(cell);
  };

  getGoldCoordinates = function (cell: Cell): string {
    if (cell.left.type === this.gold) {
      this.goldLevel = cell.left.level;
      this.goldCoordinates = [this.x - 1, this.y];
      return this.drop;
    } else if (cell.right.type === this.gold) {
      this.goldLevel = cell.right.level;
      this.goldCoordinates = [this.x + 1, this.y];
      return this.drop;
    } else if (cell.up.type === this.gold) {
      this.goldLevel = cell.up.level;
      this.goldCoordinates = [this.x, this.y - 1];
      return this.drop;
    } else if (cell.down.type === this.gold) {
      this.goldLevel = cell.down.level;
      this.goldCoordinates = [this.x, this.y + 1];
      return this.drop;
    }
    return this.goToRandomDirection(cell);
  };

  goToGold = (cell: Cell): string | undefined => {
    this.reset();
    switch (true) {
      case cell.left.type === this.gold:
        return this.left;
      case cell.right.type === this.gold:
        return this.right;
      case cell.up.type === this.gold:
        return this.up;
      case cell.down.type === this.gold:
        return this.down;
    }
  };

  reset = (): void => {
    this.x = 0;
    this.y = 0;
    this.goldCoordinates = undefined;
    this.goldLevel = undefined;
    this.stairLocations = [];
    this.stairLevels = [];
    this.hasBlock = false;
    this.steps = [];
    this.shouldClimbDown = false;
  };

  setStairLocations = function (cell: Cell): string | undefined {
    const location = JSON.stringify([this.x, this.y]);
    const leftStr = JSON.stringify([this.x - 1, this.y]);
    const rightStr = JSON.stringify([this.x + 1, this.y]);
    const upStr = JSON.stringify([this.x, this.y - 1]);
    const downStr = JSON.stringify([this.x, this.y + 1]);

    this.stairLocations.push(location);
    this.stairLevels.push(cell.level);
    if (this.stairLocations.length === this.goldLevel - 1) return this.drop;

    return this.goToRandomDirection(cell);
  };

  constructStairs = function (cell: Cell): string | undefined {
    const destinationStairIdx = this.getStairIdxThatNeedsBlock();
    const positionStr = JSON.stringify([this.x, this.y]);
    const currStairIdx = this.stairLocations.indexOf(positionStr);

    if (currStairIdx === -1) {
      this.shouldClimbDown = false;
    }

    if (this.hasBlock && currStairIdx !== -1) {
      if (destinationStairIdx === currStairIdx) {
        this.hasBlock = false;
        this.steps = [];
        this.stairLevels[destinationStairIdx]++;
        this.shouldClimbDown = true;
        return this.drop;
      } else {
        return this.climbToStairThatNeedsBlock();
      }
    }

    if (currStairIdx !== -1 && !this.hasBlock) {
      return this.climbDownStair(cell);
    }

    if (this.shouldClimbDown) {
      return this.climbDownStair(cell);
    }

    if (this.hasBlock) {
      return this.reverseSteps(cell);
    }

    if (!this.hasBlock) {
      return this.getBlock(cell);
    }
  };

  getStairIdxThatNeedsBlock = function (): number | undefined {
    let stairIdx: number | undefined;
    for (let i = 1; i < this.goldLevel; i++) {
      if (stairIdx !== undefined) break;
      for (let j = 0; j <= this.stairLocations.length - i; j++) {
        if (this.stairLevels[j] < i) {
          stairIdx = j;
          break;
        }
      }
    }
    return stairIdx;
  };

  getBlock = function (cell: Cell): string | undefined {
    if (cell.level === 1 && !this.isStair(this.x, this.y)) {
      this.hasBlock = true;
      return this.pickup;
    }
    let dir: string | undefined;
    switch (true) {
      case cell.left.level === 1 && !this.isStair(this.x - 1, this.y):
        this.x--;
        dir = this.left;
        break;
      case cell.right.level === 1 && !this.isStair(this.x + 1, this.y):
        this.x++;
        dir = this.right;
        break;
      case cell.down.level === 1 && !this.isStair(this.x, this.y + 1):
        this.y++;
        dir = this.down;
        break;
      case cell.up.level === 1 && !this.isStair(this.x, this.y - 1):
        this.y--;
        dir = this.up;
        break;
      default:
        dir = this.goToRandomDirection(cell);
        break;
    }
    this.steps.push(dir);
    return dir;
  };

  isStair = function (x: number, y: number): boolean {
    return this.stairLocations.includes(JSON.stringify([x, y]));
  };

  reverseSteps = function (): string {
    if (this.steps.length === 0) {
      throw new Error("no steps");
    }
    const lastStep = this.steps.pop();
    const reverseStep = this.reverseDirection[lastStep];
    switch (reverseStep) {
      case this.left:
        this.x--;
        break;
      case this.right:
        this.x++;
        break;
      case this.up:
        this.y--;
        break;
      case this.down:
        this.y++;
        break;
    }
    return reverseStep;
  };

  goToRandomDirection = function (cell: Cell): string | undefined {
    var n = (Math.random() * 4) >> 0;
    switch (n) {
      case 0:
        if (this.getCanGoLeft(cell) && !this.isStair(this.x - 1, this.y)) {
          this.x--;
          return this.left;
        } else {
          return this.goToRandomDirection(cell);
        }
      case 1:
        if (this.getCanGoRight(cell) && !this.isStair(this.x + 1, this.y)) {
          this.x++;
          return this.right;
        } else {
          return this.goToRandomDirection(cell);
        }
      case 2:
        if (this.getCanGoDown(cell) && !this.isStair(this.x, this.y + 1)) {
          this.y++;
          return this.down;
        } else {
          return this.goToRandomDirection(cell);
        }
      case 3:
        if (this.getCanGoUp(cell) && !this.isStair(this.x, this.y - 1)) {
          this.y--;
          return this.up;
        } else {
          return this.goToRandomDirection(cell);
        }
    }
  };

  climbToStairThatNeedsBlock = (): string | undefined => {
    const destinationStairIdx = this.getStairIdxThatNeedsBlock();
    const positionStr = JSON.stringify([this.x, this.y]);
    const currStairIdx = this.stairLocations.indexOf(positionStr);
    let nextStairPosStr: string | undefined;
    if (
      typeof destinationStairIdx === "number" &&
      currStairIdx > destinationStairIdx
    ) {
      nextStairPosStr = this.stairLocations[currStairIdx - 1];
    } else {
      nextStairPosStr = this.stairLocations[currStairIdx + 1];
    }

    switch (true) {
      case nextStairPosStr === JSON.stringify([this.x - 1, this.y]):
        this.x--;
        return this.left;
      case nextStairPosStr === JSON.stringify([this.x + 1, this.y]):
        this.x++;
        return this.right;
      case nextStairPosStr === JSON.stringify([this.x, this.y - 1]):
        this.y--;
        return this.up;
      case nextStairPosStr === JSON.stringify([this.x, this.y + 1]):
        this.y++;
        return this.down;
    }
  };

  climbDownStair = (): string | undefined => {
    this.steps = [];
    const positionStr = JSON.stringify([this.x, this.y]);
    const idx = this.stairLocations.indexOf(positionStr);
    if (idx === this.stairLocations.length - 1) return this.getOffFinalStair();

    const nextStairPosStr = this.stairLocations[idx + 1];

    let dir: string | undefined;
    switch (true) {
      case nextStairPosStr === JSON.stringify([this.x - 1, this.y]):
        this.x--;
        dir = this.left;
        break;
      case nextStairPosStr === JSON.stringify([this.x + 1, this.y]):
        this.x++;
        dir = this.right;
        break;
      case nextStairPosStr === JSON.stringify([this.x, this.y - 1]):
        this.y--;
        dir = this.up;
        break;
      case nextStairPosStr === JSON.stringify([this.x, this.y + 1]):
        this.y++;
        dir = this.down;
        break;
    }
    return dir;
  };

  getOffFinalStair = (): string | undefined => {
    let dir: string | undefined;
    switch (true) {
      case !this.isStair(this.x - 1, this.y):
        this.x--;
        dir = this.left;
        break;
      case !this.isStair(this.x + 1, this.y):
        this.x++;
        dir = this.right;
        break;
      case !this.isStair(this.x, this.y - 1):
        this.y--;
        dir = this.up;
        break;
      case !this.isStair(this.x - 1, this.y + 1):
        this.y++;
        dir = this.down;
        break;
      default:
        break;
    }
    if (dir) this.steps.push(dir);
    return dir;
  };

  areLevelsNeighbors = function (level1: number, level2: number): boolean {
    return Math.abs(level1 - level2) <= 1;
  };

  getCanGoLeft = function (cell: Cell): boolean {
    return (
      cell.left.type !== this.wall &&
      this.areLevelsNeighbors(cell.level, cell.left.level)
    );
  };

  getCanGoRight = function (cell: Cell): boolean {
    return (
      cell.right.type !== this.wall &&
      this.areLevelsNeighbors(cell.level, cell.right.level)
    );
  };

  getCanGoDown = function (cell: Cell): boolean {
    return (
      cell.down.type !== this.wall &&
      this.areLevelsNeighbors(cell.level, cell.down.level)
    );
  };

  getCanGoUp = function (cell: Cell): boolean {
    return (
      cell.up.type !== this.wall &&
      this.areLevelsNeighbors(cell.level, cell.up.level)
    );
  };
}
