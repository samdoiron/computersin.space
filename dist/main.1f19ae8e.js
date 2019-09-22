// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"perlin.js":[function(require,module,exports) {
var global = arguments[3];
/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */
(function (global) {
  var module = global.noise = {};

  function Grad(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  Grad.prototype.dot2 = function (x, y) {
    return this.x * x + this.y * y;
  };

  Grad.prototype.dot3 = function (x, y, z) {
    return this.x * x + this.y * y + this.z * z;
  };

  var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0), new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1), new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];
  var p = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180]; // To remove the need for index wrapping, double the permutation table length

  var perm = new Array(512);
  var gradP = new Array(512); // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.

  module.seed = function (seed) {
    if (seed > 0 && seed < 1) {
      // Scale the seed out
      seed *= 65536;
    }

    seed = Math.floor(seed);

    if (seed < 256) {
      seed |= seed << 8;
    }

    for (var i = 0; i < 256; i++) {
      var v;

      if (i & 1) {
        v = p[i] ^ seed & 255;
      } else {
        v = p[i] ^ seed >> 8 & 255;
      }

      perm[i] = perm[i + 256] = v;
      gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
  };

  module.seed(0);
  /*
  for(var i=0; i<256; i++) {
    perm[i] = perm[i + 256] = p[i];
    gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
  }*/
  // Skewing and unskewing factors for 2, 3, and 4 dimensions

  var F2 = 0.5 * (Math.sqrt(3) - 1);
  var G2 = (3 - Math.sqrt(3)) / 6;
  var F3 = 1 / 3;
  var G3 = 1 / 6; // 2D simplex noise

  module.simplex2 = function (xin, yin) {
    var n0, n1, n2; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in

    var s = (xin + yin) * F2; // Hairy factor for 2D

    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var t = (i + j) * G2;
    var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.

    var y0 = yin - j + t; // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.

    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords

    if (x0 > y0) {
      // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      i1 = 1;
      j1 = 0;
    } else {
      // upper triangle, YX order: (0,0)->(0,1)->(1,1)
      i1 = 0;
      j1 = 1;
    } // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6


    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords

    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords

    var y2 = y0 - 1 + 2 * G2; // Work out the hashed gradient indices of the three simplex corners

    i &= 255;
    j &= 255;
    var gi0 = gradP[i + perm[j]];
    var gi1 = gradP[i + i1 + perm[j + j1]];
    var gi2 = gradP[i + 1 + perm[j + 1]]; // Calculate the contribution from the three corners

    var t0 = 0.5 - x0 * x0 - y0 * y0;

    if (t0 < 0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot2(x0, y0); // (x,y) of grad3 used for 2D gradient
    }

    var t1 = 0.5 - x1 * x1 - y1 * y1;

    if (t1 < 0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot2(x1, y1);
    }

    var t2 = 0.5 - x2 * x2 - y2 * y2;

    if (t2 < 0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot2(x2, y2);
    } // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].


    return 70 * (n0 + n1 + n2);
  }; // 3D simplex noise


  module.simplex3 = function (xin, yin, zin) {
    var n0, n1, n2, n3; // Noise contributions from the four corners
    // Skew the input space to determine which simplex cell we're in

    var s = (xin + yin + zin) * F3; // Hairy factor for 2D

    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var k = Math.floor(zin + s);
    var t = (i + j + k) * G3;
    var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.

    var y0 = yin - j + t;
    var z0 = zin - k + t; // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.

    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords

    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      }
    } // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.


    var x1 = x0 - i1 + G3; // Offsets for second corner

    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;
    var x2 = x0 - i2 + 2 * G3; // Offsets for third corner

    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;
    var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner

    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3; // Work out the hashed gradient indices of the four simplex corners

    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i + perm[j + perm[k]]];
    var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
    var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
    var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]]; // Calculate the contribution from the four corners

    var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;

    if (t0 < 0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot3(x0, y0, z0); // (x,y) of grad3 used for 2D gradient
    }

    var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;

    if (t1 < 0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }

    var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;

    if (t2 < 0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }

    var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;

    if (t3 < 0) {
      n3 = 0;
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    } // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].


    return 32 * (n0 + n1 + n2 + n3);
  }; // ##### Perlin noise stuff


  function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  function lerp(a, b, t) {
    return (1 - t) * a + t * b;
  } // 2D Perlin Noise


  module.perlin2 = function (x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x),
        Y = Math.floor(y); // Get relative xy coordinates of point within that cell

    x = x - X;
    y = y - Y; // Wrap the integer cells at 255 (smaller integer period can be introduced here)

    X = X & 255;
    Y = Y & 255; // Calculate noise contributions from each of the four corners

    var n00 = gradP[X + perm[Y]].dot2(x, y);
    var n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
    var n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
    var n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1); // Compute the fade curve value for x

    var u = fade(x); // Interpolate the four results

    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y));
  }; // 3D Perlin Noise


  module.perlin3 = function (x, y, z) {
    // Find unit grid cell containing point
    var X = Math.floor(x),
        Y = Math.floor(y),
        Z = Math.floor(z); // Get relative xyz coordinates of point within that cell

    x = x - X;
    y = y - Y;
    z = z - Z; // Wrap the integer cells at 255 (smaller integer period can be introduced here)

    X = X & 255;
    Y = Y & 255;
    Z = Z & 255; // Calculate noise contributions from each of the eight corners

    var n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
    var n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
    var n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
    var n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
    var n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
    var n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
    var n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
    var n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(x - 1, y - 1, z - 1); // Compute the fade curve value for x, y, z

    var u = fade(x);
    var v = fade(y);
    var w = fade(z); // Interpolate

    return lerp(lerp(lerp(n000, n100, u), lerp(n001, n101, u), w), lerp(lerp(n010, n110, u), lerp(n011, n111, u), w), v);
  };
})(this);
},{}],"main.js":[function(require,module,exports) {
"use strict";

var _perlin = require("./perlin");

var TILE_SIZE = 256;
var STAR_SIZE_MAX = 3;
var STARS_PER_TILE = 70;
var DISPLACEMENT_WIDTH = 300;
var DISPLACEMENT_HEIGHT = 300;
var displacementAmount = 25;
var screenTexture = null;

_perlin.noise.seed(Math.random());

document.addEventListener('DOMContentLoaded', function () {
  document.body.addEventListener('keypress', function (e) {
    if (e.key == 'a') {
      displacementAmount -= 10;
    } else if (e.key == 'd') {
      displacementAmount += 10;
    }
  });
  console.log(document.body.scrollWidth, document.body.scrollHeight);
  var displacementCanvas = document.createElement('canvas');
  var displacementContext = displacementCanvas.getContext('2d');
  displacementCanvas.id = 'displacement';
  displacementCanvas.width = DISPLACEMENT_WIDTH;
  displacementCanvas.height = DISPLACEMENT_HEIGHT;
  var displacementMap = displacementContext.createImageData(DISPLACEMENT_WIDTH, DISPLACEMENT_HEIGHT);
  var noises = [200, 250, 500];

  for (var di = 0, max = DISPLACEMENT_WIDTH * DISPLACEMENT_HEIGHT * 4; di < max; di += 4) {
    var x = di % (DISPLACEMENT_WIDTH * 4);
    var y = Math.floor(di / (DISPLACEMENT_WIDTH * 4)) * 2; // Looks better if *2 for some reason?

    var shade = 0;

    for (var _i = 0; _i < noises.length; _i++) {
      var size = noises[_i];
      shade += 255 * _perlin.noise.perlin2(x / size, y / size);
    }

    shade /= noises.length; // shade = (shade + 128) / 2;

    displacementMap.data[di] = shade;
    displacementMap.data[di + 1] = shade;
    displacementMap.data[di + 2] = shade;
    displacementMap.data[di + 3] = 255;
  }

  displacementContext.putImageData(displacementMap, 0, 0);
  var windowWidth = document.body.scrollWidth / 2;
  var windowHeight = document.body.scrollHeight / 2;
  var colCount = Math.ceil(windowWidth / TILE_SIZE);
  var rowCount = Math.ceil(windowHeight / TILE_SIZE);
  var tileCanvas = document.createElement('canvas');
  var tileContext = tileCanvas.getContext('2d');
  tileCanvas.width = TILE_SIZE;
  tileCanvas.height = TILE_SIZE; // Generate texture for background of space;

  var spaceMap = tileContext.createImageData(TILE_SIZE, TILE_SIZE);
  var spaceNoises = [32, 64, 128, 256, 512];
  var fraction = 0.4 / spaceNoises.length;

  for (var _i2 = 0; _i2 < spaceNoises.length; _i2++) {
    var _size = spaceNoises[_i2];

    _perlin.noise.seed(Math.random());

    for (var _di = 0, _max = TILE_SIZE * TILE_SIZE * 4; _di < _max; _di += 4) {
      var _x = _di % (TILE_SIZE * 4);

      var _y = Math.floor(_di / (TILE_SIZE * 4)) * 2; // Looks better if *2 for some reason?


      var _shade = 255 * _perlin.noise.perlin2(_x / _size, _y / _size);

      spaceMap.data[_di] += _shade * fraction;
      spaceMap.data[_di + 1] += _shade * fraction;
      spaceMap.data[_di + 2] += _shade * fraction;
      spaceMap.data[_di + 3] = 255;
    }
  }

  var spaceMapCanvas = document.createElement('canvas');
  spaceMapCanvas.width = TILE_SIZE;
  spaceMapCanvas.height = TILE_SIZE;
  var spaceMapContext = spaceMapCanvas.getContext('2d');
  spaceMapContext.putImageData(spaceMap, 0, 0);
  spaceMapCanvas.style.position = 'relative';
  spaceMapCanvas.style.zIndex = 100;
  tileContext.putImageData(spaceMap, 0, 0);
  tileContext.fillStyle = '#000000'; // tileContext.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  tileContext.fillStyle = '#ffffff';

  for (var j = 0; j < STARS_PER_TILE; j++) {
    tileContext.fillRect(Math.random() * TILE_SIZE, Math.random() * TILE_SIZE, Math.round(STAR_SIZE_MAX * Math.random()), Math.round(STAR_SIZE_MAX * Math.random()));
  }

  var stars = tileContext.getImageData(0, 0, TILE_SIZE, TILE_SIZE);
  var screenTextureCanvas = document.createElement('canvas');
  var screenTextureContext = screenTextureCanvas.getContext('2d');
  var baseTextureWidth = windowWidth + TILE_SIZE;
  var baseTextureHeight = windowHeight + TILE_SIZE;
  screenTextureCanvas.width = baseTextureWidth;
  screenTextureCanvas.height = baseTextureHeight;

  for (var row = 0; row < rowCount + 1; row++) {
    for (var col = 0; col < colCount + 1; col++) {
      screenTextureContext.putImageData(stars, col * TILE_SIZE, row * TILE_SIZE);
    }
  }

  var baseScreenTexture = screenTextureContext.getImageData(0, 0, baseTextureWidth, baseTextureHeight);
  var screenCanvas = document.createElement('canvas');
  var screenContext = screenCanvas.getContext('2d');
  screenCanvas.width = windowWidth;
  screenCanvas.height = windowHeight;
  screenCanvas.id = 'stars';
  document.body.appendChild(screenCanvas);
  var offset = 0;
  var frameScreenTexture = screenContext.createImageData(baseScreenTexture.width, baseScreenTexture.height);
  requestAnimationFrame(function frame() {
    offset += 1;
    offset %= TILE_SIZE; // Yuck! Manual on each pixel
    // How do I get it so we don't consider the offset :thinking:
    // Offset is in both left and top... :/ 

    for (var pixNum = 0; pixNum < frameScreenTexture.data.length / 4; pixNum++) {
      var outputIndex = pixNum * 4;

      var _row = Math.floor(pixNum / frameScreenTexture.width);

      var _col = pixNum % frameScreenTexture.width;

      var sRow = _row + offset;
      var sCol = _col + offset;
      var displacementCol = sCol % DISPLACEMENT_WIDTH;
      var displacementRow = sRow % DISPLACEMENT_HEIGHT;
      var displacementIndex = (displacementRow * DISPLACEMENT_WIDTH + displacementCol) * 4;
      var displacement = displacementMap.data[displacementIndex] - 128;
      var dOffset = Math.round(displacement / 128 * displacementAmount);
      var displacedRow = Math.max(0, Math.min(_row - dOffset, baseScreenTexture.height - 1));
      var displacedCol = Math.max(0, Math.min(_col + dOffset, baseScreenTexture.width - 1));
      var displacedIndex = (displacedRow * baseScreenTexture.width + displacedCol) * 4;
      frameScreenTexture.data[outputIndex] = baseScreenTexture.data[displacedIndex];
      frameScreenTexture.data[outputIndex + 1] = baseScreenTexture.data[displacedIndex + 1];
      frameScreenTexture.data[outputIndex + 2] = baseScreenTexture.data[displacedIndex + 2];
      frameScreenTexture.data[outputIndex + 3] = 255;
    }

    screenContext.putImageData(frameScreenTexture, offset - TILE_SIZE, offset - TILE_SIZE);
    requestAnimationFrame(frame);
  });
});
},{"./perlin":"perlin.js"}],"../../../../../../../home/sam/.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63040" + '/');

  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();
      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},["../../../../../../../home/sam/.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.map