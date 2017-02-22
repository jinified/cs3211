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
    loadedImage: false,
    playing: false,
    gpuMode: true,
    width: 480,
    operation: 1,
}

function loadImage() {
    var canvas = document.getElementById("viewport");
    var ctx = canvas.getContext("2d");
    var img = new Image(MAX_WIDTH, MAX_HEIGHT);
    img.src = "img/Lenna.png";
    img.onload = function () {
        ctx.drawImage(img, 0, 0, img.width, img.height,
                           0, 0, canvas.width, canvas.height);
        opts.loadedImage = imgToArray(ctx.getImageData(0, 0, canvas.width, canvas.height), canvas.width, canvas.height);
    };
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
}

function renderLoop(e) {
    opts.width = $("select[name=resolutions] option:selected").val();
    opts.operation = $("select[name=filters] option:selected").val();
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
    var img = []

    for (var channel=0; channel<4; channel++) {
        img.push([]);
        for (var y=0; y < height; y++) {
            img[channel].push([]);
        }
    }

    for (var y=0; y < height; y++) {
        for (var x=0; x < width; x++) {
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
    $('#mode').click(switch_mode);
    loadImage();
};
