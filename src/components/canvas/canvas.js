define(['jquery'], function($) {

    "use strict";

    var canvas;
    var ctx;
    var maxX;
    var maxY;

    var zeroX;
    var zeroY;

    var pointPixelRate;

    var counter = 0;


    var init = function () {
        canvas = document.getElementById("canvas");
        ctx=canvas.getContext("2d");

        maxX = $(canvas).width();
        maxY = $(canvas).height();

        ctx.clearRect(0, 0, maxX, maxY);

        zeroX = maxX * .5;
        zeroY = maxY * .5;

        pointPixelRate = 60;
    };

    var scale = function (x) {
        return x * pointPixelRate;
    };

    var drawCircleAt = function (x, y, r, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(zeroX + scale(x), zeroY - scale(y), r, 0 , 2 * Math.PI);
        ctx.fill();
    };

    var drawLineAt = function drawLineAt(x1,y1, x2, y2, color) {

        var X1 = zeroX + scale(x1);
        var Y1 = zeroY - scale(y1);
        var X2 = zeroX + scale(x2);
        var Y2 = zeroY - scale(y2);

        console.log(X1, Y1, X2, Y2);

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;
        ctx.moveTo(X1, Y1);
        ctx.lineTo(X2, Y2);
        ctx.stroke();

    };

    var drawCartesian = function drawCartesian() {

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#333';
        ctx.moveTo(0, zeroY);
        ctx.lineTo(maxX, zeroY);
        ctx.moveTo(zeroX, 0);
        ctx.lineTo(zeroX, maxY);
        ctx.stroke();


        var x = zeroX;
        var y = zeroY;

        while( x > 0) {
            ctx.beginPath();
            ctx.fillStyle =  "#000";
            ctx.arc(x, y, 2, 0 , 2 * Math.PI);
            ctx.fill();
            x = x - pointPixelRate;
            counter++;
        }

        counter--;

        x = zeroX;

        while( x < 800) {
            ctx.beginPath();
            ctx.fillStyle =  "#000";
            ctx.arc(x, y, 2, 0 , 2 * Math.PI);
            ctx.fill();
            x = x + pointPixelRate;
        }

        x = zeroX;
        while( y < 600) {

            ctx.beginPath();
            ctx.fillStyle =  "#000";
            ctx.arc(x, y, 2, 0 , 2 * Math.PI);
            ctx.fill();
            y = y + pointPixelRate;
        }

        x = zeroX;
        y= zeroY;

        while( y > 0) {

            ctx.beginPath();
            ctx.fillStyle =  "#000";
            ctx.arc(x, y, 2, 0 , 2 * Math.PI);
            ctx.fill();
            y = y - pointPixelRate;
        }

    };

    var Vector = function Vector(x, y) {
        this.x = x * pointPixelRate;
        this.y = y * pointPixelRate;
    };



    Vector.prototype.draw = function () {
        ctx.beginPath();
        ctx.strokeStyle = '#ff0000';
        ctx.moveTo(zeroX, zeroY);
        ctx.lineTo(zeroX + this.x, zeroY + this.y);
        ctx.stroke();

    };

    return {
        run : function () {
            init();
            drawCartesian();
        },
        circle: drawCircleAt,
        line: drawLineAt,
        c : counter
    };

});