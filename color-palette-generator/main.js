document.addEventListener('DOMContentLoaded', function () {
  const storedImage = localStorage.getItem('uploadedImage');
  if (storedImage) {
    displayImage(storedImage);
    loadImageAndColors(storedImage);
  }
});

document.getElementById('imageUploader').addEventListener('change', function (event) {
  const file = event.target.files[0];
  debounceProcessImage(file);
});

// Debounce function to prevent multiple image processing calls
function debounceProcessImage(file) {
  clearTimeout(this.debounceTimer);
  this.debounceTimer = setTimeout(() => {
    processImage(file);
  }, 300);
}

// Process the uploaded image and store it in local storage
function processImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    // First, display the image, then resize and store it
    displayImage(e.target.result);
    resizeAndStoreImage(e.target.result);
  };
  reader.readAsDataURL(file);
}

// Resize the image and then store it in local storage
function resizeAndStoreImage(dataUrl) {
  const img = new Image();
  img.onload = function () {
    resizeImage(this, (resizedCanvas) => {
      // Convert the resized canvas back to a data URL
      const resizedDataUrl = resizedCanvas.toDataURL();
      // Store the resized image instead of the original
      localStorage.setItem('uploadedImage', resizedDataUrl);
      // Proceed to load image colors after storing
      loadImageAndColors(resizedDataUrl);
    });
  };
  img.src = dataUrl;
}

// Resize function to minimize performance impact with large images
function resizeImage(img, callback) {
  const maxWidth = 600;
  const maxHeight = 600;
  const canvas = document.createElement('canvas');
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    }
  } else {
    if (height > maxHeight) {
      width *= maxHeight / height;
      height = maxHeight;
    }
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  callback(canvas);
}

function loadImageAndColors(dataUrl) {
  const img = new Image();
  img.onload = function () {
    resizeImage(this, (resizedCanvas) => {
      const colors = extractColors(resizedCanvas);
      displayColors(colors);
    });
  };
  img.src = dataUrl;
}

// Set displayed image to the uploaded image from local storage
function displayImage(base64String) {
  const imageElement = document.getElementById('uploadedImage');
  imageElement.src = base64String;
}

// Extract colors from the image using K-means clustering
function extractColors(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let pixels = [];

  // Extract RGB values from image data
  for (let i = 0; i < imageData.length; i += 4) {
    pixels.push([imageData[i], imageData[i + 1], imageData[i + 2]]);
  }

  let centroids = initializeCentroids(pixels, 10);
  let assignments = new Array(pixels.length);
  let iterations = 10;

  // K-means algorithm
  for (let i = 0; i < iterations; i++) {
    pixels.forEach((pixel, index) => {
      let minDist = Infinity;
      let assignedCentroid = 0;

      // Find the closest centroid
      centroids.forEach((centroid, centroidIndex) => {
        let dist = euclideanDistance(pixel, centroid);
        if (dist < minDist) {
          minDist = dist;
          assignedCentroid = centroidIndex;
        }
      });
      assignments[index] = assignedCentroid;
    });

    let newCentroids = Array.from({ length: 10 }, () => []);

    // Assign pixels to new centroids
    pixels.forEach((pixel, index) => {
      let centroidIndex = assignments[index];
      newCentroids[centroidIndex].push(pixel);
    });

    centroids = newCentroids.map(sums => sums.length ? averageColor(sums) : centroids[sums]);
  }

  return centroids.map(rgb => rgbToHex(...rgb));
}

// Initialize centroids by randomly selecting k pixels
function initializeCentroids(pixels, k) {
  let centroids = [];
  let usedIdxs = new Set();

  // Randomly select k unique pixels
  while (centroids.length < k) {
    let idx = Math.floor(Math.random() * pixels.length);
    if (!usedIdxs.has(idx)) {
      centroids.push(pixels[idx]);
      usedIdxs.add(idx);
    }
  }
  return centroids;
}

// Euclidean distance between two points in n-dimensional space
function euclideanDistance(a, b) {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
}

function averageColor(colors) {
  let sum = colors.reduce((sum, color) => sum.map((val, i) => val + color[i]), [0, 0, 0]);
  return sum.map(val => Math.round(val / colors.length));
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function displayColors(colorHexes) {
  const root = document.documentElement;
  const palette = document.getElementById('palette');
  palette.innerHTML = '';
  let fragment = document.createDocumentFragment();

  // Set CSS variables and create color divs
  colorHexes.forEach((hex, index) => {
    root.style.setProperty(`--color-${index + 1}`, hex);
    const colorDiv = document.createElement('div');
    colorDiv.classList.add('color');
    colorDiv.style.backgroundColor = hex;
    colorDiv.innerText = hex;
    colorDiv.setAttribute('title', 'Click to copy');

    colorDiv.addEventListener('click', () => {
      navigator.clipboard.writeText(hex).then(() => {
        colorDiv.innerText = 'Copied!';
        setTimeout(() => {
          colorDiv.innerText = hex;
        }, 1000);
      });
    });

    fragment.appendChild(colorDiv);
  });

  palette.appendChild(fragment);
}