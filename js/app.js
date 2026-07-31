/* ==========================================================
 * SIT TIGHT
 * app.js
 * Version 0
 * ========================================================== */



/* ==========================================================
 * STATE
 * ========================================================== */

const applicationState = {

    image: null,

    imageFile: null,

    editMode: false,

    landmarks: [

        {
            x: 0,
            y: 0
        }

    ]

};



/* ==========================================================
 * DOM
 * ========================================================== */

const elements = {

    photoInput:

        document.getElementById("photoInput"),

    thumbnail:

        document.getElementById("thumbnail"),

    fileName:

        document.getElementById("fileName"),

    resolution:

        document.getElementById("resolution"),

    fileSize:

        document.getElementById("fileSize"),

    fileDate:

        document.getElementById("fileDate"),

    fileType:

        document.getElementById("fileType"),

    canvas:

        document.getElementById("poseCanvas"),

    editButton:

        document.querySelector(".centerPanel .sectionTitle button")

};



/* ==========================================================
 * CANVAS
 * ========================================================== */

const context =

    elements.canvas.getContext("2d");



/* ==========================================================
 * INITIALIZATION
 * ========================================================== */

initialize();



function initialize() {

    bindEvents();

    clearCanvas();

}



/* ==========================================================
 * EVENTS
 * ========================================================== */

function bindEvents() {

    elements.photoInput.addEventListener(

        "change",

        handlePhotoSelection

    );



    elements.editButton.addEventListener(

        "click",

        toggleEditMode

    );



    elements.canvas.addEventListener(

        "click",

        handleCanvasClick

    );

}



/* ==========================================================
 * PHOTO SELECTION
 * ========================================================== */

function handlePhotoSelection(event) {

    const file =

        event.target.files[0];



    if (!file) {

        return;

    }



    applicationState.imageFile = file;



    updateFileInformation(file);



    const reader = new FileReader();



    reader.onload = function (loadEvent) {

        const image = new Image();



        image.onload = function () {

            applicationState.image = image;

            updateThumbnail(loadEvent.target.result);

            updateResolution(image);

            initializeLandmark(image);

            redrawCanvas();

        };



        image.src = loadEvent.target.result;

    };



    reader.readAsDataURL(file);

}



/* ==========================================================
 * FILE INFORMATION
 * ========================================================== */

function updateFileInformation(file) {

    elements.fileName.textContent =

        file.name;



    elements.fileSize.textContent =

        `${(file.size / 1024 / 1024).toFixed(2)} MB`;



    elements.fileDate.textContent =

        new Date(

            file.lastModified

        ).toLocaleString();



    elements.fileType.textContent =

        file.type;

}



function updateResolution(image) {

    elements.resolution.textContent =

        `${image.width} × ${image.height}`;

}



function updateThumbnail(source) {

    elements.thumbnail.src = source;

}



/* ==========================================================
 * LANDMARK
 * ========================================================== */

function initializeLandmark(image) {

    applicationState.landmarks[0] = {

        x: image.width / 2,

        y: image.height / 2

    };

}



/* ==========================================================
 * EDIT MODE
 * ========================================================== */

function toggleEditMode() {

    applicationState.editMode =

        !applicationState.editMode;



    elements.editButton.textContent =

        applicationState.editMode

            ? "Editing..."

            : "Edit";

}



function handleCanvasClick(event) {

    if (

        !applicationState.editMode ||

        !applicationState.image

    ) {

        return;

    }



    const canvasPoint =

        getCanvasCoordinates(event);



    applicationState.landmarks[0] = {

        x: canvasPoint.x,

        y: canvasPoint.y

    };



    redrawCanvas();

}



/* ==========================================================
 * COORDINATE CONVERSION
 * ========================================================== */

function getCanvasCoordinates(event) {

    const rect =

        elements.canvas.getBoundingClientRect();



    const x =

        (event.clientX - rect.left) *

        (elements.canvas.width / rect.width);



    const y =

        (event.clientY - rect.top) *

        (elements.canvas.height / rect.height);



    return {

        x,

        y

    };

}



/* ==========================================================
 * DRAWING
 * ========================================================== */

function redrawCanvas() {

    clearCanvas();



    if (

        !applicationState.image

    ) {

        return;

    }



    drawImage();

    drawLandmarks();

}



function clearCanvas() {

    context.clearRect(

        0,

        0,

        elements.canvas.width,

        elements.canvas.height

    );

}



function drawImage() {

    context.drawImage(

        applicationState.image,

        0,

        0,

        elements.canvas.width,

        elements.canvas.height

    );

}



function drawLandmarks() {

    applicationState.landmarks.forEach(

        landmark => {

            drawLandmark(landmark);

        }

    );

}



function drawLandmark(landmark) {

    context.beginPath();

    context.arc(

        landmark.x,

        landmark.y,

        8,

        0,

        Math.PI * 2

    );



    context.fillStyle =

        "#ff0000";



    context.fill();



    context.lineWidth = 2;

    context.strokeStyle =

        "#000000";



    context.stroke();

}



/* ==========================================================
 * FUTURE PLACEHOLDERS
 * ========================================================== */

/*

Future pipeline:

Upload

↓

MoveNet

↓

Keypoints

↓

Skeleton

↓

Angles

↓

OWAS

↓

Export

*/
