// Labels
const MODE_GPU = "GPU Mode";
const MODE_CPU = "CPU Mode";

// Color table
const COLOR_BTN_SUCCESS = "#2ECC40";
const COLOR_BTN_WARNING = "#FF4136";
const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;

// State variables

var opts = {
    imgArr: {},
    playing: false,
    antialias: false,
    gpuMode: true,
    width: 800,
    height: 600,
    operation: 1,
    kernel: 3,
    tick_interval: 1000,
};

function readImage(src, width, height) {
    // Read image of different sizes
    var img = new Image();
    img.src = src;
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        var imgArray = imgToArray(ctx.getImageData(0, 0, width, height), width, height);
        opts.imgArr[width] = imgArray;
    };
}

function loadImage() {
    var canvas = document.getElementById("viewport");
    var ctx = canvas.getContext("2d");
    var img = new Image(MAX_WIDTH, MAX_HEIGHT);
    img.src = "img/Lenna.png";
    img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
}

function antialias_toggle(e) {
    if (opts.antialias) {
        $(e.target).css("background-color", COLOR_BTN_SUCCESS);
        $(e.target).text("AntiAlias ON");
        opts.antialias = false;
    } else {
        $(e.target).css("background-color", COLOR_BTN_WARNING);
        $(e.target).text("AntiAlias OFF");
        opts.antialias = true;
    }
    render(opts);
}

function render_toggle(e) {
    if (opts.playing) {
        $(e.target).css("background-color", COLOR_BTN_SUCCESS);
        $(e.target).text("Play");
        opts.playing = false;
    } else {
        $(e.target).css("background-color", COLOR_BTN_WARNING);
        $(e.target).text("Stop");
        opts.playing = true;
        render(opts);
    }
}

function switch_mode(e) {
    if (opts.gpuMode) {
        $(e.target).text(MODE_CPU);
        opts.gpuMode = false;
    } else {
        $(e.target).text(MODE_GPU);
        opts.gpuMode = true;
    }
    render(opts);
}

function renderLoop(e) {
    console.log("pressed");
    opts.width = $("select[name=resolutions] option:selected").val();
    opts.height = opts.width / 4 * 3;
    opts.operation = $("select[name=filters] option:selected").val();
    opts.kernel = $("select[name=kernel] option:selected").val();
    render(opts);
}

// Utility functions

function addEventListenerByClass(classname, event, func) {
    var class_members = document.getElementsByClassName(classname);
    Array.from(class_members).forEach(function (e) {
        e.addEventListener(event, func);
    });
}

function imgToArray(imageData, width, height) {
    // Converts imageData array with r,g,b,a values to a 4D array
    var pointer = 0;
    var img = [];

    for (var channel=0; channel<4; channel++) {
        img.push([]);
        for (var y=0; y < height; y++) {
            img[channel].push([]);
        }
    }

    for (var y=0; y < height; y++) {
        for (var x=0; x < width; x++) {
             // Y-position inverted to follow right-hand system
             img[0][height-y-1][x] = imageData.data[pointer++]/256;
             img[1][height-y-1][x] = imageData.data[pointer++]/256;
             img[2][height-y-1][x] = imageData.data[pointer++]/256;
             img[3][height-y-1][x] = imageData.data[pointer++]/256;
        }
    }
    return img;
}

// Callback initialization
window.onload = function() {
    // Does not support IE8 since no attachEvent handled
    addEventListenerByClass('trigger', 'change', renderLoop);
    $('#render_toggle').click(render_toggle);
    $('#antialias_toggle').click(antialias_toggle);
    $('#mode').click(switch_mode);

    // Load images of different resolutions
    readImage("img/lenna800.png", 800, 600);
    readImage("img/lenna640.png", 640, 480);
    readImage("img/lenna480.png", 480, 360);
    readImage("img/lenna320.png", 320, 240);
    readImage("img/lenna192.png", 192, 144);
    loadImage();
};
