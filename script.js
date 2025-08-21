let image1Data = null;
let image2Data = null;
let canvas1 = null;
let canvas2 = null;
let resultCanvas = null;

const themeBtn = document.getElementById("themeToggle");
themeBtn.addEventListener("click", switchTheme);

document.getElementById("image1").addEventListener("change", function (e) {
  loadImage(e.target.files[0], 1);
});

document.getElementById("image2").addEventListener("change", function (e) {
  loadImage(e.target.files[0], 2);
});

function switchTheme() {
  document.body.classList.toggle("is-light");
  document.body.classList.toggle("is-dark");
  if (document.body.classList.contains("is-light")) {
    themeBtn.innerText = "🌙 Escuro";
  } else {
    themeBtn.innerText = "☀️ Claro";
  }
}

function loadImage(file, imageNumber) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (imageNumber === 1) {
        image1Data = imageData;
        canvas1 = canvas;
        displayImage(canvas, "Imagem 1", "image1-display");
      } else {
        image2Data = imageData;
        canvas2 = canvas;
        displayImage(canvas, "Imagem 2", "image2-display");
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function displayImage(canvas, title, id) {
  const display = document.getElementById("imagesDisplay");
  const existingContainer = document.getElementById(id);
  if (existingContainer) {
    existingContainer.remove();
  }

  const container = document.createElement("div");
  container.className = "image-container";
  container.id = id;

  const titleElement = document.createElement("h3");
  titleElement.textContent = title;
  container.appendChild(titleElement);

  const displayCanvas = document.createElement("canvas");
  displayCanvas.width = canvas.width;
  displayCanvas.height = canvas.height;
  const displayCtx = displayCanvas.getContext("2d");
  displayCtx.drawImage(canvas, 0, 0);

  displayCanvas.addEventListener("click", function (e) {
    const rect = displayCanvas.getBoundingClientRect();
    const x = Math.floor(
      (e.clientX - rect.left) * (displayCanvas.width / rect.width)
    );
    const y = Math.floor(
      (e.clientY - rect.top) * (displayCanvas.height / rect.height)
    );
    showPixelColor(displayCanvas, x, y);
  });

  container.appendChild(displayCanvas);
  display.appendChild(container);
}

function showPixelColor(canvas, x, y) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(x, y, 1, 1);
  const data = imageData.data;

  const r = data[0];
  const g = data[1];
  const b = data[2];

  const rgb = "RGB(" + r + ", " + g + ", " + b + ")";
  const cmyk = rgbToCmyk(r, g, b);
  const hsl = rgbToHsl(r, g, b);

  document.getElementById("rgbValue").textContent = rgb;
  document.getElementById("cmykValue").textContent = cmyk;
  document.getElementById("hslValue").textContent = hsl;
  document.getElementById("colorInfo").style.display = "block";
}

function rgbToCmyk(r, g, b) {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const k = 1 - Math.max(r, g, b);
  let c, m, y;

  if (k === 1) {
    c = 0;
    m = 0;
    y = 0;
  } else {
    c = (1 - r - k) / (1 - k);
    m = (1 - g - k) / (1 - k);
    y = (1 - b - k) / (1 - k);
  }

  return (
    "C" +
    Math.round(c * 100) +
    "% M" +
    Math.round(m * 100) +
    "% Y" +
    Math.round(y * 100) +
    "% K" +
    Math.round(k * 100) +
    "%"
  );
}

function rgbToHsl(r, g, b) {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    if (l > 0.5) {
      s = d / (2 - max - min);
    } else {
      s = d / (max + min);
    }

    switch (max) {
      case r:
        if (g < b) {
          h = (g - b) / d + 6;
        } else {
          h = (g - b) / d;
        }
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = h / 6;
  }

  return (
    "HSL(" +
    Math.round(h * 360) +
    "°, " +
    Math.round(s * 100) +
    "%, " +
    Math.round(l * 100) +
    "%)"
  );
}

function clearImg() {
  const display = document.getElementById("imagesDisplay");
  display.innerHTML = "";

  image1Data = null;
  image2Data = null;
  canvas1 = null;
  canvas2 = null;
  resultCanvas = null;

  document.getElementById("colorInfo").style.display = "none";

  document.getElementById("image1").value = "";
  document.getElementById("image2").value = "";

  showStatus("Imagens removidas com sucesso!");
}

function saveImg() {
  const container = document.getElementById("result-display");
  const canvasImg = container.querySelector("canvas");
  const canvasUrl = canvasImg.toDataURL();
  const link = document.createElement("a");
  link.download = "result.png";
  link.href = canvasUrl;
  link.click();
}

function addImages() {
  if (!image1Data || !image2Data) {
    showStatus("Por favor, carregue duas imagens primeiro!", "error");
    return;
  }

  processImages("add");
}

function subtractImages() {
  if (!image1Data || !image2Data) {
    showStatus("Por favor, carregue duas imagens primeiro!", "error");
    return;
  }

  processImages("subtract");
}

function addValueToImage() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }

  const value = parseInt(document.getElementById("valueInput").value);
  processImageWithValue("add", value);
}

function subtractValueFromImage() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }

  const value = parseInt(document.getElementById("valueInput").value);
  processImageWithValue("subtract", value);
}

function multiValueToImage() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }

  const value = parseFloat(
    document.querySelector('select[name="valueSelector"]').value
  );
  processImageWithValue("multi", value);
}

function dividerValueToImage() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }

  const value = parseFloat(
    document.querySelector('select[name="valueSelector"]').value
  );
  processImageWithValue("divider", value);
}

function processImages(operation) {
  const width = Math.min(image1Data.width, image2Data.width);
  const height = Math.min(image1Data.height, image2Data.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;

  for (let i = 0; i < width * height * 4; i += 4) {
    const r1 = image1Data.data[i];
    const g1 = image1Data.data[i + 1];
    const b1 = image1Data.data[i + 2];
    const a1 = image1Data.data[i + 3];

    const r2 = image2Data.data[i];
    const g2 = image2Data.data[i + 1];
    const b2 = image2Data.data[i + 2];
    const a2 = image2Data.data[i + 3];

    if (operation === "add") {
      resultData[i] = Math.min(255, r1 + r2);
      resultData[i + 1] = Math.min(255, g1 + g2);
      resultData[i + 2] = Math.min(255, b1 + b2);
    } else {
      resultData[i] = Math.max(0, r1 - r2);
      resultData[i + 1] = Math.max(0, g1 - g2);
      resultData[i + 2] = Math.max(0, b1 - b2);
    }
    resultData[i + 3] = Math.min(a1, a2);
  }

  ctx.putImageData(resultImageData, 0, 0);
  let title;
  if (operation === "add") {
    title = "Resultado: Soma das Imagens";
  } else {
    title = "Resultado: Subtração das Imagens";
  }
  displayImage(canvas, title, "result-display");
}

function processImageWithValue(operation, value) {
  const canvas = document.createElement("canvas");
  canvas.width = image1Data.width;
  canvas.height = image1Data.height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(
    image1Data.width,
    image1Data.height
  );
  const resultData = resultImageData.data;

  for (let i = 0; i < image1Data.data.length; i += 4) {
    const r = image1Data.data[i];
    const g = image1Data.data[i + 1];
    const b = image1Data.data[i + 2];
    const a = image1Data.data[i + 3];

    switch (operation) {
      case "add":
        resultData[i] = Math.min(255, r + value);
        resultData[i + 1] = Math.min(255, g + value);
        resultData[i + 2] = Math.min(255, b + value);
        resultData[i + 3] = a;
        break;
      case "subtract":
        resultData[i] = Math.max(0, r - value);
        resultData[i + 1] = Math.max(0, g - value);
        resultData[i + 2] = Math.max(0, b - value);
        resultData[i + 3] = a;
        break;
      case "multi":
        resultData[i] = Math.max(0, r * value);
        resultData[i + 1] = Math.max(0, g * value);
        resultData[i + 2] = Math.max(0, b * value);
        resultData[i + 3] = a;
        break;
      case "divider":
        resultData[i] = Math.max(0, r / value);
        resultData[i + 1] = Math.max(0, g / value);
        resultData[i + 2] = Math.max(0, b / value);
        resultData[i + 3] = a;
        break;
    }
  }

  ctx.putImageData(resultImageData, 0, 0);
  let title;
  if (operation === "add") {
    title = "Resultado: Imagem + " + value;
  } else {
    title = "Resultado: Imagem - " + value;
  }
  displayImage(canvas, title, "result-display");

  showStatus(title + " concluído com sucesso!");
}
