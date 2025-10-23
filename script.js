let image1Data = null;
let image2Data = null;
let canvas1 = null;
let canvas2 = null;
let resultCanvas = null;

document.getElementById("image1").addEventListener("click", function (e) {
  e.target.value = "";
});

document.getElementById("image1").addEventListener("change", function (e) {
  loadImage(e.target.files[0], 1);
});

document.getElementById("image2").addEventListener("click", function (e) {
  e.target.value = "";
});

document.getElementById("image2").addEventListener("change", function (e) {
  loadImage(e.target.files[0], 2);
});

function setAtive(ev) {
  const targetId = ev.currentTarget.dataset.target;
  const targetSection = document.getElementById(targetId);
  const oldSection = document.querySelector('section[data-active="true"]');
  const oldActive = document.querySelector('a[data-active="true"]');
  const activeFunction = ev.currentTarget;
  if (oldActive) {
    oldActive.setAttribute("data-active", "false");
    oldSection.setAttribute("data-active", "false");
  }
  activeFunction.setAttribute("data-active", "true");
  targetSection.setAttribute("data-active", "true");
}

function loadImage(file, imageNumber) {
  if (!file) return;
  const fileName = file.name.toLowerCase();
  if (fileName.endsWith(".tif") || fileName.endsWith(".tiff")) {
    loadTiffImage(file, imageNumber);
  } else {
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
}

function loadTiffImage(file, imageNumber) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const tiff = new Tiff({ buffer: e.target.result });
    const canvas = tiff.toCanvas();
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (imageNumber === 1) {
      image1Data = imageData;
      canvas1 = canvas;
      displayImage(canvas, "Imagem TIFF 1", "image1-display");
    } else {
      image2Data = imageData;
      canvas2 = canvas;
      displayImage(canvas, "Imagem TIFF 2", "image2-display");
    }
  };
  reader.readAsArrayBuffer(file);
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
  if (id === "image1-display") {
    const firstChild = display.firstChild;
    if (firstChild) {
      display.insertBefore(container, firstChild);
    } else {
      display.appendChild(container);
    }
  } else if (id === "image2-display") {
    const image1Container = document.getElementById("image1-display");
    if (image1Container) {
      image1Container.insertAdjacentElement("afterend", container);
    } else {
      const firstChild = display.firstChild;
      if (firstChild) {
        display.insertBefore(container, firstChild);
      } else {
        display.appendChild(container);
      }
    }
  } else {
    display.appendChild(container);
  }
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

  document.getElementById("rgbValue").textContent = "-";
  document.getElementById("cmykValue").textContent = "-";
  document.getElementById("hslValue").textContent = "-";
  document.getElementById("image1").value = "";
  document.getElementById("image2").value = "";

  showStatus("Imagens removidas com sucesso!", "erro");
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

function showStatus(mensagem, tipo) {
  const main = document.querySelector("main");
  const status = document.createElement("div");

  status.innerText = mensagem;
  status.id = "status";
  status.dataset.type = tipo;

  main.appendChild(status);

  setTimeout(function () {
    elemento = document.getElementById("status");
    if (elemento) {
      elemento.remove();
    }
  }, 5000);
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

function grayTransform() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }

  const value = 3;
  processImageWithValue("gray", value);
}

function binaryConvert() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }

  const value = parseInt(document.getElementById("binaryValue").value);
  processImageWithValue("binary", value);
}

function negativeTransform() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  const value = 255;
  processImageWithValue("negative", value);
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
      case "gray":
        resultData[i] = Math.max(0, (r + g + b) / value);
        resultData[i + 1] = Math.max(0, (r + g + b) / value);
        resultData[i + 2] = Math.max(0, (r + g + b) / value);
        resultData[i + 3] = a;
        break;
      case "negative":
        resultData[i] = Math.max(0, value - r);
        resultData[i + 1] = Math.max(0, value - g);
        resultData[i + 2] = Math.max(0, value - b);
        resultData[i + 3] = a;
        break;
      case "binary":
        resultData[i] = Math.max(0, (r + g + b) / 3) > value ? 255 : 0;
        resultData[i + 1] = Math.max(0, (r + g + b) / 3) > value ? 255 : 0;
        resultData[i + 2] = Math.max(0, (r + g + b) / 3) > value ? 255 : 0;
        resultData[i + 3] = a;
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

function flipHorizontal() {
  const canvas = document.createElement("canvas");
  canvas.width = image1Data.width;
  canvas.height = image1Data.height;
  const ctx = canvas.getContext("2d");

  ctx.scale(-1, 1);
  ctx.drawImage(canvas1, -canvas.width, 0);

  displayImage(canvas, "sadas", "result-display");
  showStatus(title + " concluído com sucesso!");
}

function flipVertical() {
  const canvas = document.createElement("canvas");
  canvas.width = image1Data.width;
  canvas.height = image1Data.height;
  const ctx = canvas.getContext("2d");

  ctx.scale(1, -1);
  ctx.drawImage(canvas1, 0, -canvas.height);

  displayImage(canvas, "Hello", "result-display");
  showStatus(title, "concluido com sucesso!");
}

function difference() {
  const width = Math.min(image1Data.width, image2Data.width);
  const height = Math.min(image1Data.height, image2Data.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const imageDataC = ctx.createImageData(width, height);
  const imageDataD = ctx.createImageData(width, height);
  const imageDataE = ctx.createImageData(width, height);
  const imageC = imageDataC.data;
  const imageD = imageDataD.data;
  const imageE = imageDataE.data;

  for (let i = 0; i < width * height * 4; i += 4) {
    const r1 = image1Data.data[i];
    const g1 = image1Data.data[i + 1];
    const b1 = image1Data.data[i + 2];
    const a1 = image1Data.data[i + 3];

    const r2 = image2Data.data[i];
    const g2 = image2Data.data[i + 1];
    const b2 = image2Data.data[i + 2];
    const a2 = image2Data.data[i + 3];

    imageC[i] = Math.min(255, r1 - r2);
    imageC[i + 1] = Math.min(255, g1 - g2);
    imageC[i + 2] = Math.min(255, b1 - b2);
    imageC[i + 3] = Math.min(a1, a2);

    imageD[i] = Math.min(255, r2 - r1);
    imageD[i + 1] = Math.min(255, g2 - g1);
    imageD[i + 2] = Math.min(255, b2 - b1);
    imageD[i + 3] = Math.min(a2, a1);
  }
  for (let j = 0; j < width * height * 4; j += 4) {
    const r3 = imageC[j];
    const g3 = imageC[j + 1];
    const b3 = imageC[j + 2];
    const a3 = imageC[j + 3];

    const r4 = imageD[j];
    const g4 = imageD[j + 1];
    const b4 = imageD[j + 2];
    const a4 = imageD[j + 3];

    imageE[j] = Math.min(255, r3 + r4);
    imageE[j + 1] = Math.min(255, g3 + g4);
    imageE[j + 2] = Math.min(255, b3 + b4);
    imageE[j + 3] = Math.min(a3, a4);
  }
  ctx.putImageData(imageDataE, 0, 0);
  displayImage(canvas, "Diferença das imagens", "result-display");
}

function blending() {
  const width = Math.min(image1Data.width, image2Data.width);
  const height = Math.min(image1Data.height, image2Data.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;

  const value = parseFloat(document.getElementById("blendingValue").value);

  for (let i = 0; i < width * height * 4; i += 4) {
    const r1 = image1Data.data[i];
    const g1 = image1Data.data[i + 1];
    const b1 = image1Data.data[i + 2];
    const a1 = image1Data.data[i + 3];

    const r2 = image2Data.data[i];
    const g2 = image2Data.data[i + 1];
    const b2 = image2Data.data[i + 2];
    const a2 = image2Data.data[i + 3];

    resultData[i] = Math.min(255, value * r1 + (1 - value) * r2);
    resultData[i + 1] = Math.min(255, value * g1 + (1 - value) * g2);
    resultData[i + 2] = Math.min(255, value * b1 + (1 - value) * b2);
    resultData[i + 3] = Math.min(a1, a2);
  }

  ctx.putImageData(resultImageData, 0, 0);
  let title = "Blending " + value;
  displayImage(canvas, title, "result-display");
}

function media() {
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

    resultData[i] = Math.min(255, (r1 + r2) / 2);
    resultData[i + 1] = Math.min(255, (g1 + g2) / 2);
    resultData[i + 2] = Math.min(255, (b1 + b2) / 2);
    resultData[i + 3] = Math.min(a1, a2);
  }

  ctx.putImageData(resultImageData, 0, 0);
  let title = "Media";
  displayImage(canvas, title, "result-display");
}

function andLogic() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  if (!image2Data) {
    showStatus("Por favor, carregue a segunda imagem!", "error");
    return;
  }
  logicProcess("and");
}

function orLogic() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  if (!image2Data) {
    showStatus("Por favor, carregue a segunda imagem!", "error");
    return;
  }
  logicProcess("or");
}

function notLogic() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  logicProcess("not");
}

function xorLogic() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  if (!image2Data) {
    showStatus("Por favor, carregue a segunda imagem!", "error");
    return;
  }
  logicProcess("xor");
}

function logicProcess(operation) {
  if (operation === "not") {
    const width = image1Data.width;
    const height = image1Data.height;

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

      if (r1 === 0) {
        resultData[i] = 255;
        resultData[i + 1] = 255;
        resultData[i + 2] = 255;
      } else {
        resultData[i] = 0;
        resultData[i + 1] = 0;
        resultData[i + 2] = 0;
      }
      resultData[i + 3] = a1;
    }
    ctx.putImageData(resultImageData, 0, 0);
    displayImage(canvas, "Resultado: NOT", "result-display");
  } else {
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
      const a2 = image2Data.data[i + 3];

      switch (operation) {
        case "and":
          if (r1 === r2) {
            resultData[i] = r1;
            resultData[i + 1] = g1;
            resultData[i + 2] = b1;
          } else {
            resultData[i] = 0;
            resultData[i + 1] = 0;
            resultData[i + 2] = 0;
          }
          break;

        case "or":
          if (r1 === r2) {
            resultData[i] = r1;
            resultData[i + 1] = g1;
            resultData[i + 2] = b1;
          } else {
            resultData[i] = 255;
            resultData[i + 1] = 255;
            resultData[i + 2] = 255;
          }
          break;

        case "xor":
          if (r1 === r2) {
            resultData[i] = 0;
            resultData[i + 1] = 0;
            resultData[i + 2] = 0;
          } else {
            resultData[i] = 255;
            resultData[i + 1] = 255;
            resultData[i + 2] = 255;
          }
          break;
      }
      resultData[i + 3] = Math.min(a1, a2);
    }
    ctx.putImageData(resultImageData, 0, 0);
    let title;
    if (operation === "or") title = "Resultado: OR";
    if (operation === "xor") title = "Resultado: XOR";
    if (operation === "and") title = "Resultado: AND";
    displayImage(canvas, title, "result-display");
  }
}

function calculateHistogram(imageData) {
  const histogram = {
    red: new Array(256).fill(0),
    green: new Array(256).fill(0),
    blue: new Array(256).fill(0),
    gray: new Array(256).fill(0),
  };

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    histogram.red[r]++;
    histogram.green[g]++;
    histogram.blue[b]++;

    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    histogram.gray[gray]++;
  }

  return histogram;
}

function drawHistogram(histogram, canvasId, title) {
  const existingCanvas = document.getElementById(canvasId);
  if (existingCanvas) {
    existingCanvas.remove();
  }

  const canvas = document.createElement("canvas");
  canvas.id = canvasId;
  canvas.width = 512;
  canvas.height = 200;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const maxValue = Math.max(
    ...histogram.red,
    ...histogram.green,
    ...histogram.blue,
    ...histogram.gray
  );

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let i = 0; i < 256; i++) {
    const x = i * 2;
    const height = (histogram.gray[i] / maxValue) * (canvas.height - 20);
    const y = canvas.height - height;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  ctx.fillStyle = "black";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(title, canvas.width / 2, 15);

  ctx.font = "10px Arial";
  ctx.fillText("0", 10, canvas.height - 5);
  ctx.fillText("255", canvas.width - 20, canvas.height - 5);

  return canvas;
}

function showHistogramBefore() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }

  const histogram = calculateHistogram(image1Data);

  const histogramCanvas = drawHistogram(
    histogram,
    "histogram-before",
    "Histograma - Antes"
  );

  const beforeFieldset = document.querySelector(
    "#sec5 fieldset:first-child .fieldset-content"
  );
  beforeFieldset.innerHTML = "";
  beforeFieldset.appendChild(histogramCanvas);
}

function equalizeHistogram() {
  if (!image1Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }

  showHistogramBefore();

  const originalHistogram = calculateHistogram(image1Data);

  const cdf = new Array(256).fill(0);
  cdf[0] = originalHistogram.gray[0];

  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + originalHistogram.gray[i];
  }


  const totalPixels = image1Data.width * image1Data.height;
  const normalizedCdf = cdf.map((value) =>
    Math.round((value / totalPixels) * 255)
  );

  const canvas = document.createElement("canvas");
  canvas.width = image1Data.width;
  canvas.height = image1Data.height;
  const ctx = canvas.getContext("2d");

  const equalizedImageData = ctx.createImageData(
    image1Data.width,
    image1Data.height
  );
  const equalizedData = equalizedImageData.data;

  for (let i = 0; i < image1Data.data.length; i += 4) {
    const r = image1Data.data[i];
    const g = image1Data.data[i + 1];
    const b = image1Data.data[i + 2];
    const a = image1Data.data[i + 3];

    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const newGray = normalizedCdf[gray];

    const factor = newGray / (gray || 1);

    equalizedData[i] = Math.min(255, Math.max(0, Math.round(r * factor)));
    equalizedData[i + 1] = Math.min(255, Math.max(0, Math.round(g * factor)));
    equalizedData[i + 2] = Math.min(255, Math.max(0, Math.round(b * factor)));
    equalizedData[i + 3] = a;
  }

  ctx.putImageData(equalizedImageData, 0, 0);


  displayImage(canvas, "Imagem Equalizada", "equalized-result");

  const equalizedHistogram = calculateHistogram(equalizedImageData);
  const histogramAfter = drawHistogram(
    equalizedHistogram,
    "histogram-after",
    "Histograma - Depois"
  );

  const afterFieldset = document.querySelector(
    "#sec5 fieldset:last-child .fieldset-content"
  );
  afterFieldset.innerHTML = "";
  afterFieldset.appendChild(histogramAfter);

  showStatus("Equalização de histograma concluída com sucesso!", "sucess");
}

function max3x3() {
  applyMaxFilter(3);
}

function max5x5() {
  applyMaxFilter(5);
}

function max7x7() {
  applyMaxFilter(7);
}

function applyMaxFilter(kernelSize) {
  const width = image1Data.width;
  const height = image1Data.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;

  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxR = 0,
        maxG = 0,
        maxB = 0;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const nx = x + kx;
          const ny = y + ky;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const i = (ny * width + nx) * 4;
            maxR = Math.max(maxR, image1Data.data[i]);
            maxG = Math.max(maxG, image1Data.data[i + 1]);
            maxB = Math.max(maxB, image1Data.data[i + 2]);
          }
        }
      }

      const i = (y * width + x) * 4;
      resultData[i] = maxR;
      resultData[i + 1] = maxG;
      resultData[i + 2] = maxB;
      resultData[i + 3] = image1Data.data[i + 3];
    }
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, `Máximo ${kernelSize}x${kernelSize}`, "result-display");
}

function min3x3() {
  applyMinFilter(3);
}

function min5x5() {
  applyMinFilter(5);
}

function min7x7() {
  applyMinFilter(7);
}

function applyMinFilter(kernelSize) {
  const width = image1Data.width;
  const height = image1Data.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;

  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minR = 255,
        minG = 255,
        minB = 255;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const nx = x + kx;
          const ny = y + ky;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const i = (ny * width + nx) * 4;
            minR = Math.min(minR, image1Data.data[i]);
            minG = Math.min(minG, image1Data.data[i + 1]);
            minB = Math.min(minB, image1Data.data[i + 2]);
          }
        }
      }

      const i = (y * width + x) * 4;
      resultData[i] = minR;
      resultData[i + 1] = minG;
      resultData[i + 2] = minB;
      resultData[i + 3] = image1Data.data[i + 3];
    }
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, `Mínimo ${kernelSize}x${kernelSize}`, "result-display");
}


function mean3x3() {
  applyMeanFilter(3);
}

function mean5x5() {
  applyMeanFilter(5);
}

function mean7x7() {
  applyMeanFilter(7);
}

function applyMeanFilter(kernelSize) {
  const width = image1Data.width;
  const height = image1Data.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;

  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumR = 0,
        sumG = 0,
        sumB = 0,
        count = 0;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const nx = x + kx;
          const ny = y + ky;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const i = (ny * width + nx) * 4;
            sumR += image1Data.data[i];
            sumG += image1Data.data[i + 1];
            sumB += image1Data.data[i + 2];
            count++;
          }
        }
      }

      const i = (y * width + x) * 4;
      resultData[i] = Math.round(sumR / count);
      resultData[i + 1] = Math.round(sumG / count);
      resultData[i + 2] = Math.round(sumB / count);
      resultData[i + 3] = image1Data.data[i + 3];
    }
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, `Média ${kernelSize}x${kernelSize}`, "result-display");
}
