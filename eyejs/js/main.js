// Initialize GPU instance and add functions
var gpu = new GPU();
gpu.addFunction(isValidIndex);

var animIndex = 0;
var resolutions = [[192, 144], [320, 240], [480, 360], [640, 480], [800, 600]];

// Various kernels
var gaussianKernel = {
    '3': [0.109634,    0.111842,    0.109634,
          0.111842,    0.114094,    0.111842,
          0.109634,    0.111842,    0.109634,],

    '5': [0.036894,    0.039167,    0.039956,    0.039167,    0.036894,
          0.039167,    0.041581,    0.042418,    0.041581,    0.039167,
          0.039956,    0.042418,    0.043272,    0.042418,    0.039956,
          0.039167,    0.041581,    0.042418,    0.041581,    0.039167,
          0.036894,    0.039167,    0.039956,    0.039167,    0.036894],

    '9': [0.008397,    0.009655,    0.010667,    0.011324,    0.011552,    0.011324,    0.010667,    0.009655,    0.008397,
          0.009655,    0.0111  ,    0.012264,    0.013019,    0.013282,    0.013019,    0.012264,    0.0111  ,    0.009655,
          0.010667,    0.012264,    0.013549,    0.014384,    0.014674,    0.014384,    0.013549,    0.012264,    0.010667,
          0.011324,    0.013019,    0.014384,    0.01527 ,    0.015578,    0.01527 ,    0.014384,    0.013019,    0.011324,
          0.011552,    0.013282,    0.014674,    0.015578,    0.015891,    0.015578,    0.014674,    0.013282,    0.011552,
          0.011324,    0.013019,    0.014384,    0.01527 ,    0.015578,    0.01527 ,    0.014384,    0.013019,    0.011324,
          0.010667,    0.012264,    0.013549,    0.014384,    0.014674,    0.014384,    0.013549,    0.012264,    0.010667,
          0.009655,    0.0111  ,    0.012264,    0.013019,    0.013282,    0.013019,    0.012264,    0.0111  ,    0.009655,
          0.008397,    0.009655,    0.010667,    0.011324,    0.011552,    0.011324,    0.010667,    0.009655,    0.008397,]
};

var laplacianKernel = {
    '3': genLaplacian(3),
    '5': genLaplacian(5),
    '9': genLaplacian(9)
};

var sobelKernel = {
    '3': [1.5,  1.5,  0.5,
          1.5,  0.5, -0.5,
          0.5, -0.5, -0.5]
};

var sobelXKernel = {
    '3': [1, 0, -1,
          2, 0, -2,
          1, 0, -1],

    '5': [2, 1, 0, -1, -2,
          3, 2, 0, -2, -3,
          4, 3, 0, -3, -4,
          3, 2, 0, -2, -3,
          2, 1, 0, -1, -2],

    '9': [4, 3, 2, 1, 0, -1, -2, -3, -4,
          5, 4, 3, 2, 0, -2, -3, -4, -5,
          6, 5, 4, 3, 0, -3, -4, -5, -6,
          7, 6, 5, 4, 0, -4, -5, -6, -7,
          8, 7, 6, 5, 0, -5, -6, -7, -8,
          7, 6, 5, 4, 0, -4, -5, -6, -7,
          6, 5, 4, 3, 0, -3, -4, -5, -6,
          5, 4, 3, 2, 0, -2, -3, -4, -5,
          4, 3, 2, 1, 0, -1, -2, -3, -4,]
};

var fps = {
    startTime : 0,
    frameNumber : 0,
    getFPS : function(display) {
        this.frameNumber++;
        var d = new Date().getTime();
        var currentTime = (d - this.startTime) / 1000;
        var result = Math.floor(((this.frameNumber*10) / currentTime));
        if( currentTime > 1 ) {
            this.startTime = new Date().getTime();
            this.frameNumber = 0;
        }
        display.text(result/10.0 + ' fps');
    }
};

// GPU kernel functions
var kernels = [genKernel(makeBoxFilter),
               genKernel(makeGaussianFilter),
               genKernel(makeSharpenFilter),
               genKernel(makeLaplacianFilter),
               genKernel(toGrayscale),
               genKernel(createRenderer),
               genKernel(makeMotion),
               genKernel(makeBlender)];

// Main render loop

function render(opts) {
    // User specified canvas resolution
    var res = opts.width;
    var kern_size = opts.kernel;
    var mode = opts.gpuMode ? "gpu" : "cpu";
    var ops = opts.operation;

    fps.getFPS($('#fps'));
    var renderer = kernels[5][res][mode];
    var converter = toImg(opts.width, opts.height);

    // Image processing
    var container = document.getElementById("container");
    var old_canvas = document.getElementsByTagName("canvas")[0];
    var filtered = renderer(opts.imgArr[res]);

    if (opts.antialias) {
        filtered = antiAlias(mode, filtered, res);
    }

    var selected_filter = kernels[ops][res][mode][kern_size];

    if (ops === '0') {
        filtered = selected_filter(filtered);
    }
    if (ops === '1') {
        filtered = selected_filter(filtered, gaussianKernel[kern_size]);
    }
    if (ops === '2') {
        filtered = selected_filter(filtered, laplacianKernel[kern_size]);
    }
    if (ops === '3') {
        filtered = selected_filter(filtered, laplacianKernel[kern_size]);
        filtered = kernels[4][res][mode](filtered);
    }

    // Animation
    if (opts.playing) {
        filtered = kernels[6][res].gpu(filtered, animIndex);
    }

    // Writing to canvas
    converter(filtered);
    var new_canvas = converter.getCanvas();
    new_canvas.id = old_canvas.id;
    container.replaceChild(new_canvas, old_canvas);

    if (opts.playing) {
        animIndex = (animIndex+10) % opts.width;
        setTimeout(function() {
            render(opts);
        }, opts.interval);
    }
}

// Utility 

function genKernel(func) {
    kernels = {};
    resolutions.forEach(function(size) {
        kernels[size[0]] = {};
        kernels[size[0]].gpu = func('gpu', size[0], size[1]);
        kernels[size[0]].cpu = func('cpu', size[0], size[1]);
    });
    return kernels;
}

function isValidIndex(height, width, y, x) {
    if (y < 0 || y > height-1 || x < 0 || x > width-1) {
        return 0;
    }
    return 1;
}

function makeBlender(mode, width, height) {
    var opt = {
        dimensions: [width, height, 4],
        debug: false,
        graphical: false,
        outputToTexture: true,
        mode: mode
    };

    var filt = gpu.createKernel(
        function(A, B, alpha, beta) {
            return alpha*A[this.thread.z][this.thread.y][this.thread.x] +
                   beta*B[this.thread.z][this.thread.y][this.thread.x];

        }, opt);

    return filt;
}

function toImg(width, height) {
    return gpu.createKernel(
        function(A) {
            this.color(A[0][this.thread.y][this.thread.x],
                       A[1][this.thread.y][this.thread.x],
                       A[2][this.thread.y][this.thread.x]);
        }
    ).dimensions([width, height]).graphical(true);
}

function createRenderer(mode, width, height) {
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
    return gpu.createKernel(
        function (img) {
            return img[this.thread.z][this.thread.y][this.thread.x];
        }, options);
}

function gauss(x, y, std) {
    var divisor = 2*std*std;
    var distance = (x*x) + (y*y);
    var exponent = Math.exp(-distance / divisor);
    return (1 / (Math.sqrt(2*3.1416*std*std))) * exponent;
}

// Kernel formulas

function genGaussian(n, std) {
    var offset = Math.floor(n/2);
    var kernel = [];
    var index = 0;
    kernel.length = n*n;
    for (var j=-offset; j < offset + 1; j++) {
        for (var i=-offset; i < offset + 1; i++) {
            kernel[index++] = gauss(j, i, std);
        }
    }
    return kernel;
}

function genLaplacian(n) {
    var kernel = [];
    kernel.length = n*n;
    kernel.fill(-1);
    kernel[Math.ceil(n*n/2)] = n*n - 1;
    return kernel;
}

// Filtering

function makeSharpenFilter(mode, width, height) {
    // Creates sharpen filter with size 3 x 3
    var opt = {
        dimensions: [width, height, 4],
        debug: true,
        graphical: false,
        outputToTexture: true,
        mode: mode
    };

    var filters = {
        '3': gpu.createKernel(
                function(img, arr) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        var index = 0;
                        for (var j=-1; j < 2; j++) {
                            for(var i=-1; i < 2; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i]*arr[index++];
                                }
                            }
                        }
                        return img[this.thread.z][this.thread.y][this.thread.x] + 0.6 * sum;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt),

        '5': gpu.createKernel(
                function(img, arr) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        var index = 0;
                        for (var j=-2; j < 3; j++) {
                            for(var i=-2; i < 3; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i]*arr[index++];
                                }
                            }
                        }
                        return img[this.thread.z][this.thread.y][this.thread.x] + 0.4 * sum;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt),

        '9': gpu.createKernel(
                function(img, arr) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        var index = 0;
                        for (var j=-4; j < 5; j++) {
                            for(var i=-4; i < 5; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i]*arr[index++];
                                }
                            }
                        }
                        return img[this.thread.z][this.thread.y][this.thread.x] + 0.3 * sum;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt)
    };

    return filters;
}

function makeLaplacianFilter(mode, width, height) {
    // Creates Laplacian filter with size 3 x 3
    var opt = {
        dimensions: [width, height, 4],
        debug: true,
        graphical: false,
        outputToTexture: true,
        mode: mode
    };

    var filters = {
        '3': gpu.createKernel(
                function(img, arr) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        var index = 0;
                        for (var j=-1; j < 2; j++) {
                            for(var i=-1; i < 2; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i]*arr[index++];
                                }
                            }
                        }
                        return sum;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt),

        '5': gpu.createKernel(
                function(img, arr) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        var index = 0;
                        for (var j=-2; j < 3; j++) {
                            for(var i=-2; i < 3; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i]*arr[index++];
                                }
                            }
                        }
                        return sum;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt),

        '9': gpu.createKernel(
                function(img, arr) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        var index = 0;
                        for (var j=-4; j < 5; j++) {
                            for(var i=-4; i < 5; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i]*arr[index++];
                                }
                            }
                        }
                        return sum;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt)
    };

    return filters;
}

function makeBoxFilter(mode, width, height) {
    // Creates average filter with size 3 x 3
    var opt = {
        dimensions: [width, height, 4],
        debug: true,
        graphical: false,
        outputToTexture: true,
        mode: mode
    };

    var filters = {
        '3': gpu.createKernel(
                function(img) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        for (var j=-1; j < 2; j++) {
                            for(var i=-1; i < 2; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i];
                                }
                            }
                        }
                        return sum / 9;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt),

        '5': gpu.createKernel(
                function(img) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        for (var j=-2; j < 3; j++) {
                            for(var i=-2; i < 3; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i];
                                }
                            }
                        }
                        return sum / 25;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt),

        '9': gpu.createKernel(
                function(img) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        for (var j=-4; j < 5; j++) {
                            for(var i=-4; i < 5; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i];
                                }
                            }
                        }
                        return sum / 81;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt)
    };
    return filters;
}

function makeGaussianFilter(mode, width, height) {
    // Creates average filter with size 3 x 3
    var opt = {
        dimensions: [width, height, 4],
        debug: true,
        graphical: false,
        outputToTexture: true,
        mode: mode
    };

    var filters = {
        '3': gpu.createKernel(
                function(img, arr) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        var index = 0;
                        for (var j=-1; j < 2; j++) {
                            for(var i=-1; i < 2; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i]*arr[index++];
                                }
                            }
                        }
                        return sum;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt),

        '5': gpu.createKernel(
                function(img, arr) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        var index = 0;
                        for (var j=-2; j < 3; j++) {
                            for(var i=-2; i < 3; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i]*arr[index++];
                                }
                            }
                        }
                        return sum;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt),

        '9': gpu.createKernel(
                function(img, arr) {
                    if (this.thread.z < 3) {
                        var sum = 0;
                        var index = 0;
                        for (var j=-4; j < 5; j++) {
                            for(var i=-4; i < 5; i++) {
                                if (isValidIndex(this.dimensions.y, this.dimensions.x, this.thread.y+j, this.thread.x+i) == 1) {
                                    sum += img[this.thread.z][this.thread.y+j][this.thread.x+i]*arr[index++];
                                }
                            }
                        }
                        return sum;
                    } else {
                        return img[this.thread.z][this.thread.y][this.thread.x];
                    }
                }, opt)
    };
    return filters;
}

function antiAlias(mode, img, res) {
    // Smooth out edges to approximate anti-aliasing. Inspired by FXAA (Fast Approximate Anti-Aliasing)
    // Perform Gaussian Blur after applying Laplacian filtered image.
    var filtered = kernels[3][res][mode]["3"](img, laplacianKernel["3"]);
    filtered = kernels[1][res][mode]["3"](filtered, gaussianKernel["3"]);
    filtered = kernels[7][res][mode](img, filtered, 0.9, 0.1);
    return filtered;
}

// Color processing 

function toGrayscale(mode, width, height) {
    // Creates average filter with size 3 x 3
    var opt = {
        dimensions: [width, height, 4],
        debug: true,
        graphical: false,
        outputToTexture: true,
        mode: mode
    };
    var filter = gpu.createKernel(
        function(img) {
            if (this.thread.z < 3) {
                var r = img[0][this.thread.y][this.thread.x];
                var g = img[1][this.thread.y][this.thread.x];
                var b = img[2][this.thread.y][this.thread.x];
                return (r+g+b) / 3.0;
            } else {
                return img[this.thread.z][this.thread.y][this.thread.x];
            }
        }, opt);

    return filter;
}

// Animation 

function makeMotion(mode, width, height) {
    var opt = {
    dimensions: [width, height, 4],
    debug: false,
    graphical: false,
    outputToTexture: true,
    mode: mode
    };

    var filt = gpu.createKernel(
        function(A,x) {
            return A[this.thread.z][this.thread.y][(this.thread.x + x)];
        }, opt);

    return filt;
}
