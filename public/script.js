(function () {
    const canvas = $("canvas");
    let ctx = canvas[0].getContext("2d");
    let canvasInput = $(".canvasInput");
    let dataUrl;
    let clickStart;

    function draw(event) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.lineTo(
            event.pageX - canvas[0].offsetLeft,
            event.pageY - canvas[0].offsetTop
        );
        ctx.stroke();
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
       
    });
})();
