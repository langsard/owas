/* ==========================================================
 * SIT TIGHT
 * app.js
 * Version 0
 * ========================================================== */



/* ==========================================================
 * CONFIGURATION
 * ========================================================== */

const CONFIG = {

    LANDMARK_RADIUS: 8,

    LANDMARK_COLOR: "#ff0000",

    LANDMARK_SELECTED_COLOR: "#0080ff",

    LANDMARK_BORDER_COLOR: "#000000",

    LANDMARK_BORDER_WIDTH: 2

};



/* ==========================================================
 * APPLICATION STATE
 * ========================================================== */

const state = {

    image: null,

    imageFile: null,



    imageViewport: {

        x: 0,

        y: 0,

        width: 0,

        height: 0,

        scale: 1

    },



    landmarks: [],



    selectedLandmark: -1,



    editMode: false

};



/* ==========================================================
 * DOM
 * ========================================================== */

const dom = {

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

        document.querySelector(".centerPanel button")

};



/* ==========================================================
 * CANVAS
 * ========================================================== */

const context =

    dom.canvas.getContext("2d");



/* ==========================================================
 * INITIALIZATION
 * ========================================================== */

initialize();



function initialize() {

    registerEvents();

    resizeCanvas();

    clearCanvas();

}



/* ==========================================================
 * EVENT REGISTRATION
 * ========================================================== */

function registerEvents() {

    dom.photoInput.addEventListener(

        "change",

        handlePhotoUpload

    );



    dom.editButton.addEventListener(

        "click",

        toggleEditMode

    );



    dom.canvas.addEventListener(

        "click",

        handleCanvasClick

    );



    window.addEventListener(

        "resize",

        resizeCanvas

    );

}



/* ==========================================================
 * CANVAS SIZE
 * ========================================================== */

function resizeCanvas() {

    const rectangle =

        dom.canvas.getBoundingClientRect();



    dom.canvas.width =

        rectangle.width;



    dom.canvas.height =

        rectangle.height;



    redrawCanvas();

}

/* ==========================================================
 * PHOTO UPLOAD
 * ========================================================== */

function handlePhotoUpload(event) {

    const file =

        event.target.files[0];



    if (!file) {

        return;

    }



    state.imageFile = file;



    updateFileInformation(file);



    const reader =

        new FileReader();



    reader.onload =

        function (loadEvent) {

            loadImage(

                loadEvent.target.result

            );

        };



    reader.readAsDataURL(file);

}



/* ==========================================================
 * IMAGE LOADING
 * ========================================================== */

function loadImage(source) {

    const image =

        new Image();



    image.onload =

        function () {

            state.image = image;



            updateThumbnail(source);



            updateResolution(

                image.width,

                image.height

            );



            createDefaultLandmarks();



            redrawCanvas();

        };



    image.src = source;

}



/* ==========================================================
 * THUMBNAIL
 * ========================================================== */

function updateThumbnail(source) {

    dom.thumbnail.src = source;

}



/* ==========================================================
 * FILE INFORMATION
 * ========================================================== */

function updateFileInformation(file) {

    dom.fileName.textContent =

        file.name;



    dom.fileSize.textContent =

        formatFileSize(

            file.size

        );



    dom.fileType.textContent =

        file.type;



    dom.fileDate.textContent =

        new Date(

            file.lastModified

        ).toLocaleString();

}



function updateResolution(

    width,

    height

) {

    dom.resolution.textContent =

        `${width} × ${height}`;

}



/* ==========================================================
 * FILE SIZE
 * ========================================================== */

function formatFileSize(bytes) {

    const megabytes =

        bytes /

        1024 /

        1024;



    return

        `${megabytes.toFixed(2)} MB`;

}



/* ==========================================================
 * DEFAULT LANDMARKS
 * ========================================================== */

function createDefaultLandmarks() {

    state.landmarks = [];



    const columns = 4;

    const rows = 5;



    const spacingX =

        state.image.width /

        (columns + 1);



    const spacingY =

        state.image.height /

        (rows + 1);



    let index = 0;



    for (

        let row = 1;

        row <= rows;

        row++

    ) {

        for (

            let column = 1;

            column <= columns;

            column++

        ) {

            if (

                index >= 17

            ) {

                break;

            }



            state.landmarks.push({

                x:

                    column *

                    spacingX,



                y:

                    row *

                    spacingY,



                visible: true

            });



            index++;

        }

    }



    state.selectedLandmark = -1;

}



/* ==========================================================
 * PLACEHOLDER
 * ========================================================== */

/*

MoveNet will later replace

createDefaultLandmarks()

with

state.landmarks = movenetResult.keypoints;

Nothing else in the application
will need to change.

*/

/* ==========================================================
 * REDRAW
 * ========================================================== */

function redrawCanvas() {

    clearCanvas();



    if (!state.image) {

        return;

    }



    calculateImageViewport();

    drawImage();

    drawLandmarks();

}



/* ==========================================================
 * CLEAR CANVAS
 * ========================================================== */

function clearCanvas() {

    context.clearRect(

        0,

        0,

        dom.canvas.width,

        dom.canvas.height

    );

}



/* ==========================================================
 * IMAGE VIEWPORT
 * ========================================================== */

function calculateImageViewport() {

    const canvasWidth =

        dom.canvas.width;



    const canvasHeight =

        dom.canvas.height;



    const imageWidth =

        state.image.width;



    const imageHeight =

        state.image.height;



    const scale = Math.min(

        canvasWidth / imageWidth,

        canvasHeight / imageHeight

    );



    const drawWidth =

        imageWidth * scale;



    const drawHeight =

        imageHeight * scale;



    const offsetX =

        (canvasWidth - drawWidth) / 2;



    const offsetY =

        (canvasHeight - drawHeight) / 2;



    state.imageViewport = {

        x: offsetX,

        y: offsetY,

        width: drawWidth,

        height: drawHeight,

        scale: scale

    };

}



/* ==========================================================
 * DRAW IMAGE
 * ========================================================== */

function drawImage() {

    const viewport =

        state.imageViewport;



    context.drawImage(

        state.image,

        viewport.x,

        viewport.y,

        viewport.width,

        viewport.height

    );

}



/* ==========================================================
 * IMAGE → CANVAS
 * ========================================================== */

function imageToCanvas(point) {

    return {

        x:

            state.imageViewport.x +

            point.x *

            state.imageViewport.scale,



        y:

            state.imageViewport.y +

            point.y *

            state.imageViewport.scale

    };

}



/* ==========================================================
 * CANVAS → IMAGE
 * ========================================================== */

function canvasToImage(point) {

    return {

        x:

            (point.x -

                state.imageViewport.x)

            /

            state.imageViewport.scale,



        y:

            (point.y -

                state.imageViewport.y)

            /

            state.imageViewport.scale

    };

}



/* ==========================================================
 * GET CANVAS POSITION
 * ========================================================== */

function getCanvasPosition(event) {

    const rectangle =

        dom.canvas.getBoundingClientRect();



    return {

        x:

            (event.clientX - rectangle.left) *

            (dom.canvas.width / rectangle.width),



        y:

            (event.clientY - rectangle.top) *

            (dom.canvas.height / rectangle.height)

    };

}



/* ==========================================================
 * IMAGE BOUNDARY
 * ========================================================== */

function pointInsideImage(point) {

    const viewport =

        state.imageViewport;



    return (

        point.x >= viewport.x &&

        point.x <= viewport.x + viewport.width &&

        point.y >= viewport.y &&

        point.y <= viewport.y + viewport.height

    );

}



/* ==========================================================
 * DISTANCE
 * ========================================================== */

function distance(

    pointA,

    pointB

) {

    const dx =

        pointA.x - pointB.x;



    const dy =

        pointA.y - pointB.y;



    return Math.sqrt(

        dx * dx +

        dy * dy

    );

}



/* ==========================================================
 * FUTURE
 * ========================================================== */

/*

Every landmark is now stored in

IMAGE COORDINATES.

Nothing depends on the canvas size.

Therefore:

Resize Window
↓

Canvas changes size
↓

ImageViewport recalculated
↓

Landmarks remain correct.

This is exactly how MoveNet returns
keypoints and prevents distortion.

*/

/* ==========================================================
 * LANDMARK DRAWING
 * ========================================================== */

function drawLandmarks() {

    for (

        let index = 0;

        index < state.landmarks.length;

        index++

    ) {

        drawLandmark(

            index,

            state.landmarks[index]

        );

    }

}



/* ==========================================================
 * DRAW SINGLE LANDMARK
 * ========================================================== */

function drawLandmark(

    index,

    landmark

) {

    if (

        !landmark.visible

    ) {

        return;

    }



    const canvasPoint =

        imageToCanvas(

            landmark

        );



    context.beginPath();



    context.arc(

        canvasPoint.x,

        canvasPoint.y,

        CONFIG.LANDMARK_RADIUS,

        0,

        Math.PI * 2

    );



    context.fillStyle =

        index === state.selectedLandmark

            ? CONFIG.LANDMARK_SELECTED_COLOR

            : CONFIG.LANDMARK_COLOR;



    context.fill();



    context.lineWidth =

        CONFIG.LANDMARK_BORDER_WIDTH;



    context.strokeStyle =

        CONFIG.LANDMARK_BORDER_COLOR;



    context.stroke();

}



/* ==========================================================
 * LANDMARK SELECTION
 * ========================================================== */

function selectLandmark(

    canvasPoint

) {

    let selectedIndex = -1;



    let nearestDistance =

        Number.MAX_VALUE;



    for (

        let index = 0;

        index < state.landmarks.length;

        index++

    ) {

        const landmark =

            state.landmarks[index];



        if (

            !landmark.visible

        ) {

            continue;

        }



        const point =

            imageToCanvas(

                landmark

            );



        const currentDistance =

            distance(

                canvasPoint,

                point

            );



        if (

            currentDistance <

            CONFIG.LANDMARK_RADIUS * 2 &&

            currentDistance < nearestDistance

        ) {

            nearestDistance =

                currentDistance;



            selectedIndex =

                index;

        }

    }



    state.selectedLandmark =

        selectedIndex;



    redrawCanvas();



    return (

        selectedIndex !== -1

    );

}



/* ==========================================================
 * GET SELECTED LANDMARK
 * ========================================================== */

function getSelectedLandmark() {

    if (

        state.selectedLandmark < 0

    ) {

        return null;

    }



    return

        state.landmarks[

            state.selectedLandmark

        ];

}



/* ==========================================================
 * CLEAR SELECTION
 * ========================================================== */

function clearLandmarkSelection() {

    state.selectedLandmark = -1;

}



/* ==========================================================
 * SELECT ALL
 * ========================================================== */

function selectAllLandmarks() {

    for (

        let index = 0;

        index < state.landmarks.length;

        index++

    ) {

        state.landmarks[index].visible = true;

    }

}



/* ==========================================================
 * LANDMARK COUNT
 * ========================================================== */

function landmarkCount() {

    return

        state.landmarks.length;

}



/* ==========================================================
 * FUTURE
 * ========================================================== */

/*

Current

17 red dots

↓

Click dot

↓

Dot becomes blue

↓

selectedLandmark = index



Next section

Click canvas again

↓

Selected landmark moves

↓

Skeleton redraw

↓

Angles recalculate

*/

/* ==========================================================
 * EDIT MODE
 * ========================================================== */

function toggleEditMode() {

    state.editMode =

        !state.editMode;



    if (

        !state.editMode

    ) {

        clearLandmarkSelection();

    }



    updateEditButton();

    redrawCanvas();

}



/* ==========================================================
 * EDIT BUTTON
 * ========================================================== */

function updateEditButton() {

    dom.editButton.textContent =

        state.editMode

            ? "Finish"

            : "Edit";

}



/* ==========================================================
 * CANVAS CLICK
 * ========================================================== */

function handleCanvasClick(event) {

    if (

        !state.image

    ) {

        return;

    }



    const canvasPoint =

        getCanvasPosition(event);



    if (

        !pointInsideImage(canvasPoint)

    ) {

        return;

    }



    /* ------------------------------------------
     * Normal Mode
     * ------------------------------------------ */

    if (

        !state.editMode

    ) {

        return;

    }



    /* ------------------------------------------
     * Nothing Selected
     * ------------------------------------------ */

    if (

        state.selectedLandmark === -1

    ) {

        selectLandmark(

            canvasPoint

        );



        return;

    }



    /* ------------------------------------------
     * Landmark Selected
     * ------------------------------------------ */

    moveSelectedLandmark(

        canvasPoint

    );

}



/* ==========================================================
 * MOVE LANDMARK
 * ========================================================== */

function moveSelectedLandmark(

    canvasPoint

) {

    const imagePoint =

        canvasToImage(

            canvasPoint

        );



    state.landmarks[

        state.selectedLandmark

    ].x = imagePoint.x;



    state.landmarks[

        state.selectedLandmark

    ].y = imagePoint.y;



    redrawCanvas();

}



/* ==========================================================
 * REDRAW
 * ========================================================== */

const previousRedrawCanvas = redrawCanvas;



redrawCanvas = function () {

    clearCanvas();



    if (

        !state.image

    ) {

        return;

    }



    calculateImageViewport();



    drawImage();



    drawLandmarks();



    drawSelectionHint();

};



/* ==========================================================
 * DRAW SELECTION HINT
 * ========================================================== */

function drawSelectionHint() {

    if (

        !state.editMode

    ) {

        return;

    }



    context.save();



    context.font =

        "18px Sarabun";



    context.fillStyle =

        "#000000";



    const message =

        state.selectedLandmark === -1

            ? "Edit Mode: Select a landmark"

            : "Edit Mode: Click new location";



    context.fillText(

        message,

        15,

        30

    );



    context.restore();

}



/* ==========================================================
 * DELETE KEY (OPTIONAL)
 * ========================================================== */

window.addEventListener(

    "keydown",

    function (event) {

        if (

            event.key === "Escape"

        ) {

            clearLandmarkSelection();

            redrawCanvas();

        }

    }

);



/* ==========================================================
 * FUTURE PLACEHOLDER
 * ========================================================== */

/*

Current workflow

Upload

↓

17 landmarks

↓

Edit

↓

Click landmark

↓

Blue landmark

↓

Click image

↓

Landmark moves

↓

Canvas redraw



Later

↓

Skeleton redraw

↓

Joint angles

↓

OWAS score

↓

Export PDF

*/

/* ==========================================================
 * SKELETON
 * ========================================================== */

const SKELETON_CONNECTIONS = [

    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],

    [5, 6],

    [5, 7],
    [7, 9],

    [6, 8],
    [8, 10],

    [5, 11],
    [6, 12],

    [11, 12],

    [11, 13],
    [13, 15],

    [12, 14],
    [14, 16]

];



/* ==========================================================
 * DRAW LANDMARKS
 * ========================================================== */

function drawLandmarks() {

    drawSkeleton();



    for (

        let index = 0;

        index < state.landmarks.length;

        index++

    ) {

        drawLandmark(

            index,

            state.landmarks[index]

        );

    }

}



/* ==========================================================
 * DRAW SKELETON
 * ========================================================== */

function drawSkeleton() {

    context.save();



    context.strokeStyle = "#00AA00";

    context.lineWidth = 3;



    for (

        const connection of SKELETON_CONNECTIONS

    ) {

        const first =

            state.landmarks[connection[0]];

        const second =

            state.landmarks[connection[1]];



        if (

            !first ||

            !second ||

            !first.visible ||

            !second.visible

        ) {

            continue;

        }



        const point1 =

            imageToCanvas(first);



        const point2 =

            imageToCanvas(second);



        context.beginPath();

        context.moveTo(

            point1.x,

            point1.y

        );

        context.lineTo(

            point2.x,

            point2.y

        );

        context.stroke();

    }



    context.restore();

}



/* ==========================================================
 * DRAW SINGLE LANDMARK
 * ========================================================== */

function drawLandmark(

    index,

    landmark

) {

    if (

        !landmark.visible

    ) {

        return;

    }



    const point =

        imageToCanvas(

            landmark

        );



    context.beginPath();



    context.arc(

        point.x,

        point.y,

        CONFIG.LANDMARK_RADIUS,

        0,

        Math.PI * 2

    );



    context.fillStyle =

        index === state.selectedLandmark

            ? CONFIG.LANDMARK_SELECTED_COLOR

            : CONFIG.LANDMARK_COLOR;



    context.fill();



    context.lineWidth =

        CONFIG.LANDMARK_BORDER_WIDTH;



    context.strokeStyle =

        CONFIG.LANDMARK_BORDER_COLOR;



    context.stroke();



    drawLandmarkLabel(

        index,

        point

    );

}



/* ==========================================================
 * LANDMARK LABEL
 * ========================================================== */

function drawLandmarkLabel(

    index,

    point

) {

    context.save();



    context.font =

        "14px Sarabun";



    context.fillStyle =

        "#000000";



    context.fillText(

        index,

        point.x + 12,

        point.y - 12

    );



    context.restore();

}



/* ==========================================================
 * MOVE ALL LANDMARKS
 * ========================================================== */

function clearLandmarks() {

    state.landmarks = [];

    state.selectedLandmark = -1;

}



/* ==========================================================
 * FUTURE
 * ========================================================== */

async function runPoseEstimation() {

    /*

    Future implementation

    const result =

        await detector.estimatePoses(image);

    state.landmarks =

        result.keypoints;

    redrawCanvas();

    */

}



/* ==========================================================
 * ANGLES
 * ========================================================== */

function calculateAngles() {

    /*

    Next milestone.

    */

}



/* ==========================================================
 * OWAS
 * ========================================================== */

function calculateOWAS() {

    /*

    Next milestone.

    */

}



/* ==========================================================
 * EXPORT
 * ========================================================== */

function exportPDF() {

    /*

    Future milestone.

    */

}



/* ==========================================================
 * END
 * ========================================================== */
