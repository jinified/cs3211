var ctx = document.getElementById('viewport').getContext('2d');
var imgObj = new Image();
imgObj.src="img/Lenna.png";
imgObj.onload = function() {
    ctx.drawImage(imgObj, 0, 0); 
};

// Labels
const MODE_GPU = "GPU Mode";
const MODE_CPU = "CPU Mode";

// Color table
const COLOR_BTN_SUCCESS = "#2ECC40";
const COLOR_BTN_WARNING = "#FF4136";

// State variables

var playing = false;
var gpuMode = true;

function toggle(e) {
    if (playing) {
        $(e.target).css("background-color", COLOR_BTN_SUCCESS);
        $(e.target).text("Play");
        playing = false;
    } else {
        $(e.target).css("background-color", COLOR_BTN_WARNING);
        $(e.target).text("Stop");
        playing = true;
    }
}

function switch_mode(e) {
    if (gpuMode) {
        $(e.target).text(MODE_CPU);
        gpuMode = false;
    } else {
        $(e.target).text(MODE_GPU);
        gpuMode = true;
    }
}

// Callback initialization
$('#toggle').click(toggle);
$('#mode').click(switch_mode);
