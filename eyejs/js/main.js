var gpu = new GPU();
var animIndex = 0;
var cpu_renderer = createRenderer('cpu');
var gpu_renderer = createRenderer('gpu');
var kernel = opts.gpuMode ? gpu_renderer : cpu_renderer;
var canvas = kernel.getCanvas();
var gpuFilter = makeAvgFilter('gpu', opts.width, opts.height);
var marquee = makeAnimator('gpu', opts.width, opts.height);
var sobelKernel = [[-1, 0, 1],
                   [-2, 0, 2],
                   [-1, 0, 1]];


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
    return gpu.createKernel(function(A) {
this.color(A[0][this.thread.y][this.thread.x],A[1][this.thread.y][this.thread.x],A[2][this.thread.y][this.thread.x]);
}).dimensions([width, height]).graphical(true);
}

function createRenderer(mode, width=opts.width, height=opts.height) {
    var options = {
        dimensions: [width, height, 4],
        debug: true,
        graphical: false,
        outputToTexture: true,
        constants: {
            height: height,
            width: width,
        },
        mode: mode
    };
    return gpu.createKernel(function (img) {
        return img[this.thread.z][this.thread.y][this.thread.x];
    }, options);
}

function render() {
    fps.getFPS($('#fps'));
    var rgb2gray = toGrayscale('gpu', opts.width, opts.height);
    var gpuLaplacianFilter = makeLaplacianFilter('gpu', opts.width, opts.height);
    var gpuSobelFilter = makeSobelYFilter('gpu', opts.width, opts.height);
    var cpuSobelFilter = makeSobelYFilter('cpu', opts.width, opts.height);
    var gpuAvgFilter = makeAvgFilter('gpu', opts.width, opts.height);
    var cpuAvgFilter = makeAvgFilter('cpu', opts.width, opts.height);
    var kernel = opts.gpuMode ? createRenderer("gpu", opts.width)
                              : createRenderer("cpu", opts.width);
    var container = document.getElementById("container");
    var old_canvas = document.getElementsByTagName("canvas")[0];
    orig = kernel(opts.loadedImage);
    // var filtered = marquee(orig, animIndex);
    // animIndex = (animIndex+10) % opts.width;
    // var filtered = gpuSobelFilter(orig);
    var gray = rgb2gray(orig);
    var filtered = gpuLaplacianFilter(gray);
    var converter = toImg(opts.width, opts.height);
    converter(filtered);
    var new_canvas = converter.getCanvas();
    new_canvas.id = old_canvas.id;
    container.replaceChild(new_canvas, old_canvas);

    if (opts.playing) {
        setTimeout(render, opts.interval);
    }
}

function makeLaplacianFilter(mode, width, height) {
    // Creates average filter with size 3 x 3
    var opt = {
        dimensions: [width, height, 4],
        debug: true,
        graphical: false,
        outputToTexture: true,
        mode: mode
    };
    var filter = gpu.createKernel(function(img) {
        var tl, t, tr, l, c, r, bl, b, br;
        if (this.thread.y > 0 && this.thread.y < this.dimensions.y - 2 && this.thread.x > 0 && this.thread.x < this.dimensions.x - 2 && this.thread.z < 3) {
            t = img[this.thread.z][this.thread.y-1][this.thread.x]*-1;
            l = img[this.thread.z][this.thread.y][this.thread.x-1]*-1;
            c = img[this.thread.z][this.thread.y][this.thread.x]*4;
            r = img[this.thread.z][this.thread.y][this.thread.x+1]*-1;
            b = img[this.thread.z][this.thread.y+1][this.thread.x]*-1;
            return t + l + c + r + b;
        } else {
            return img[this.thread.z][this.thread.y][this.thread.x];
        }
    },opt);
    return filter;
}
function makeSobelXFilter(mode, width, height) {
    // Creates average filter with size 3 x 3
    var opt = {
        dimensions: [width, height, 4],
        debug: true,
        graphical: false,
        outputToTexture: true,
        mode: mode
    };
    var filter = gpu.createKernel(function(img) {
        var tl, t, tr, l, c, r, bl, b, br;
        if (this.thread.y > 0 && this.thread.y < this.dimensions.y - 2 && this.thread.x > 0 && this.thread.x < this.dimensions.x - 2 && this.thread.z < 3) {
            tl = img[this.thread.z][this.thread.y-1][this.thread.x-1]*-1;
            // t = img[this.thread.z][this.thread.y-1][this.thread.x];
            tr = img[this.thread.z][this.thread.y-1][this.thread.x+1];
            l = img[this.thread.z][this.thread.y][this.thread.x-1]*-2;
            // c = img[this.thread.z][this.thread.y][this.thread.x];
            r = img[this.thread.z][this.thread.y][this.thread.x+1]*2;
            bl = img[this.thread.z][this.thread.y+1][this.thread.x-1]*-1;
            // b = img[this.thread.z][this.thread.y+1][this.thread.x];
            br = img[this.thread.z][this.thread.y+1][this.thread.x+1];
            return tl + tr + l + r + bl + br;
        } else {
            return img[this.thread.z][this.thread.y][this.thread.x];
        }
    },opt);
    return filter;
}


function makeSobelYFilter(mode, width, height) {
    // Creates average filter with size 3 x 3
    var opt = {
        dimensions: [width, height, 4],
        debug: true,
        graphical: false,
        outputToTexture: true,
        mode: mode
    };
    var filter = gpu.createKernel(function(img) {
        var tl, t, tr, l, c, r, bl, b, br;
        if (this.thread.y > 0 && this.thread.y < this.dimensions.y - 2 && this.thread.x > 0 && this.thread.x < this.dimensions.x - 2 && this.thread.z < 3) {
            tl = img[this.thread.z][this.thread.y-1][this.thread.x-1];
            t = img[this.thread.z][this.thread.y-1][this.thread.x]*2;
            tr = img[this.thread.z][this.thread.y-1][this.thread.x+1];
            bl = img[this.thread.z][this.thread.y+1][this.thread.x-1]*-1;
            b = img[this.thread.z][this.thread.y+1][this.thread.x]*-2;
            br = img[this.thread.z][this.thread.y+1][this.thread.x+1]*-1;
            return tl + t + tr + bl + b + br;
        } else {
            return img[this.thread.z][this.thread.y][this.thread.x];
        }
    },opt);
    return filter;
}

function makeAvgFilter(mode, width, height) {
    // Creates average filter with size 3 x 3
    var opt = {
        dimensions: [width, height, 4],
        debug: true,
        graphical: false,
        outputToTexture: true,
        mode: mode
    };
    var filter = gpu.createKernel(function(img) {
        var tl, t, tr, l, c, r, bl, b, br;
        if (this.thread.y > 0 && this.thread.y < this.dimensions.y - 2 && this.thread.x > 0 && this.thread.x < this.dimensions.x - 2 && this.thread.z < 3) {
            tl = img[this.thread.z][this.thread.y-1][this.thread.x-1];
            t = img[this.thread.z][this.thread.y-1][this.thread.x];
            tr = img[this.thread.z][this.thread.y-1][this.thread.x+1];
            l = img[this.thread.z][this.thread.y][this.thread.x-1];
            c = img[this.thread.z][this.thread.y][this.thread.x];
            r = img[this.thread.z][this.thread.y][this.thread.x+1];
            bl = img[this.thread.z][this.thread.y+1][this.thread.x-1];
            b = img[this.thread.z][this.thread.y+1][this.thread.x];
            br = img[this.thread.z][this.thread.y+1][this.thread.x+1];
            return (tl + t + tr + l + c + r + bl + b + br) / 9.0;
        } else {
            return img[this.thread.z][this.thread.y][this.thread.x];
        }
    },opt);
    return filter;
}

function toGrayscale(mode, width, height) {
    // Creates average filter with size 3 x 3
    var opt = {
        dimensions: [width, height, 4],
        debug: true,
        graphical: false,
        outputToTexture: true,
        mode: mode
    };
    var filter = gpu.createKernel(function(img) {
        if (this.thread.z < 3) {
            var r = img[0][this.thread.y][this.thread.x];
            var g = img[1][this.thread.y][this.thread.x];
            var b = img[2][this.thread.y][this.thread.x];
            return (r+g+b) / 3.0;
        } else {
            return img[this.thread.z][this.thread.y][this.thread.x];
        }
    },opt);
    return filter;
}

function makeAnimator(mode, width, height) {
    var opt = {
	dimensions: [width, height, 4],
	debug: false,
	graphical: false,
	outputToTexture: true,
	mode: mode
    };

    var filt = gpu.createKernel(function(A,x) {
        // console.log(this.dimensions.z, this.dimensions.y, this.dimensions.x);
	    return A[this.thread.z][this.thread.y][(this.thread.x + x)];
	},opt);

    return filt;
}
