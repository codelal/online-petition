(function () {
    const canvas = $("canvas");
    // console.log("canvas", canvas);
    let ctx = canvas[0].getContext("2d");
    let canvasInput = $(".canvasInput");
    let dataUrl;
    let clickStart;

    function draw(event) {
        //ctx.beginPath();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.lineTo(event.pageX - 200, event.pageY - 670);
        ctx.stroke();
        // ctx.beginPath();
        // ctx.moveTo(event.pageX - 330, event.pageY -600);
    }

    canvas.on("mousedown", function (event) {
        clickStart = true;
        draw(event);
    });

    canvas.on("mousemove", function (event) {

        if (!clickStart) {
            return;
        } else {
            draw(event);
        }
    });

    canvas.on("mouseup", function () {
        clickStart = false;
        ctx.beginPath();
        dataUrl = canvas[0].toDataURL();
        canvasInput.val(dataUrl);
        //console.log(canvasInput.val());
    });
})();
