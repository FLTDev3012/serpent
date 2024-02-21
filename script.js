window.onload = function()
{
    var canvasWidth = 900;
    var canvasHeight = 600;
    var blockSize = 30;
    var ctx;
    var delay = 100;
    var snackee;
    var applee;
    var widthInBlocks = canvasWidth/blockSize;
    var heightInBlocks = canvasHeight/blockSize;
    var score;
    var timeout;

    init();
    
    function init()
    {
        var canvas = document.createElement("canvas")
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.border = "30px solid gray";
        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#ddd";
;        document.body.appendChild(canvas);
        ctx = canvas.getContext("2d")
        snackee = new Snacke([[6,4],[5,4],[4,4]], "right");
        applee = new Apple([10,10]);
        score = 0;
        refreshCanvas();
    }

    function refreshCanvas()
    {
        snackee.advance();
        if (snackee.checkCollision())
        {
            gameOver();
        }
        else
        {
            if (snackee.isEatingApple(applee))
            {
                score++;
                snackee.ateApple = true;
                do
                {
                applee.setNewPosition();
                }
                while(applee.isOnSnake(snackee))
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawScore();
            snackee.draw();
            applee.draw();
            timeout = setTimeout(refreshCanvas, delay);
        }
    }
        
    function gameOver()
    {
        ctx.save();
        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        var centreX = canvasWidth / 2;
        var centreY = canvasHeight / 2;
        ctx.strokeText("Game Over", centreX, centreY - 180);
        ctx.fillText("Game Over", centreX, centreY - 180);
        ctx.font = "bold 30px sans-serif";
        ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        ctx.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        ctx.restore();
    }
    function restart()
    {
         snackee = new Snacke([[6,4],[5,4],[4,4]], "right");
        applee = new Apple([10,10]);
        score = 0;
        clearTimeout(timeout);
        refreshCanvas();   
    }
        
    function drawScore()
    {
        ctx.save();
        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var centerX = canvasWidth / 2;
        var centerY = canvasHeight / 2;
        ctx.fillText(score.toString(), centerX, centerY);
         ctx.restore();
    }
    function drawBlock(ctx, position)
    {

        var x = position[0] * blockSize;
        var y = position[1] * blockSize;
        ctx.fillRect(x, y, blockSize, blockSize);
    }
    function Snacke(body, direction)
    {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;
        this.draw = function()
        {
            ctx.save();
            ctx.fillStyle = "#ff0000";
            for(var i = 0; i < this.body.length; i++)
            {
                drawBlock(ctx, this.body[i]);
            }
            ctx.restore();

        };
        this.advance = function()
        {
            var nextPosition = this.body[0].slice();
            switch(this.direction)
            {
                case "left":
                    nextPosition[0] -= 1;
                    break;
                case "right":
                    nextPosition[0] += 1;
                    break;
                case "up":
                    nextPosition[1] -= 1;
                    break;
                case "down":
                    nextPosition[1] += 1;
                    break;
                default:
                    throw("Invalid Direction");
            }
            this.body.unshift(nextPosition);
            if(!this.ateApple)
                this.body.pop();
            else
                this.ateApple = false;  
        };
        this.setDirection = function(newDirection)
        {
            var allowedDirections;
            switch(this.direction)
            {
                case "left":
                case "right":
                    allowedDirections = ["up","down"];
                    break;
                case "up":
                case "down":
                    allowedDirections = ["left","right"];
                    break;
                default:
                    throw("Invalid Direction");
            }
            if(allowedDirections.indexOf(newDirection) > -1)
            {
                this.direction = newDirection;
            }
        };
        this.checkCollision = function()
        {
            var wallCollision = false;
            var snackeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snackeX = head[0];
            var snackeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = widthInBlocks - 1;
            var maxY = heightInBlocks - 1;
            var isNotBetweenHorizontalWalls = snackeX < minX || snackeX > maxX;
            var isNotBetweenVerticalWalls = snackeY < minY || snackeY > maxY;
            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls)
            {
                wallCollision = true;
            }
            for (var i = 0 ; i < rest.length ; i++)
            {
                if (snackeX === rest[i][0] && snackeY === rest[i][1])
                {
                    snackeCollision = true;
                }
            }
            return wallCollision || snackeCollision;

        };
        this.isEatingApple = function(appleToEat)
        {
            var head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
                return true;
            else
                return false;
        };
    }
    function Apple(position)
    {
        this.position = position;
        this.draw = function()
        {
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            var radius = blockSize/2;
            var x = this.position[0]*blockSize + radius;
            var y = this.position[1]*blockSize + radius;
            ctx.arc(x, y, radius, 0, Math.PI*2, true);
            ctx.fill();
            ctx.restore();
        };
        this.setNewPosition = function()
        {
            var newX = Math.round( Math.random() *(widthInBlocks - 1));
            var newY = Math.round( Math.random() *(heightInBlocks - 1));
            this.position = [newX, newY];

        };
        this.isOnSnake = function(snakeToCheck)
        {
            var isOnSnake = false;
            
            for(var i = 0 ; i < snakeToCheck.body.lenght; i++)
            {
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[0] === snakeToCheck.body[i][1])
                
                    {
                        isOnSnake = true;
                    }
            }
            
            return isOnSnake;
        };
    }

    document.onkeydown = function handleKeydown(e)
    {
        var key = e.keyCode;
        var newDirection;
        switch(key)
        {
            case 37:
                newDirection = "left";
                break;
            case 38:
                newDirection = "up";
                break;
            case 39:
                newDirection = "right";
                break;
            case 40:
                newDirection = "down";
                break;
            case 32:
                restart();
                return;
            default:
                return;
        }
        snackee.setDirection(newDirection);
    }
}