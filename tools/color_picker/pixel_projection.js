
// Presets
const presetGiha = [[128, 154, 169], [63, 63, 116], [13, 131, 225]]
const presetPastel = [[255, 99, 202], [146, 245, 255], [249, 255, 148]]
const presetFlesh = [[206,161,93],[48,22,0],[180,116,81]]

// For 2D rendering
const screenCenter = [256, 256];
const screenHeight = 512;
const screenWidth = 512;
const scale = 1;

// In 3D space
const gamutCenter = [128, 128, 128];

// Storing context to paint results into
var ctx;

function parseHexValue(val) {
    const c = val.charCodeAt(0);
    if (c >= 48 && c < 58) { // arabic numeral
        return c - 48;
    } else if (c >= 65 && c < 71) { // ABCDEF
        return c - 55;
    } else if (c >= 97 && c < 103) { // abcdef
        return c - 87;
    }
}

/**
 * Parses a single line of text and converts it into an rgb array.
 * Allowed inputs:
 * #32
 * #FFFFFF
 * @param {string} line - line of text to parse
 * @returns rgb array representation of line
 */
function parseLine(line) {
    switch (line[0]) {
        case "#":
            console.log(typeof(line.substring(1)))
            var total = line.substring(1).split('').reduce((acc, curr) => acc * 16 + parseHexValue(curr), 0);
            const b = total % 256;
            total = (total - b) / 256;
            const g = total % 256;
            total = (total - g) / 256;
            const r = total % 256;
            console.log(total);
            return [r, g, b];
        default:
            console.log("Could not parse: " + line);
    }
}

function init() {
    var canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    console.log(parseLine("#FF3"));

    const imageData = ctx.getImageData(0, 0, screenWidth, screenHeight);
    const data = imageData.data;
    const newData = generateImageData(presetGiha)
    for (var i = 0; i < data.length; i ++ ) {
        data[i] = newData[i]; 
    }

    ctx.putImageData(imageData, 0, 0);
}

function parseInput(input) {

}

/**
 * Takes in an array of points and paints the resulting interpolated plane onto
 * the context provided in the global variable "ctx". 
 * @param {[number, number, number]} X - array of points to interpolate between
 */
function drawImage(X) {

}

/**
 * Converts 2D pixel screen coordinates into coordinates in the constructed 2D space.
 * Uses global variables "scale" and "screenCenter" to determine how to transform points.
 * @param {number} px - first value for screen coordinate 
 * @param {number} py - second value for screen coordinate
 * @returns scaled coordinates in 2D space
 */
function calculate2DCoords(px, py) {
    return [scale * (px - screenCenter[0]), scale * (py - screenCenter[1])];
}

/**
 * Converts an input rgb value into the corresponding rgba value if the input
 * is valid, otherwise "throws out" the input, returning [0,0,0,0].
 * @param {[number, number, number]} rgb - rgb data for a single point
 * @returns corresponding rgba value
 */
function clampRGB(rgb) {
    rgb.push(255);
    rgb.forEach(v => {
        if (v < 0 || v >= 256) {
            rgb[0] = rgb[1] = rgb[2] = rgb[3] = 0;
        }
    });
    return rgb;
}

/**
 * Generates pixel data for the image that results from. Uses global variable "gamutCenter"
 * to determine where to place the center of the image. 
 * @param {[number, number, number]} X - array of points to interpolate between
 * @returns linear array of pixel data 
 */
function generateImageData(X) {

    const interpolator = getInterpolator(X, gamutCenter);
    const data = new Array(screenWidth * screenHeight * 4);

    // For each pixel, calculate the RGB values 
    for (let i = 0; i < screenHeight; i++) {
        for (let j = 0; j < screenWidth; j++) {
            const l = 4 * (screenWidth * i + j);
            const pixelData = clampRGB(interpolator(calculate2DCoords(i, j)));
            data[l    ] = pixelData[0];
            data[l + 1] = pixelData[1];
            data[l + 2] = pixelData[2];
            data[l + 3] = pixelData[3];
        }
    }

    return data;
}

/**
 * Takes three points A, B, C in 3D space and returns a function
 * that interpolates between them.
 * @param {[[number, number, number]]} X - array of points to interpolate between
 * @param {[number, number, number]} center - point whose 2D projection will be the origin
 * @returns a function that takes a 2D coordinate and returns an interpolated point in the original space
 */
function getInterpolator(X, center) {

    const normalize = function(V) {
        return math.divide(V, math.norm(V));
    }

    // Calculate parameters for the plane <w, x> + b = 0
    const w = normalize(math.cross(math.subtract(X[0], X[1]), math.subtract(X[0], X[2])))
    const b = - math.dot(w, X[0])

    // Find basis for 2D plane, so our points are now v1*x + v2*y + c
    const c = math.subtract(center, math.multiply(w, (math.dot(w, center) + b)/(math.norm(w) ** 2)));
    const v1 = normalize([1, 1, -(w[0] + w[1])/w[2]]); // Choice of v1 and v2 are fairly arbitrary here
    const v2 = math.cross(w, v1);

    // Takes 2D point in our new basis and returns corresponding RGB value
    const interpolator = function(X) {
        return math.map(
            math.add(c, math.multiply(X, [v1, v2])), 
            v => math.round(v));
    }

    return interpolator;
}

/**
 * 
 * @param {*} X - array of points to fit with plane
 * @param {*} center - point whose 2D projection will be the origin
 * @returns a function that takes a 2D coordinate and returns  
 */
function getRegressor(X, center) {
    console.log("data is " + X);
    const sum = X.reduce((acc, curr) => math.add(acc, curr),
    [0,0,0]);
    console.log("sum is " + sum);
}
