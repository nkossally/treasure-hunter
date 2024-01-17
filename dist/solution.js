var Stacker = /** @class */ (function () {
    function Stacker() {
        var _this = this;
        this.turn = function (cell) {
            if (!this.goldCoordinates) {
                return this.getGoldCoordinates(cell);
            }
            // The number of stairs needed is one less than
            // the level of the cell with gold.
            if (this.stairLocations.length < this.goldLevel - 1) {
                return this.setStairLocations(cell);
            }
            var areStairsBuilt = this.stairLevels[0] === this.goldLevel - 1;
            if (!areStairsBuilt) {
                return this.constructStairs(cell);
            }
            return this.goToGold(cell);
        };
        this.getGoldCoordinates = function (cell) {
            if (cell.left.type === this.gold) {
                this.goldLevel = cell.left.level;
                this.goldCoordinates = [this.x - 1, this.y];
                return this.left;
            }
            else if (cell.right.type === this.gold) {
                this.goldLevel = cell.right.level;
                this.goldCoordinates = [this.x + 1, this.y];
                return this.right;
            }
            else if (cell.up.type === this.gold) {
                this.goldLevel = cell.up.level;
                this.goldCoordinates = [this.x, this.y - 1];
                return this.up;
            }
            else if (cell.down.type === this.gold) {
                this.goldLevel = cell.down.level;
                this.goldCoordinates = [this.x, this.y + 1];
                return this.down;
            }
            return this.goToRandomDirection(cell, /* isConstructingStairCase= */ false);
        };
        this.goToGold = function (cell) {
            _this.reset();
            switch (true) {
                case cell.left.type === _this.gold:
                    return _this.left;
                case cell.right.type === _this.gold:
                    return _this.right;
                case cell.up.type === _this.gold:
                    return _this.up;
                case cell.down.type === _this.gold:
                    return _this.down;
            }
        };
        this.reset = function () {
            _this.x = 0;
            _this.y = 0;
            _this.goldCoordinates = undefined;
            _this.goldLevel = undefined;
            _this.stairLocations = [];
            _this.stairLevels = [];
            _this.hasBlock = false;
            _this.steps = [];
            _this.shouldClimbDown = false;
        };
        this.setStairLocations = function (cell) {
            var location = JSON.stringify([this.x, this.y]);
            this.stairLocations.push(location);
            this.stairLevels.push(cell.level);
            if (this.stairLocations.length === this.goldLevel - 1)
                return this.drop;
            return this.goToRandomDirection(cell, /* isConstructingStairCase= */ true);
        };
        this.constructStairs = function (cell) {
            var destinationStairIdx = this.getStairIdxThatNeedsBlock();
            var positionStr = JSON.stringify([this.x, this.y]);
            var currStairIdx = this.stairLocations.indexOf(positionStr);
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
                }
                else {
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
        this.getStairIdxThatNeedsBlock = function () {
            var stairIdx;
            for (var i = 1; i < this.goldLevel; i++) {
                if (stairIdx !== undefined)
                    break;
                for (var j = 0; j <= this.stairLocations.length - i; j++) {
                    if (this.stairLevels[j] < i) {
                        stairIdx = j;
                        break;
                    }
                }
            }
            return stairIdx;
        };
        this.getBlock = function (cell) {
            if (cell.level === 1 && !this.isStair(this.x, this.y)) {
                this.hasBlock = true;
                return this.pickup;
            }
            var dir;
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
                    dir = this.goToRandomDirection(cell, /* isConstructingStairCase= */ false);
                    break;
            }
            if (dir)
                this.steps.push(this.dirToNum[dir]);
            return dir;
        };
        this.isStair = function (x, y) {
            return this.stairLocations.includes(JSON.stringify([x, y]));
        };
        this.reverseSteps = function () {
            if (this.steps.length === 0) {
                throw new Error("no steps");
            }
            var lastStep = this.steps.pop();
            var reverseStep = this.reverseDirection[lastStep];
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
        this.goToRandomDirection = function (cell, isConstructingStairCase) {
            var dirs = this.getValidDirections(cell, isConstructingStairCase);
            if (dirs.length === 0) {
                return this.pickup;
            }
            var idx = Math.floor(Math.random() * dirs.length);
            var dir = dirs[idx];
            switch (dir) {
                case this.left:
                    this.x--;
                    return this.left;
                case this.right:
                    this.x++;
                    return this.right;
                case this.down:
                    this.y++;
                    return this.down;
                case this.up:
                    this.y--;
                    return this.up;
            }
        };
        this.getValidDirections = function (cell, isConstructingStairCase) {
            var dirs = [];
            if (this.getCanGoLeft(cell) &&
                (!isConstructingStairCase || !this.isStair(this.x - 1, this.y))) {
                dirs.push(this.left);
            }
            if (this.getCanGoRight(cell) &&
                (!isConstructingStairCase || !this.isStair(this.x + 1, this.y))) {
                dirs.push(this.right);
            }
            if (this.getCanGoDown(cell) &&
                (!isConstructingStairCase || !this.isStair(this.x, this.y + 1))) {
                dirs.push(this.down);
            }
            if (this.getCanGoUp(cell) &&
                (!isConstructingStairCase || !this.isStair(this.x, this.y - 1))) {
                dirs.push(this.up);
            }
            return dirs;
        };
        //  getEmptySurroundingSquaresCount = (cell: Cell): number =>{
        //   let count = 0;
        //   if(!this.isStair(this.x - 1, this.y) && cell.left.type !== this.wall){
        //     count++;
        //   }
        //   if(!this.isStair(this.x + 1, this.y) && cell.right.type !== this.wall){
        //     count++;
        //   }
        //   if(!this.isStair(this.x, this.y + 1) && cell.down.type !== this.wall){
        //     count++;
        //   }
        //   if(!this.isStair(this.x - 1, this.y - 1) && cell.up.type !== this.wall){
        //     count++;
        //   }
        //   return count;
        // }
        this.climbToStairThatNeedsBlock = function () {
            var destinationStairIdx = _this.getStairIdxThatNeedsBlock();
            var positionStr = JSON.stringify([_this.x, _this.y]);
            var currStairIdx = _this.stairLocations.indexOf(positionStr);
            var nextStairPosStr;
            if (typeof destinationStairIdx === "number" &&
                currStairIdx > destinationStairIdx) {
                nextStairPosStr = _this.stairLocations[currStairIdx - 1];
            }
            else {
                nextStairPosStr = _this.stairLocations[currStairIdx + 1];
            }
            switch (true) {
                case nextStairPosStr === JSON.stringify([_this.x - 1, _this.y]):
                    _this.x--;
                    return _this.left;
                case nextStairPosStr === JSON.stringify([_this.x + 1, _this.y]):
                    _this.x++;
                    return _this.right;
                case nextStairPosStr === JSON.stringify([_this.x, _this.y - 1]):
                    _this.y--;
                    return _this.up;
                case nextStairPosStr === JSON.stringify([_this.x, _this.y + 1]):
                    _this.y++;
                    return _this.down;
            }
        };
        this.climbDownStair = function () {
            _this.steps = [];
            var positionStr = JSON.stringify([_this.x, _this.y]);
            var idx = _this.stairLocations.indexOf(positionStr);
            if (idx === _this.stairLocations.length - 1)
                return _this.getOffFinalStair();
            var nextStairPosStr = _this.stairLocations[idx + 1];
            var dir;
            switch (true) {
                case nextStairPosStr === JSON.stringify([_this.x - 1, _this.y]):
                    _this.x--;
                    dir = _this.left;
                    break;
                case nextStairPosStr === JSON.stringify([_this.x + 1, _this.y]):
                    _this.x++;
                    dir = _this.right;
                    break;
                case nextStairPosStr === JSON.stringify([_this.x, _this.y - 1]):
                    _this.y--;
                    dir = _this.up;
                    break;
                case nextStairPosStr === JSON.stringify([_this.x, _this.y + 1]):
                    _this.y++;
                    dir = _this.down;
                    break;
            }
            return dir;
        };
        this.getOffFinalStair = function () {
            var dir;
            switch (true) {
                case !_this.isStair(_this.x - 1, _this.y):
                    _this.x--;
                    dir = _this.left;
                    break;
                case !_this.isStair(_this.x + 1, _this.y):
                    _this.x++;
                    dir = _this.right;
                    break;
                case !_this.isStair(_this.x, _this.y - 1):
                    _this.y--;
                    dir = _this.up;
                    break;
                case !_this.isStair(_this.x, _this.y + 1):
                    _this.y++;
                    dir = _this.down;
                    break;
                default:
                    break;
            }
            if (dir) {
                _this.steps.push(_this.dirToNum[dir]);
            }
            return dir;
        };
        this.areLevelsNeighbors = function (level1, level2) {
            return Math.abs(level1 - level2) <= 1;
        };
        this.getCanGoLeft = function (cell) {
            return (cell.left.type !== this.wall &&
                this.areLevelsNeighbors(cell.level, cell.left.level));
        };
        this.getCanGoRight = function (cell) {
            return (cell.right.type !== this.wall &&
                this.areLevelsNeighbors(cell.level, cell.right.level));
        };
        this.getCanGoDown = function (cell) {
            return (cell.down.type !== this.wall &&
                this.areLevelsNeighbors(cell.level, cell.down.level));
        };
        this.getCanGoUp = function (cell) {
            return (cell.up.type !== this.wall &&
                this.areLevelsNeighbors(cell.level, cell.up.level));
        };
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
            1: "right",
            2: "left",
            3: "up",
            4: "down",
        };
        this.dirToNum = {
            "left": 1,
            "right": 2,
            "down": 3,
            "up": 4,
        };
    }
    return Stacker;
}());
