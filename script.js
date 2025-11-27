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

const valueSelectorRange = document.getElementById("valueSelectorRange");
const valueSelectorValue = document.getElementById("valueSelectorValue");

valueSelectorRange.addEventListener("input", function () {
  valueSelectorValue.value = this.value;
});

valueSelectorValue.addEventListener("input", function () {
  valueSelectorRange.value = this.value;
});

const blendingRange = document.getElementById("blendingRange");
const blendingValue = document.getElementById("blendingValue");

blendingRange.addEventListener("input", function () {
  blendingValue.value = this.value;
});

blendingValue.addEventListener("input", function () {
  blendingRange.value = this.value;
});

const valueInput = document.getElementById("valueInput");
const inputValue = document.getElementById("inputValue");

valueInput.addEventListener("input", function () {
  inputValue.value = this.value;
});

inputValue.addEventListener("input", function () {
  valueInput.value = this.value;
});

const binaryRange = document.getElementById("binaryRange");
const binaryValue = document.getElementById("binaryValue");

binaryRange.addEventListener("input", function () {
  binaryValue.value = this.value;
});

binaryValue.addEventListener("input", function () {
  binaryRange.value = this.value;
});

const ordemRange = document.getElementById("ordemRange");
const ordemValue = document.getElementById("ordemValue");

ordemRange.addEventListener("input", function () {
  ordemValue.value = this.value;
});

ordemValue.addEventListener("input", function () {
  ordemRange.value = this.value;
});

passaBaixaKernel.addEventListener("change", function () {
  const size = parseInt(this.value);
  const max = size * size;
  ordemRange.max = max;
  ordemValue.max = max;
  ordemRange.value = parseInt(max / 2);
  ordemValue.value = parseInt(max / 2);
});

const glaussRange = document.getElementById("glaussRange");
const glaussValue = document.getElementById("glaussValue");

glaussRange.addEventListener("input", function () {
  glaussValue.value = this.value;
  glaussView();
});

glaussValue.addEventListener("input", function () {
  glaussRange.value = this.value;
  glaussView();
});

passaBaixaKernel.addEventListener("change", function () {
  const size = parseInt(this.value);
  const max = size * size;
  ordemRange.max = max;
  ordemValue.max = max;
  ordemRange.value = parseInt(max / 2);
  ordemValue.value = parseInt(max / 2);
  glaussView();
});

document.addEventListener("DOMContentLoaded", function () {
  glaussView();
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
    try {
      if (typeof Tiff === "undefined") {
        showStatus(
          "Biblioteca TIFF não carregada! Verifique a conexão com a internet.",
          "error"
        );
        console.error("Tiff.js não está disponível");
        return;
      }
      console.log("Carregando arquivo TIFF...");

      Tiff.initialize({ TOTAL_MEMORY: 16777216 * 10 });

      const tiff = new Tiff({ buffer: e.target.result });

      console.log("TIFF carregado, convertendo para canvas...");

      const canvas = tiff.toCanvas();

      if (!canvas) {
        showStatus("Erro ao converter TIFF para canvas!", "error");
        return;
      }

      console.log("Canvas criado:", canvas.width + "x" + canvas.height);

      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (imageNumber === 1) {
        image1Data = imageData;
        canvas1 = canvas;
        displayImage(canvas, "Imagem TIFF 1", "image1-display");
        showStatus("Imagem TIFF 1 carregada com sucesso!", "sucess");
      } else {
        image2Data = imageData;
        canvas2 = canvas;
        displayImage(canvas, "Imagem TIFF 2", "image2-display");
        showStatus("Imagem TIFF 2 carregada com sucesso!", "sucess");
      }
    } catch (error) {
      showStatus("Erro ao carregar arquivo TIFF: " + error.message, "error");
      console.error("Erro detalhado TIFF:", error);
      console.error("Stack trace:", error.stack);
    }
  };

  reader.onerror = function (error) {
    showStatus("Erro ao ler o arquivo: " + error, "error");
    console.error("Erro ao ler arquivo:", error);
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
  const section = document.getElementById("sec9");
  if (section.dataset.active === "true") {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(x, y, 1, 1);
    const data = imageData.data;

    const r = data[0];
    const g = data[1];
    const b = data[2];

    const rgb = "RGB(" + r + ", " + g + ", " + b + ")";
    const cmyk = rgbToCmyk(r, g, b);
    const hsl = rgbToHsl(r, g, b);

    const resultCanvas = document.createElement("canvas");
    const width = canvas.width;
    const height = canvas.height;
    resultCanvas.width = width;
    resultCanvas.height = height;

    const resultCtx = resultCanvas.getContext("2d");
    const resultImageData = resultCtx.createImageData(width, height);
    const resultData = resultImageData.data;

    for (let i = 0; i < resultData.length; i += 4) {
      resultData[i] = r;
      resultData[i + 1] = g;
      resultData[i + 2] = b;
      resultData[i + 3] = 255;
    }

    resultCtx.putImageData(resultImageData, 0, 0);
    let title = "Cor do Pixel Clicado";
    displayImage(resultCanvas, title, "result-display");

    document.getElementById("rgbValue").textContent = rgb;
    document.getElementById("cmykValue").textContent = cmyk;
    document.getElementById("hslValue").textContent = hsl;
  }
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

  showStatus("Imagens removidas com sucesso!", "sucess");
}

function saveImg() {
  const container = document.getElementById("result-display");
  const canvasImg = container.querySelector("canvas");
  const canvasUrl = canvasImg.toDataURL();
  const link = document.createElement("a");
  link.download = "result.png";
  link.href = canvasUrl;
  link.click();

  showStatus("Imagem salva com sucesso!", "sucess");
}

function showStatus(mensagem, tipo) {
  const msg = document.getElementById("status");
  if (msg) {
    msg.remove();
  }

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

function addValueToImage() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }

  const value = parseInt(document.getElementById("valueInput").value);
  const canvas = document.createElement("canvas");
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(imgData.width, imgData.height);
  const resultData = resultImageData.data;

  for (let i = 0; i < imgData.data.length; i += 4) {
    const r = imgData.data[i];
    const g = imgData.data[i + 1];
    const b = imgData.data[i + 2];
    const a = imgData.data[i + 3];

    resultData[i] = Math.min(255, r + value);
    resultData[i + 1] = Math.min(255, g + value);
    resultData[i + 2] = Math.min(255, b + value);
    resultData[i + 3] = a;
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, "Imagem + " + value, "result-display");
  showStatus("Imagem + " + value + " concluída com sucesso!", "sucess");
}

function subtractValueFromImage() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }

  const value = parseInt(document.getElementById("valueInput").value);
  const canvas = document.createElement("canvas");
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(imgData.width, imgData.height);
  const resultData = resultImageData.data;

  for (let i = 0; i < imgData.data.length; i += 4) {
    const r = imgData.data[i];
    const g = imgData.data[i + 1];
    const b = imgData.data[i + 2];
    const a = imgData.data[i + 3];

    resultData[i] = Math.max(0, r - value);
    resultData[i + 1] = Math.max(0, g - value);
    resultData[i + 2] = Math.max(0, b - value);
    resultData[i + 3] = a;
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, "Imagem - " + value, "result-display");
  showStatus("Imagem - " + value + " concluída com sucesso!", "sucess");
}

function multiValueToImage() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }

  const value = parseFloat(
    document.querySelector('input[id="valueSelectorValue"]').value
  );
  const canvas = document.createElement("canvas");
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(imgData.width, imgData.height);
  const resultData = resultImageData.data;

  for (let i = 0; i < imgData.data.length; i += 4) {
    const r = imgData.data[i];
    const g = imgData.data[i + 1];
    const b = imgData.data[i + 2];
    const a = imgData.data[i + 3];

    resultData[i] = Math.max(0, r * value);
    resultData[i + 1] = Math.max(0, g * value);
    resultData[i + 2] = Math.max(0, b * value);
    resultData[i + 3] = a;
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, "Imagem * " + value, "result-display");
  showStatus("Imagem * " + value + " concluída com sucesso!", "sucess");
}

function dividerValueToImage() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }

  const value = parseFloat(
    document.querySelector('input[id="valueSelectorValue"]').value
  );
  const canvas = document.createElement("canvas");
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(imgData.width, imgData.height);
  const resultData = resultImageData.data;

  for (let i = 0; i < imgData.data.length; i += 4) {
    const r = imgData.data[i];
    const g = imgData.data[i + 1];
    const b = imgData.data[i + 2];
    const a = imgData.data[i + 3];

    resultData[i] = Math.max(0, r / value);
    resultData[i + 1] = Math.max(0, g / value);
    resultData[i + 2] = Math.max(0, b / value);
    resultData[i + 3] = a;
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, "Imagem / " + value, "result-display");
  showStatus("Imagem / " + value + " concluída com sucesso!", "sucess");
}

function grayTransform() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }

  const canvas = document.createElement("canvas");
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(imgData.width, imgData.height);
  const resultData = resultImageData.data;

  for (let i = 0; i < imgData.data.length; i += 4) {
    const r = imgData.data[i];
    const g = imgData.data[i + 1];
    const b = imgData.data[i + 2];
    const a = imgData.data[i + 3];
    const gray = (r + g + b) / 3;

    resultData[i] = gray;
    resultData[i + 1] = gray;
    resultData[i + 2] = gray;
    resultData[i + 3] = a;
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, "Imagem em Escala de Cinza", "result-display");
  showStatus("Imagem em Escala de Cinza concluída com sucesso!", "sucess");
}

function convertToBinary(imgData, threshold) {
  const canvas = document.createElement("canvas");
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext("2d");
  const binData = ctx.createImageData(imgData.width, imgData.height);

  for (let i = 0; i < imgData.data.length; i += 4) {
    const gray =
      (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
    const binary = gray > threshold ? 255 : 0;
    binData.data[i] = binary;
    binData.data[i + 1] = binary;
    binData.data[i + 2] = binary;
    binData.data[i + 3] = imgData.data[i + 3];
  }

  return binData;
}

function binaryConvert() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }

  const value = parseInt(document.getElementById("binaryValue").value);
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;

  const binData = convertToBinary(imgData, value);

  const canvas = document.createElement("canvas");
  canvas.width = binData.width;
  canvas.height = binData.height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(binData, 0, 0);

  displayImage(canvas, "Imagem Binária", "result-display");
  showStatus("Imagem Binária concluída com sucesso!", "sucess");
}

function negativeTransform() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }

  const canvas = document.createElement("canvas");
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(imgData.width, imgData.height);
  const resultData = resultImageData.data;

  for (let i = 0; i < imgData.data.length; i += 4) {
    const r = imgData.data[i];
    const g = imgData.data[i + 1];
    const b = imgData.data[i + 2];
    const a = imgData.data[i + 3];

    resultData[i] = 255 - r;
    resultData[i + 1] = 255 - g;
    resultData[i + 2] = 255 - b;
    resultData[i + 3] = a;
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, "Imagem Negativa", "result-display");
  showStatus("Imagem Negativa concluída com sucesso!", "sucess");
}

function andLogic() {
  if (!image1Data || !image2Data) {
    showStatus("Por favor, carregue duas imagens!", "error");
    return;
  }
  logicProcess("and");
}

function orLogic() {
  if (!image1Data || !image2Data) {
    showStatus("Por favor, carregue duas imagens!", "error");
    return;
  }
  logicProcess("or");
}

function notLogic() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }
  logicProcess("not");
}

function xorLogic() {
  if (!image1Data || !image2Data) {
    showStatus("Por favor, carregue duas imagens!", "error");
    return;
  }
  logicProcess("xor");
}

function processImages(operation) {
  if (!image1Data || !image2Data) {
    showStatus("Por favor, carregue duas imagens!", "error");
    return;
  }
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

    switch (operation) {
      case "add":
        resultData[i] = Math.min(255, r1 + r2);
        resultData[i + 1] = Math.min(255, g1 + g2);
        resultData[i + 2] = Math.min(255, b1 + b2);
        break;
      case "sub":
        resultData[i] = Math.max(0, r1 - r2);
        resultData[i + 1] = Math.max(0, g1 - g2);
        resultData[i + 2] = Math.max(0, b1 - b2);
        break;
    }
    resultData[i + 3] = Math.min(a1, a2);
  }

  ctx.putImageData(resultImageData, 0, 0);
  let title;
  if (operation === "add") {
    title = "Soma das Imagens";
  } else {
    title = "Subtração das Imagens";
  }
  displayImage(canvas, title, "result-display");
  showStatus(title + " concluída com sucesso!", "sucess");
}

function flipHorizontal() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;
  const canvas = document.createElement("canvas");
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext("2d");

  ctx.scale(-1, 1);
  ctx.drawImage(canvas1, -canvas.width, 0);

  displayImage(canvas, "Imagem Invertida Horizontalmente", "result-display");
  showStatus("Inversão Horizontal " + " concluída com sucesso!", "sucess");
}

function flipVertical() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;
  const canvas = document.createElement("canvas");
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  const ctx = canvas.getContext("2d");

  ctx.scale(1, -1);
  ctx.drawImage(canvas1, 0, -canvas.height);

  displayImage(canvas, "Imagem Invertida Verticalmente", "result-display");
  showStatus("Inversão Vertical " + " concluída com sucesso!", "sucess");
}

function difference() {
  if (!image1Data || !image2Data) {
    showStatus("Por favor, carregue as duas imagens!", "error");
    return;
  }
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
  showStatus("Diferença das imagens concluída com sucesso!", "sucess");
}

function blending() {
  if (!image1Data || !image2Data) {
    showStatus("Por favor, carregue as duas imagens!", "error");
    return;
  }
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
  displayImage(canvas, "Blending " + value + " das imagens", "result-display");
  showStatus("Blending concluído com sucesso!", "sucess");
}

function media() {
  if (!image1Data || !image2Data) {
    showStatus("Por favor, carregue as duas imagens!", "error");
    return;
  }
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
  displayImage(canvas, "Média das imagens", "result-display");
  showStatus("Média das imagens concluída com sucesso!", "sucess");
}

function logicProcess(operation) {
  const value = parseInt(document.getElementById("binaryValue").value);

  if (operation === "not") {
    const img1 = document.getElementById("image1-display");
    const imgData = img1 ? image1Data : image2Data;

    const binData = convertToBinary(imgData, value);
    const width = binData.width;
    const height = binData.height;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const resultImageData = ctx.createImageData(width, height);
    const resultData = resultImageData.data;

    for (let i = 0; i < width * height * 4; i += 4) {
      const r1 = binData.data[i];
      const a1 = binData.data[i + 3];

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
    displayImage(canvas, "Imagem NOT", "result-display");
    showStatus("NOT da imagem concluída com sucesso!", "sucess");
  } else {
    const bin1Data = convertToBinary(image1Data, value);
    const bin2Data = convertToBinary(image2Data, value);

    const width = Math.min(bin1Data.width, bin2Data.width);
    const height = Math.min(bin1Data.height, bin2Data.height);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    const resultImageData = ctx.createImageData(width, height);
    const resultData = resultImageData.data;

    for (let i = 0; i < width * height * 4; i += 4) {
      const r1 = bin1Data.data[i];
      const g1 = bin1Data.data[i + 1];
      const b1 = bin1Data.data[i + 2];
      const a1 = bin1Data.data[i + 3];

      const r2 = bin2Data.data[i];
      const a2 = bin2Data.data[i + 3];

      switch (operation) {
        case "and":
          if (r1 === 255 && r2 === 255) {
            resultData[i] = 255;
            resultData[i + 1] = 255;
            resultData[i + 2] = 255;
          } else {
            resultData[i] = 0;
            resultData[i + 1] = 0;
            resultData[i + 2] = 0;
          }
          break;

        case "or":
          if (r1 === 255 || r2 === 255) {
            resultData[i] = 255;
            resultData[i + 1] = 255;
            resultData[i + 2] = 255;
          } else {
            resultData[i] = 0;
            resultData[i + 1] = 0;
            resultData[i + 2] = 0;
          }
          break;

        case "xor":
          if (r1 !== r2) {
            resultData[i] = 255;
            resultData[i + 1] = 255;
            resultData[i + 2] = 255;
          } else {
            resultData[i] = 0;
            resultData[i + 1] = 0;
            resultData[i + 2] = 0;
          }
          break;
      }
      resultData[i + 3] = Math.min(a1, a2);
    }
    ctx.putImageData(resultImageData, 0, 0);
    let title;
    if (operation === "or") title = "OR";
    if (operation === "xor") title = "XOR";
    if (operation === "and") title = "AND";
    displayImage(canvas, title + " das imagens", "result-display");
    showStatus(title + " das imagens concluída com sucesso!", "sucess");
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
  ctx.fillText("0", 10, canvas.height);
  ctx.fillText("255", canvas.width - 5, canvas.height - 5);

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

function simplyFilter(operation) {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;
  const width = imgData.width;
  const height = imgData.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;
  const kernelSize = parseInt(
    document.getElementById("passaBaixaKernel").value
  );
  const halfKernel = Math.floor(kernelSize / 2);
  let title = "";
  switch (operation) {
    case "max":
      title = "Máximo";
      break;
    case "min":
      title = "Mínimo";
      break;
    case "mean":
      title = "Média";
      break;
    case "median":
      title = "Mediana";
      break;
    case "suaCon":
      title = "Suavização Conservativa";
  }
  switch (operation) {
    case "max":
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
                maxR = Math.max(maxR, imgData.data[i]);
                maxG = Math.max(maxG, imgData.data[i + 1]);
                maxB = Math.max(maxB, imgData.data[i + 2]);
              }
            }
          }

          const i = (y * width + x) * 4;
          resultData[i] = maxR;
          resultData[i + 1] = maxG;
          resultData[i + 2] = maxB;
          resultData[i + 3] = imgData.data[i + 3];
        }
      }
      break;
    case "min":
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
                minR = Math.min(minR, imgData.data[i]);
                minG = Math.min(minG, imgData.data[i + 1]);
                minB = Math.min(minB, imgData.data[i + 2]);
              }
            }
          }

          const i = (y * width + x) * 4;
          resultData[i] = minR;
          resultData[i + 1] = minG;
          resultData[i + 2] = minB;
          resultData[i + 3] = imgData.data[i + 3];
        }
      }
      break;
    case "mean":
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
                sumR += imgData.data[i];
                sumG += imgData.data[i + 1];
                sumB += imgData.data[i + 2];
                count++;
              }
            }
          }

          const i = (y * width + x) * 4;
          resultData[i] = Math.round(sumR / count);
          resultData[i + 1] = Math.round(sumG / count);
          resultData[i + 2] = Math.round(sumB / count);
          resultData[i + 3] = imgData.data[i + 3];
        }
      }
      break;
    case "median":
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const valuesR = [];
          const valuesG = [];
          const valuesB = [];

          for (let ky = -halfKernel; ky <= halfKernel; ky++) {
            for (let kx = -halfKernel; kx <= halfKernel; kx++) {
              const nx = x + kx;
              const ny = y + ky;

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const i = (ny * width + nx) * 4;
                valuesR.push(imgData.data[i]);
                valuesG.push(imgData.data[i + 1]);
                valuesB.push(imgData.data[i + 2]);
              }
            }
          }

          valuesR.sort((a, b) => a - b);
          valuesG.sort((a, b) => a - b);
          valuesB.sort((a, b) => a - b);

          const medianIndex = Math.floor(valuesR.length / 2);

          const i = (y * width + x) * 4;
          resultData[i] = valuesR[medianIndex];
          resultData[i + 1] = valuesG[medianIndex];
          resultData[i + 2] = valuesB[medianIndex];
          resultData[i + 3] = imgData.data[i + 3];
        }
      }
      break;
    case "suaCon":
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const valuesR = [];
          const valuesG = [];
          const valuesB = [];

          for (let ky = -halfKernel; ky <= halfKernel; ky++) {
            for (let kx = -halfKernel; kx <= halfKernel; kx++) {
              if (ky === 0 && kx === 0) {
                continue;
              }
              const nx = x + kx;
              const ny = y + ky;

              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const i = (ny * width + nx) * 4;
                valuesR.push(imgData.data[i]);
                valuesG.push(imgData.data[i + 1]);
                valuesB.push(imgData.data[i + 2]);
              }
            }
          }

          const i = (y * width + x) * 4;
          const centerR = imgData.data[i];
          const centerG = imgData.data[i + 1];
          const centerB = imgData.data[i + 2];

          const minR = Math.min(...valuesR);
          const maxR = Math.max(...valuesR);
          const minG = Math.min(...valuesG);
          const maxG = Math.max(...valuesG);
          const minB = Math.min(...valuesB);
          const maxB = Math.max(...valuesB);

          if (centerR < minR || centerR > maxR) {
            valuesR.sort((a, b) => a - b);
            resultData[i] = valuesR[Math.floor(valuesR.length / 2)];
          } else {
            resultData[i] = centerR;
          }

          if (centerG < minG || centerG > maxG) {
            valuesG.sort((a, b) => a - b);
            resultData[i + 1] = valuesG[Math.floor(valuesG.length / 2)];
          } else {
            resultData[i + 1] = centerG;
          }

          if (centerB < minB || centerB > maxB) {
            valuesB.sort((a, b) => a - b);
            resultData[i + 2] = valuesB[Math.floor(valuesB.length / 2)];
          } else {
            resultData[i + 2] = centerB;
          }

          resultData[i + 3] = imgData.data[i + 3];
        }
      }
      break;
  }
  ctx.putImageData(resultImageData, 0, 0);
  displayImage(
    canvas,
    `${title} = ${kernelSize}x${kernelSize}`,
    "result-display"
  );
  showStatus(`Filtro ${title} ${kernelSize}x${kernelSize} aplicado!`, "sucess");
}

function applyOrdemFilter() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue uma imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;

  const width = imgData.width;
  const height = imgData.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;
  const kernelSize = parseInt(
    document.getElementById("passaBaixaKernel").value
  );
  const halfKernel = Math.floor(kernelSize / 2);

  const rank = parseInt(document.getElementById("ordemValue").value);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const valuesR = [];
      const valuesG = [];
      const valuesB = [];

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const nx = x + kx;
          const ny = y + ky;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const i = (ny * width + nx) * 4;
            valuesR.push(imgData.data[i]);
            valuesG.push(imgData.data[i + 1]);
            valuesB.push(imgData.data[i + 2]);
          }
        }
      }

      valuesR.sort((a, b) => a - b);
      valuesG.sort((a, b) => a - b);
      valuesB.sort((a, b) => a - b);

      const i = (y * width + x) * 4;
      resultData[i] = valuesR[rank - 1];
      resultData[i + 1] = valuesG[rank - 1];
      resultData[i + 2] = valuesB[rank - 1];
      resultData[i + 3] = imgData.data[i + 3];
    }
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(
    canvas,
    `Ordem ${kernelSize}x${kernelSize} (rank=${rank})`,
    "result-display"
  );
  showStatus(`Filtro de Ordem aplicado!`, "sucess");
}

function applyGaussianFilter() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;

  const width = imgData.width;
  const height = imgData.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;
  const kernelSize = parseInt(
    document.getElementById("passaBaixaKernel").value
  );
  const sigma = parseFloat(document.getElementById("glaussValue").value);
  const kernel = generateGaussianKernel(kernelSize); // Remove o sigma aqui
  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumR = 0,
        sumG = 0,
        sumB = 0;
      let sumWeights = 0;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          const nx = x + kx;
          const ny = y + ky;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const i = (ny * width + nx) * 4;
            const weight = kernel[ky + halfKernel][kx + halfKernel];

            sumR += imgData.data[i] * weight;
            sumG += imgData.data[i + 1] * weight;
            sumB += imgData.data[i + 2] * weight;
            sumWeights += weight;
          }
        }
      }

      const i = (y * width + x) * 4;
      resultData[i] = Math.round(sumR / sumWeights);
      resultData[i + 1] = Math.round(sumG / sumWeights);
      resultData[i + 2] = Math.round(sumB / sumWeights);
      resultData[i + 3] = imgData.data[i + 3];
    }
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(
    canvas,
    `Gaussiano ${kernelSize}x${kernelSize} (σ=${sigma})`,
    "result-display"
  );
  showStatus(`Filtro Gaussiano aplicado!`, "sucess");
}

function generateGaussianKernel(size) {
  const kernel = [];
  const sigma = parseFloat(document.getElementById("glaussValue").value);
  const mean = Math.floor(size / 2);
  let sum = 0;

  for (let y = 0; y < size; y++) {
    kernel[y] = [];
    for (let x = 0; x < size; x++) {
      const exponent = -(
        (Math.pow(x - mean, 2) + Math.pow(y - mean, 2)) /
        (2 * Math.pow(sigma, 2))
      );
      const value = Math.exp(exponent);
      kernel[y][x] = value;
      sum += value;
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      kernel[y][x] /= sum;
    }
  }
  return kernel;
}

function glaussView() {
  const canvas = document.getElementById("gaussianKernelCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const kernelSize = parseInt(
    document.getElementById("passaBaixaKernel").value
  );
  const kernel = generateGaussianKernel(kernelSize);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let maxValue = 0;
  for (let y = 0; y < kernelSize; y++) {
    for (let x = 0; x < kernelSize; x++) {
      maxValue = Math.max(maxValue, kernel[y][x]);
    }
  }

  const cellSize = Math.min(canvas.width, canvas.height) / kernelSize;
  const padding = 2;

  for (let y = 0; y < kernelSize; y++) {
    for (let x = 0; x < kernelSize; x++) {
      const value = kernel[y][x];
      const normalizedValue = value / maxValue;

      const intensity = Math.floor(255 * normalizedValue);
      ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;

      ctx.fillRect(
        x * cellSize + padding,
        y * cellSize + padding,
        cellSize - padding * 2,
        cellSize - padding * 2
      );
    }
  }
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  for (let i = 0; i <= kernelSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, kernelSize * cellSize);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(kernelSize * cellSize, i * cellSize);
    ctx.stroke();
  }
}

function prewitt() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;

  const width = imgData.width;
  const height = imgData.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;

  const kernelX = [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ];

  const kernelY = [
    [-1, -1, -1],
    [0, 0, 0],
    [1, 1, 1],
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gxR = 0,
        gxG = 0,
        gxB = 0;
      let gyR = 0,
        gyG = 0,
        gyB = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const i = (py * width + px) * 4;

          const r = imgData.data[i];
          const g = imgData.data[i + 1];
          const b = imgData.data[i + 2];

          const weightX = kernelX[ky + 1][kx + 1];
          const weightY = kernelY[ky + 1][kx + 1];

          gxR += r * weightX;
          gxG += g * weightX;
          gxB += b * weightX;

          gyR += r * weightY;
          gyG += g * weightY;
          gyB += b * weightY;
        }
      }

      const magnitudeR = Math.sqrt(gxR * gxR + gyR * gyR);
      const magnitudeG = Math.sqrt(gxG * gxG + gyG * gyG);
      const magnitudeB = Math.sqrt(gxB * gxB + gyB * gyB);

      const i = (y * width + x) * 4;
      resultData[i] = Math.min(255, Math.max(0, magnitudeR));
      resultData[i + 1] = Math.min(255, Math.max(0, magnitudeG));
      resultData[i + 2] = Math.min(255, Math.max(0, magnitudeB));
      resultData[i + 3] = imgData.data[i + 3];
    }
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, "Prewitt", "result-display");
  showStatus("Filtro Prewitt aplicado com sucesso!", "sucess");
}

function sobel() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;

  const width = imgData.width;
  const height = imgData.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;

  const kernelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];

  const kernelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gxR = 0,
        gxG = 0,
        gxB = 0;
      let gyR = 0,
        gyG = 0,
        gyB = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const i = (py * width + px) * 4;

          const r = imgData.data[i];
          const g = imgData.data[i + 1];
          const b = imgData.data[i + 2];

          const weightX = kernelX[ky + 1][kx + 1];
          const weightY = kernelY[ky + 1][kx + 1];

          gxR += r * weightX;
          gxG += g * weightX;
          gxB += b * weightX;

          gyR += r * weightY;
          gyG += g * weightY;
          gyB += b * weightY;
        }
      }

      const magnitudeR = Math.sqrt(gxR * gxR + gyR * gyR);
      const magnitudeG = Math.sqrt(gxG * gxG + gyG * gyG);
      const magnitudeB = Math.sqrt(gxB * gxB + gyB * gyB);

      const i = (y * width + x) * 4;
      resultData[i] = Math.min(255, Math.max(0, magnitudeR));
      resultData[i + 1] = Math.min(255, Math.max(0, magnitudeG));
      resultData[i + 2] = Math.min(255, Math.max(0, magnitudeB));
      resultData[i + 3] = imgData.data[i + 3];
    }
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, "Sobel", "result-display");
  showStatus("Filtro Sobel aplicado com sucesso!", "sucess");
}

function laplaciano() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;

  const width = imgData.width;
  const height = imgData.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;

  const kernel = [
    [-1, -1, -1],
    [-1, 8, -1],
    [-1, -1, -1],
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sumR = 0,
        sumG = 0,
        sumB = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const i = (py * width + px) * 4;

          const r = imgData.data[i];
          const g = imgData.data[i + 1];
          const b = imgData.data[i + 2];

          const weight = kernel[ky + 1][kx + 1];

          sumR += r * weight;
          sumG += g * weight;
          sumB += b * weight;
        }
      }

      const i = (y * width + x) * 4;
      resultData[i] = Math.min(255, Math.max(0, Math.abs(sumR)));
      resultData[i + 1] = Math.min(255, Math.max(0, Math.abs(sumG)));
      resultData[i + 2] = Math.min(255, Math.max(0, Math.abs(sumB)));
      resultData[i + 3] = imgData.data[i + 3];
    }
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, "Laplaciano", "result-display");
  showStatus("Filtro Laplaciano aplicado com sucesso!", "sucess");
}

function createStructuringElement(size, type) {
  const element = [];
  const center = Math.floor(size / 2);

  for (let y = 0; y < size; y++) {
    element[y] = [];
    for (let x = 0; x < size; x++) {
      element[y][x] = 0;
    }
  }

  if (type === "horizontal") {
    for (let x = 0; x < size; x++) {
      element[center][x] = 1;
    }
  } else if (type === "vertical") {
    for (let y = 0; y < size; y++) {
      element[y][center] = 1;
    }
  } else if (type === "cross") {
    for (let x = 0; x < size; x++) {
      element[center][x] = 1;
    }
    for (let y = 0; y < size; y++) {
      element[y][center] = 1;
    }
  }

  return element;
}

function dilate() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;

  const kernelSize = parseInt(document.getElementById("morphKernelSize").value);
  const structType = document.getElementById("morphStructElement").value;
  const structElement = createStructuringElement(kernelSize, structType);

  const width = imgData.width;
  const height = imgData.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;

  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxValue = 0;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          if (structElement[ky + halfKernel][kx + halfKernel] === 1) {
            const nx = x + kx;
            const ny = y + ky;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const i = (ny * width + nx) * 4;
              maxValue = Math.max(maxValue, imgData.data[i]);
            }
          }
        }
      }

      const i = (y * width + x) * 4;
      resultData[i] = maxValue;
      resultData[i + 1] = maxValue;
      resultData[i + 2] = maxValue;
      resultData[i + 3] = 255;
    }
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(
    canvas,
    `Dilatação ${kernelSize}x${kernelSize}`,
    "result-display"
  );
  showStatus(`Dilatação ${kernelSize}x${kernelSize} aplicada!`, "sucess");
}

function erode() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;

  const kernelSize = parseInt(document.getElementById("morphKernelSize").value);
  const structType = document.getElementById("morphStructElement").value;
  const structElement = createStructuringElement(kernelSize, structType);

  const width = imgData.width;
  const height = imgData.height;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const resultImageData = ctx.createImageData(width, height);
  const resultData = resultImageData.data;

  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minValue = 255;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          if (structElement[ky + halfKernel][kx + halfKernel] === 1) {
            const nx = x + kx;
            const ny = y + ky;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const i = (ny * width + nx) * 4;
              minValue = Math.min(minValue, imgData.data[i]);
            } else {
              minValue = 0;
            }
          }
        }
      }

      const i = (y * width + x) * 4;
      resultData[i] = minValue;
      resultData[i + 1] = minValue;
      resultData[i + 2] = minValue;
      resultData[i + 3] = 255;
    }
  }

  ctx.putImageData(resultImageData, 0, 0);
  displayImage(canvas, `Erosão ${kernelSize}x${kernelSize}`, "result-display");
  showStatus(`Erosão ${kernelSize}x${kernelSize} aplicada!`, "sucess");
}

function opening() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;

  const kernelSize = parseInt(document.getElementById("morphKernelSize").value);
  const structType = document.getElementById("morphStructElement").value;
  const structElement = createStructuringElement(kernelSize, structType);

  const width = imgData.width;
  const height = imgData.height;

  const canvas1 = document.createElement("canvas");
  canvas1.width = width;
  canvas1.height = height;
  const ctx1 = canvas1.getContext("2d");

  const erodedImageData = ctx1.createImageData(width, height);
  const erodedData = erodedImageData.data;

  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minValue = 255;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          if (structElement[ky + halfKernel][kx + halfKernel] === 1) {
            const nx = x + kx;
            const ny = y + ky;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const i = (ny * width + nx) * 4;
              minValue = Math.min(minValue, imgData.data[i]);
            } else {
              minValue = 0;
            }
          }
        }
      }

      const i = (y * width + x) * 4;
      erodedData[i] = minValue;
      erodedData[i + 1] = minValue;
      erodedData[i + 2] = minValue;
      erodedData[i + 3] = 255;
    }
  }

  const canvas2 = document.createElement("canvas");
  canvas2.width = width;
  canvas2.height = height;
  const ctx2 = canvas2.getContext("2d");

  const resultImageData = ctx2.createImageData(width, height);
  const resultData = resultImageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxValue = 0;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          if (structElement[ky + halfKernel][kx + halfKernel] === 1) {
            const nx = x + kx;
            const ny = y + ky;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const i = (ny * width + nx) * 4;
              maxValue = Math.max(maxValue, erodedData[i]);
            }
          }
        }
      }

      const i = (y * width + x) * 4;
      resultData[i] = maxValue;
      resultData[i + 1] = maxValue;
      resultData[i + 2] = maxValue;
      resultData[i + 3] = 255;
    }
  }

  ctx2.putImageData(resultImageData, 0, 0);
  displayImage(
    canvas2,
    `Abertura ${kernelSize}x${kernelSize}`,
    "result-display"
  );
  showStatus(`Abertura ${kernelSize}x${kernelSize} aplicada!`, "sucess");
}

function closing() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;

  const kernelSize = parseInt(document.getElementById("morphKernelSize").value);
  const structType = document.getElementById("morphStructElement").value;
  const structElement = createStructuringElement(kernelSize, structType);

  const width = imgData.width;
  const height = imgData.height;

  const canvas1 = document.createElement("canvas");
  canvas1.width = width;
  canvas1.height = height;
  const ctx1 = canvas1.getContext("2d");

  const dilatedImageData = ctx1.createImageData(width, height);
  const dilatedData = dilatedImageData.data;

  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxValue = 0;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          if (structElement[ky + halfKernel][kx + halfKernel] === 1) {
            const nx = x + kx;
            const ny = y + ky;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const i = (ny * width + nx) * 4;
              maxValue = Math.max(maxValue, imgData.data[i]);
            }
          }
        }
      }

      const i = (y * width + x) * 4;
      dilatedData[i] = maxValue;
      dilatedData[i + 1] = maxValue;
      dilatedData[i + 2] = maxValue;
      dilatedData[i + 3] = 255;
    }
  }

  const canvas2 = document.createElement("canvas");
  canvas2.width = width;
  canvas2.height = height;
  const ctx2 = canvas2.getContext("2d");

  const resultImageData = ctx2.createImageData(width, height);
  const resultData = resultImageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minValue = 255;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          if (structElement[ky + halfKernel][kx + halfKernel] === 1) {
            const nx = x + kx;
            const ny = y + ky;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const i = (ny * width + nx) * 4;
              minValue = Math.min(minValue, dilatedData[i]);
            } else {
              minValue = 0;
            }
          }
        }
      }

      const i = (y * width + x) * 4;
      resultData[i] = minValue;
      resultData[i + 1] = minValue;
      resultData[i + 2] = minValue;
      resultData[i + 3] = 255;
    }
  }

  ctx2.putImageData(resultImageData, 0, 0);
  displayImage(
    canvas2,
    `Fechamento ${kernelSize}x${kernelSize}`,
    "result-display"
  );
  showStatus(`Fechamento ${kernelSize}x${kernelSize} aplicado!`, "sucess");
}

function outline() {
  if (!image1Data && !image2Data) {
    showStatus("Por favor, carregue a primeira imagem!", "error");
    return;
  }
  const img1 = document.getElementById("image1-display");
  const imgData = img1 ? image1Data : image2Data;

  const kernelSize = parseInt(document.getElementById("morphKernelSize").value);
  const structType = document.getElementById("morphStructElement").value;
  const structElement = createStructuringElement(kernelSize, structType);

  const width = imgData.width;
  const height = imgData.height;

  const canvas1 = document.createElement("canvas");
  canvas1.width = width;
  canvas1.height = height;
  const ctx1 = canvas1.getContext("2d");

  const erodedImageData = ctx1.createImageData(width, height);
  const erodedData = erodedImageData.data;

  const halfKernel = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minValue = 255;

      for (let ky = -halfKernel; ky <= halfKernel; ky++) {
        for (let kx = -halfKernel; kx <= halfKernel; kx++) {
          if (structElement[ky + halfKernel][kx + halfKernel] === 1) {
            const nx = x + kx;
            const ny = y + ky;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const i = (ny * width + nx) * 4;
              minValue = Math.min(minValue, imgData.data[i]);
            } else {
              minValue = 0;
            }
          }
        }
      }

      const i = (y * width + x) * 4;
      erodedData[i] = minValue;
      erodedData[i + 1] = minValue;
      erodedData[i + 2] = minValue;
      erodedData[i + 3] = 255;
    }
  }

  const canvas2 = document.createElement("canvas");
  canvas2.width = width;
  canvas2.height = height;
  const ctx2 = canvas2.getContext("2d");

  const resultImageData = ctx2.createImageData(width, height);
  const resultData = resultImageData.data;

  for (let i = 0; i < imgData.data.length; i += 4) {
    const diff = Math.max(0, imgData.data[i] - erodedData[i]);
    resultData[i] = diff;
    resultData[i + 1] = diff;
    resultData[i + 2] = diff;
    resultData[i + 3] = 255;
  }

  ctx2.putImageData(resultImageData, 0, 0);
  displayImage(
    canvas2,
    `Contorno ${kernelSize}x${kernelSize}`,
    "result-display"
  );
  showStatus(`Contorno ${kernelSize}x${kernelSize} aplicado!`, "sucess");
}
