import { noise } from './perlin';

const TILE_SIZE = 256;
const STAR_SIZE_MAX = 3;
const STARS_PER_TILE = 70;

const DISPLACEMENT_WIDTH = 300;
const DISPLACEMENT_HEIGHT = 300;
let displacementAmount = 25;

let screenTexture = null;

noise.seed(Math.random());

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('keypress', function (e) {
    if (e.key == 'a') {
      displacementAmount -= 10;
    } else if (e.key == 'd') {
      displacementAmount += 10;
    }
  });

  console.log(document.body.scrollWidth, document.body.scrollHeight);

  const displacementCanvas = document.createElement('canvas');
  const displacementContext = displacementCanvas.getContext('2d');

  displacementCanvas.id = 'displacement';
  displacementCanvas.width = DISPLACEMENT_WIDTH;
  displacementCanvas.height = DISPLACEMENT_HEIGHT;

  let displacementMap = displacementContext.createImageData(DISPLACEMENT_WIDTH, DISPLACEMENT_HEIGHT);

  let noises = [200, 250, 500]

  for (let di = 0, max = DISPLACEMENT_WIDTH * DISPLACEMENT_HEIGHT * 4; di < max; di += 4) {
    let x = di % (DISPLACEMENT_WIDTH * 4);
    let y = Math.floor(di / (DISPLACEMENT_WIDTH * 4)) * 2; // Looks better if *2 for some reason?

    let shade = 0;
    for (let size of noises) {
      shade += 255 * noise.perlin2(x / size, y / size);
    }
    shade /= noises.length;
    // shade = (shade + 128) / 2;

    displacementMap.data[di] = shade;
    displacementMap.data[di + 1] = shade;
    displacementMap.data[di + 2] = shade;
    displacementMap.data[di + 3] = 255;
  }

  displacementContext.putImageData(displacementMap, 0, 0);

  const windowWidth = document.body.scrollWidth / 2;
  const windowHeight = document.body.scrollHeight / 2;

  const colCount = Math.ceil(windowWidth / TILE_SIZE);
  const rowCount = Math.ceil(windowHeight / TILE_SIZE);

  const tileCanvas = document.createElement('canvas');
  const tileContext = tileCanvas.getContext('2d');

  tileCanvas.width = TILE_SIZE;
  tileCanvas.height = TILE_SIZE;

  // Generate texture for background of space;

  let spaceMap = tileContext.createImageData(TILE_SIZE, TILE_SIZE);

  let spaceNoises = [32, 64, 128, 256, 512];

  let fraction = 0.4 / spaceNoises.length;

  for (let size of spaceNoises) {
    noise.seed(Math.random());
    for (let di = 0, max = TILE_SIZE * TILE_SIZE * 4; di < max; di += 4) {
      let x = di % (TILE_SIZE * 4);
      let y = Math.floor(di / (TILE_SIZE * 4)) * 2; // Looks better if *2 for some reason?

      let shade = 255 * noise.perlin2(x / size, y / size);

      spaceMap.data[di] += shade * fraction;
      spaceMap.data[di + 1] += shade * fraction;
      spaceMap.data[di + 2] += shade * fraction;
      spaceMap.data[di + 3] = 255;
    }
  }

  const spaceMapCanvas = document.createElement('canvas');
  spaceMapCanvas.width = TILE_SIZE;
  spaceMapCanvas.height = TILE_SIZE;
  const spaceMapContext = spaceMapCanvas.getContext('2d');
  spaceMapContext.putImageData(spaceMap, 0, 0);
  spaceMapCanvas.style.position = 'relative';
  spaceMapCanvas.style.zIndex = 100;

  tileContext.putImageData(spaceMap, 0, 0);

  tileContext.fillStyle = '#000000';
  // tileContext.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

  tileContext.fillStyle = '#ffffff';
  for (let j = 0; j < STARS_PER_TILE; j++) {
    tileContext.fillRect(
      Math.random() * TILE_SIZE,
      Math.random() * TILE_SIZE, 
      Math.round(STAR_SIZE_MAX * Math.random()),
      Math.round(STAR_SIZE_MAX * Math.random())
    );
  }

  const stars = tileContext.getImageData(0, 0, TILE_SIZE, TILE_SIZE);


  const screenTextureCanvas = document.createElement('canvas');
  const screenTextureContext = screenTextureCanvas.getContext('2d');

  const baseTextureWidth = windowWidth + TILE_SIZE;
  const baseTextureHeight = windowHeight + TILE_SIZE;

  screenTextureCanvas.width = baseTextureWidth;
  screenTextureCanvas.height = baseTextureHeight;

  for (let row = 0; row < rowCount + 1; row++) {
    for (let col = 0; col < colCount + 1; col++) {
      screenTextureContext.putImageData(
        stars,
        col * TILE_SIZE,
        row * TILE_SIZE
      );
    }
  }

  const baseScreenTexture = screenTextureContext.getImageData(
    0, 0, baseTextureWidth, baseTextureHeight
  );

  const screenCanvas = document.createElement('canvas');
  const screenContext = screenCanvas.getContext('2d');
  
  screenCanvas.width = windowWidth;
  screenCanvas.height = windowHeight;
  screenCanvas.id = 'stars';

  document.body.appendChild(screenCanvas);

  let offset = 0;

  const frameScreenTexture = screenContext.createImageData(
    baseScreenTexture.width,
    baseScreenTexture.height
  );

  requestAnimationFrame(function frame() {
    offset += 1;
    offset %= TILE_SIZE;

    // Yuck! Manual on each pixel
    // How do I get it so we don't consider the offset :thinking:
    // Offset is in both left and top... :/ 

    for (let pixNum = 0; pixNum < frameScreenTexture.data.length / 4; pixNum++) {
      let outputIndex = pixNum * 4;
      let row = Math.floor(pixNum / frameScreenTexture.width);
      let col = pixNum % frameScreenTexture.width;

      let sRow = row + offset;
      let sCol = col + offset;

      let displacementCol = sCol % DISPLACEMENT_WIDTH;
      let displacementRow = sRow % DISPLACEMENT_HEIGHT;
      let displacementIndex = ((displacementRow * DISPLACEMENT_WIDTH) + displacementCol) * 4;
      let displacement = displacementMap.data[displacementIndex] - 128;

      let dOffset = Math.round(displacement / 128 * displacementAmount);
      let displacedRow = Math.max(0, Math.min(row - dOffset, baseScreenTexture.height - 1));
      let displacedCol = Math.max(0, Math.min(col + dOffset, baseScreenTexture.width - 1));
      let displacedIndex = (displacedRow * baseScreenTexture.width + displacedCol) * 4;

      frameScreenTexture.data[outputIndex] = baseScreenTexture.data[displacedIndex];
      frameScreenTexture.data[outputIndex + 1] = baseScreenTexture.data[displacedIndex + 1];
      frameScreenTexture.data[outputIndex + 2] = baseScreenTexture.data[displacedIndex + 2];
      frameScreenTexture.data[outputIndex + 3] = 255;
    }

    screenContext.putImageData(
      frameScreenTexture, offset - TILE_SIZE, offset - TILE_SIZE
    );

    requestAnimationFrame(frame);
  })
})

