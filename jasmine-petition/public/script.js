(function () {
    const canvas = $("canvas");
    // console.log("canvas", canvas);
    let ctx = canvas[0].getContext("2d");
    let canvasInput = $(".canvasInput");
    let dataUrl;

    let clickStart;

    canvas.on("mousedown", function () {
        clickStart = true;
    });

    canvas.on("mousemove", function (event) {
        if (!clickStart) {
            return;
        } else {
            // ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 1;
            ctx.lineCap = "round";
            ctx.lineTo(event.pageX - 20, event.pageY - 155);
            ctx.stroke();
        }
    });

    canvas.on("mouseup", function () {
        //console.log("mouseup");
        clickStart = false;
        dataUrl = canvas[0].toDataURL();
        //console.log(dataUrl);
        //canvasInput.val(`"${dataUrl}"`);
        canvasInput.val(dataUrl);
        //console.log(canvasInput.val());
    });
})();
