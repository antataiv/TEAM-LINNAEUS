var totalRows = 20;
var totalCols = 10;
var curLevel = 1;
var curScore = 0;
var speedControl = 500;

var canvas,
    ctx,
    startScreenImage,
    blockImage,
    gameOverImage,
    currentPiece,
    gameMatrix,
    prevTime,
    curTime,
    isGameOver,
    lineSpan,
    scoreSpan,
    levelSpan,
    curLines,
    mouse,
    currentScreen,
    startGame,
    startSound,
    gameOverSound,
    brickDrop,
    lineDown,
    newLevelSound,
	canvasBackgroundImages = [];

    window.onload = getReady();


function getReady() {
    //load the images
    startScreenImage = new Image();
    startScreenImage.src = "images/startScreen.jpg"; //add the start screen image
    blockImage = new Image();
    blockImage.src = "images/blocks.png";
    gameOverImage = new Image();
    gameOverImage.src = "images/gameOver.png";

	canvasBackgroundImages[0] = new Image();
    canvasBackgroundImages[0].src = "images/canvas-bg-1.png";
    canvasBackgroundImages[1] = new Image();
    canvasBackgroundImages[1].src = "images/canvas-bg-2.jpg";
    canvasBackgroundImages[2] = new Image();
    canvasBackgroundImages[2].src = "images/canvas-bg-3.jpg";

    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    scoreSpan = document.getElementById('gameScore');
    lineSpan = document.getElementById('lines');
    levelSpan = document.getElementById('level');

    prevTime = curTime = 0;

    document.addEventListener('keydown', getInput);

    //initializeGame();
}

function initializeGame() {
    var row, col;
    curLevel = 1;
    curLines = 0;
    curScore = 0;
    isGameOver = false;

    //create the gameMatrix as array[gameRow][gameCol] of 0's
    gameMatrix = [];
    for (row = 0; row < totalRows; row++) {
        gameMatrix[row] = [];
        for (col = 0; col < totalCols; col++) {
            gameMatrix[row][col] = 0;
        }
    }

    //generate random new Piece
    currentPiece = getRandomPiece();

    startSound = new Audio('sounds/start-game.wav');
    startSound.play();

    lineSpan.innerHTML = curLines.toString();
    scoreSpan.innerHTML = curScore.toString();
    levelSpan.innerHTML = curLevel.toString();

    window.requestAnimationFrame(update);
}

function update() {
    curTime = new Date().getTime();

    if(curTime - prevTime > speedControl) {
        //check if moving down is possible and if true --> move down
        if(isMovePossible(currentPiece, currentPiece.x, currentPiece.y + 1, currentPiece.currentState)) {
            currentPiece.y += 1;
        } else {
            //if moving down is no longer possible, then end of the canvas is reached
            //save the state of the current piece on the game matrix and generate a new piece
            brickDrop = new Audio ('sounds/piece-fall.wav');
            brickDrop.play();
            saveFallenPieceState(currentPiece);
            currentPiece = getRandomPiece();
        }

        //update time
        prevTime = curTime;
    }

    drawBoard();
    drawPiece(currentPiece);
    //console.log('x=' + currentPiece.x + ' y=' + currentPiece.y);

    //check if game is not over and update the screen
    //else draw the game over image
    if(!isGameOver) {
        window.requestAnimationFrame(update);
    } else {
        startGame = false;
        gameOverSound = new Audio('sounds/game-over.wav');
        //reset counters for new game
        curLevel = 1;
        curLines = 0;
        curScore = 0;
        speedControl = 500;
        gameOverSound.play();
    }
}

function drawBoard() {
   //draw canvas background
    switch (curLevel){
        case 1: ctx.drawImage(canvasBackgroundImages[0], 0, 0, 320, 640, 0, 0, 320, 640);
            break;
        case 2: ctx.drawImage(canvasBackgroundImages[1], 0, 0, 320, 640, 0, 0, 320, 640);
            break;
        case 3: ctx.drawImage(canvasBackgroundImages[2], 0, 0, 320, 640, 0, 0, 320, 640);
            break;
        case 4: ctx.drawImage(canvasBackgroundImages[0], 0, 0, 320, 640, 0, 0, 320, 640);
            break;
        case 5: ctx.drawImage(canvasBackgroundImages[1], 0, 0, 320, 640, 0, 0, 320, 640);
            break;
        case 6: ctx.drawImage(canvasBackgroundImages[2], 0, 0, 320, 640, 0, 0, 320, 640);
            break;
        case 7: ctx.drawImage(canvasBackgroundImages[0], 0, 0, 320, 640, 0, 0, 320, 640);
            break;
        case 8: ctx.drawImage(canvasBackgroundImages[1], 0, 0, 320, 640, 0, 0, 320, 640);
            break;
        case 9: ctx.drawImage(canvasBackgroundImages[2], 0, 0, 320, 640, 0, 0, 320, 640);
            break;
        case 10: ctx.drawImage(canvasBackgroundImages[2], 0, 0, 320, 640, 0, 0, 320, 640);
            break;
    }

    //redraw the already saved previous state of the game matrix
    for (var row = 0; row < totalRows; row++) {
        for (var col = 0; col < totalCols; col++) {
            if(gameMatrix[row][col] != 0) {
                ctx.drawImage(blockImage, gameMatrix[row][col] * 32, 0, 32, 32, col * 32, row * 32, 32, 32);
            }
        }
    }
}

function drawPiece(piece) {
    var drawX = piece.x;
    var drawY = piece.y;
    var state = piece.currentState;
    var pieceRowLength = piece.states[state].length;

    //iterate through the array[][] that represents the current state of the piece
    //and draw the color index of the current piece(piece.colorIndex) on !=0 value
    for (var row = 0; row < pieceRowLength; row++) {
        var pieceColLength = piece.states[state][row].length;
        for (var col = 0; col < pieceColLength; col++) {
            if(piece.states[state][row][col] != 0 && drawY >= 0 && drawY < totalRows) {
                ctx.drawImage(blockImage, piece.colorIndex * 32, 0, 32, 32, drawX * 32, drawY * 32, 32, 32);
            }
            drawX += 1;
        }
        drawX = piece.x;
        drawY += 1;
    }
    //console.log('drawX=' + drawX + ' drawY=' + drawY);
}

function isMovePossible(piece, x, y, state) {
    var result = true;
    var newX = x;
    var newY = y;
    var pieceRowLength = piece.states[state].length;

    //iterate through the array[][] that represents the current state of the piece
    //and check if the new positions of x and y are !=0 - if true - move cannot be done
    for (var row = 0; row < pieceRowLength; row++) {
        var pieceColLength = piece.states[state][row].length;
        for (var col = 0; col < pieceColLength; col++) {
            //check if the new position of x will be outside the bounds of the canvas
            if(newX < 0 && newX > totalCols) {
                result = false;
                col = pieceColLength;
                row = pieceRowLength;
            }
            //check if the new position of y will be on row that is already defined (example: not on row 20)
            //and if the new position in the gameMatrix is not free
            else if(gameMatrix[newY] != undefined && gameMatrix[newY][newX] != 0 && piece.states[state][row][col] != 0) {
                result = false;
                col = pieceColLength;
                row = pieceRowLength;
            }
            newX += 1;
        }
        newX = x;
        newY += 1;

        if(newY > totalRows) {
            result = false;
            row = pieceRowLength;
        }
    }
    //console.log('newX=' + newX + ' newY=' + newY);
    return result;
}

function saveFallenPieceState(piece) {
    var xPos = piece.x;
    var yPos = piece.y;
    var state = piece.currentState;
    var pieceRowLength = piece.states[state].length;

    for (var row = 0; row < pieceRowLength; row++) {
        var pieceColLength = piece.states[state][row].length;
        for (var col = 0; col < pieceColLength; col++) {
            if(piece.states[state][row][col] == 1 && yPos >= 0) {
                gameMatrix[yPos][xPos] = piece.colorIndex;
            }
            xPos += 1;
        }
        xPos = piece.x;
        yPos += 1;
    }

    //check for full lines and remove them
    checkIfLineIsFull();

    //check if the y coordinate of the current piece is 0
    //meaning it is on top of the canvas and the next element cannot be shown - game is over
    if(piece.y === 0){
        isGameOver = true;
    }
}

function checkIfLineIsFull() {
    var lineFound = 0;

    var row = totalRows - 1;
    var col = totalCols - 1;

    while(row >= 0){
        var lineIsFull = true;
        while(col >= 0) {
            //if we find one empty cell => line is not full
            //and break the inner while
            if(gameMatrix[row][col] == 0){
                lineIsFull = false;
                col = -1;
            }
            col--;

        }

        //if we don't find an empty cell on the current row => it is full
        if(lineIsFull){
            lineDown = new Audio('sounds/line-down.wav');
            lineDown.play();
            lineFound++;
            curLines++;
            curScore+=20;

            //change level and speed
            //if (curLines >= 3 && curLines<5){
            //    newLevelSound = new Audio('sounds/new-level.wav');
            //    newLevelSound.play();
            //    curLevel = 2;
            //    speedControl = 300;
            //}
            //
            //if (curLines >= 5){
            //    newLevelSound = new Audio('sounds/new-level-1.wav');
            //    newLevelSound.play();
            //    curLevel = 3;
            //    speedControl = 100;
            //}

            switch(curLines) {
                case 15:
                    newLevelSound = new Audio('sounds/new-level.wav');
                    newLevelSound.play();
                    curLevel = 2;
                    speedControl = 450;
                    break;
                case 30:
                    newLevelSound = new Audio('sounds/new-level.wav');
                    newLevelSound.play();
                    curLevel = 3;
                    speedControl = 400;
                    break;
                case 45:
                    newLevelSound = new Audio('sounds/new-level.wav');
                    newLevelSound.play();
                    curLevel = 4;
                    speedControl = 350;
                    break;
                case 60:
                    newLevelSound = new Audio('sounds/new-level.wav');
                    newLevelSound.play();
                    curLevel = 5;
                    speedControl = 300;
                    break;
                case 75:
                    newLevelSound = new Audio('sounds/new-level.wav');
                    newLevelSound.play();
                    curLevel = 6;
                    speedControl = 250;
                    break;
                case 90:
                    newLevelSound = new Audio('sounds/new-level.wav');
                    newLevelSound.play();
                    curLevel = 7;
                    speedControl = 200;
                    break;
                case 105:
                    newLevelSound = new Audio('sounds/new-level-1.wav');
                    newLevelSound.play();
                    curLevel = 8;
                    speedControl = 150;
                    break;
                case 120:
                    newLevelSound = new Audio('sounds/new-level-1.wav');
                    newLevelSound.play();
                    curLevel = 9;
                    speedControl = 100;
                    break;
                case 135:
                    newLevelSound = new Audio('sounds/new-level-1.wav');
                    newLevelSound.play();
                    curLevel = 10;
                    speedControl = 50;
                    break;
            }

            //delete the current row
            deleteFullRow(row);

            //increase row + 1 in order to stay on the same line ((because in the loop control we decrease it -1 by default))
            //example full rows are 18 and 17, we delete row 18 and line 17 becomes 18
            //for this reason we increase the current row with +1 (it becomes 19) and then decrease it by the loop control -1
            //so we are still on line 18 and can check it once more for another full row
            row++;
        }
        row--;
        col = totalCols - 1;
    }

    lineSpan.innerHTML = curLines.toString();
    scoreSpan.innerHTML = curScore.toString();
    levelSpan.innerHTML = curLevel.toString();

}

//delete completed lines
function deleteFullRow(currentRow) {
    var row = currentRow;
    var col = totalCols - 1;

    //iterate through the whole game matrix and copy on the current row, the data from the row above (row - 1)
    while(row >= 0) {
        while(col >= 0) {
            //check if row is not the 1st row (not on index 0) and copy the data from the row above (row - 1)
            //this check is needed because if row is 0, then the previous row is -1 and we will get exception
            if(row > 0){
                gameMatrix[row][col] = gameMatrix[row -1][col];
            }
            else {
                //if row is the 1st row of the game matrix (index 0), fill it with 0's
                gameMatrix[row][col] = 0;
            }
            col--;
        }
        col = totalCols - 1;
        row--;
    }
}

function getInput(event) {
    //disable possible scrolling on page using the arrow keys
    event.preventDefault();

    //check the key pressed and apply action
    switch (event.keyCode) {
        case 37:
            //move left
            if(isMovePossible(currentPiece, currentPiece.x - 1, currentPiece.y, currentPiece.currentState)) {
                currentPiece.x--;
            }
            break;
        case 39:
            //move right
            if(isMovePossible(currentPiece, currentPiece.x + 1, currentPiece.y, currentPiece.currentState)) {
                currentPiece.x++;
            }
            break;
        case 38:
            //rotate
            var newState = currentPiece.currentState + 1;
            if(newState == currentPiece.states.length) {
                newState = 0;
            }

            if(isMovePossible(currentPiece, currentPiece.x, currentPiece.y, newState)) {
                currentPiece.currentState = newState;
            }
            break;
        case 40:
            //move down
            if(isMovePossible(currentPiece, currentPiece.x, currentPiece.y + 1, currentPiece.currentState)) {
                currentPiece.y++;
            }
            break;
    }
}

startGame = true;

startScreen();


//Start screen

function startScreen () {

    function beginLoop() {
        var frameId = 0;
        var lastFrame = Date.now();

        function loop() {
            var thisFrame = Date.now();

            var elapsed = thisFrame - lastFrame;

            frameId = window.requestAnimationFrame(loop);

            currentScreen.update(elapsed);
            currentScreen.draw(ctx);
            lastFrame = thisFrame;

        }

        loop();
    }

    mouse = (function (target) {
        var isButtonDown = false;

        target.addEventListener('mousedown', function () {
            isButtonDown = true;

        });
        target.addEventListener('mouseup', function () {
            isButtonDown = false;
        });

        return {
            isButtonDown: function () {
                return isButtonDown;
            }
        };
    }(document));

    currentScreen = (function (input) {

        var hue = 0;
        var direction = 1;
        var transitioning = false;

        function centerText(ctx, text, y) {
            var measurement = ctx.measureText(text);
            var x = (ctx.canvas.width - measurement.width) / 2;
            ctx.fillText(text, x, y);
        }

        function draw(ctx) {


            if(startGame) {
                var y = ctx.canvas.height / 2;
                var color = 'rgb(' + hue + ',140,10)';
                ctx.drawImage(startScreenImage, 0, 0, 320, 640, 0, 0, 320, 640);

                ctx.fillStyle = color;
                ctx.font = 'bold 24px monospace';
                centerText(ctx, 'click to start', y + 180);
            } else {

                ctx.drawImage(gameOverImage, 0, 0, 320, 640, 0, 0, 320, 640);
            }

        }

        function update() {

            hue += direction;
            if (hue > 255) direction = -1;
            if (hue < 0) direction = 1;

            var isButtonDown = input.isButtonDown();

            if (isButtonDown && !transitioning) {
                transitioning = true;
                initializeGame();
                startSound = new Audio('sounds/start-game.wav');
                startSound.play();
            }

        }

        return {
            draw: draw,
            update: update
        };
    }(mouse));

    beginLoop();

}