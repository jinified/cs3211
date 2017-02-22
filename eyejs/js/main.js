var cpu_renderer = createRenderer('cpu');
var gpu_renderer = createRenderer('gpu');
var kernel = opts.gpuMode ? gpu_renderer : cpu_renderer;
var canvas = kernel.getCanvas();

var fps = { startTime : 0, frameNumber : 0,
           getFPS : function(display) {
              this.frameNumber++;
              var d = new Date().getTime(), currentTime = ( d - this.startTime ) / 1000, result = Math.floor( ( (this.frameNumber*10) / currentTime ) );
              if( currentTime > 1 ) {
                 this.startTime = new Date().getTime();
                 this.frameNumber = 0;
              }
              display.text(result/10.0 + ' fps');
           }
};

function toImg(width, height) {
    var gpu = new GPU();
    return gpu.createKernel(function(A) {
this.color(A[0][this.thread.y][this.thread.x],A[1][this.thread.y][this.thread.x],A[2][this.thread.y][this.thread.x]);
}).dimensions([width, height]).graphical(true);
}

function createRenderer(mode, width=opts.width) {
    var height = width / 4 * 3;
    var gpu = new GPU();
    var options = {
        dimensions: [width, height, 4],
        debug: false,
        graphical: false,
        constants: {
            height: height,
            width: width,
        },
        mode: mode
    };
    return gpu.createKernel(function (img) {
        return img[this.thread.z][this.thread.y][this.thread.x]
    }, options);
}

function render(opts) {
    fps.getFPS($('#fps'));
    var kernel = opts.gpuMode ? createRenderer("gpu", opts.width)
                              : createRenderer("cpu", opts.width);
    var container = document.getElementById("container");
    var old_canvas = document.getElementsByTagName("canvas")[0];
    height = opts.width / 4 * 3;
    kernel = toImg(opts.width, height);
    kernel(opts.loadedImage);
    var new_canvas = kernel.getCanvas();
    new_canvas.id = old_canvas.id;
    container.replaceChild(new_canvas, old_canvas);
}

