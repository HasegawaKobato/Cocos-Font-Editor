window.onload = () => {
  document.querySelector("#file").addEventListener("change", onFileChanged);
};

let fontImg = {};
let fontData = {
  size: 16,
  padding: [0, 0, 0, 0],
  lineheight: 14,
  base: 12,
  scaleW: 24,
  scaleH: 24,
  chars: [
    {
      id: 48,
      x: 0,
      y: 0,
      width: 48,
      height: 48,
      xoffset: 0,
      yoffset: 0,
      xadvance: 58,
      page: 0,
      chnl: 15,
    },
  ],
};

const baseKey = ["size", "padding", "lineheight", "base", "scaleW", "scaleH"];

function onFileChanged(e) {
  let files = e.target.files;
  let completed = 0;

  for (let f = 0; f < files.length; f++) {
    let file = files[f];
    const nameArr = file.name.split(".");
    const extensionName = nameArr[nameArr.length - 1];
    const name = file.name.replace(`.${extensionName}`, "");

    let fr = new FileReader();
    if (extensionName === "png") {
      fr.onload = () => {
        let img = document.createElement("img");
        img.src = fr.result;
        document.querySelector("body").append(img);
        setTimeout(() => {
          fontImg = {
            id: f,
            w: img.offsetWidth,
            h: img.offsetHeight,
            data: img,
            name: name,
          };
          completed++;
          if (completed === files.length) {
            start();
          }
        }, 100);
      };
      fr.readAsDataURL(file);
    } else if (extensionName === "fnt") {
      fr.onload = () => {
        const fileText = fr.result;
        const sizeReg = new RegExp(/size=\d*/, "g");
        const paddingReg = new RegExp(/padding=[\d|\,]*/, "g");
        const lineHeightReg = new RegExp(/lineHeight=\d*/, "g");
        const baseReg = new RegExp(/base=\d*/, "g");
        const scaleWReg = new RegExp(/scaleW=\d*/, "g");
        const scaleHReg = new RegExp(/scaleH=\d*/, "g");
        const charDatasReg = new RegExp(/^char\s.*$/, "gm");
        const size = fileText.match(sizeReg)[0].split("=")[1];
        const padding = fileText.match(paddingReg)[0].split("=")[1];
        const lineHeight = fileText.match(lineHeightReg)[0].split("=")[1];
        const base = fileText.match(baseReg)[0].split("=")[1];
        const scaleW = fileText.match(scaleWReg)[0].split("=")[1];
        const scaleH = fileText.match(scaleHReg)[0].split("=")[1];
        fontData.size = size;
        fontData.padding = padding;
        fontData.lineheight = lineHeight;
        fontData.base = base;
        fontData.scaleW = scaleW;
        fontData.scaleH = scaleH;
        fontData.chars = [];
        fileText.match(charDatasReg).forEach((match) => {
          const idReg = new RegExp(/id=\d*/, "g");
          const xReg = new RegExp(/x=\d*/, "g");
          const yReg = new RegExp(/y=\d*/, "g");
          const widthReg = new RegExp(/width=\d*/, "g");
          const heightReg = new RegExp(/height=\d*/, "g");
          const xoffsetReg = new RegExp(/xoffset=\d*/, "g");
          const yoffsetReg = new RegExp(/yoffset=\d*/, "g");
          const xadvanceReg = new RegExp(/xadvance=\d*/, "g");
          const pageReg = new RegExp(/page=\d*/, "g");
          const chnlReg = new RegExp(/chnl=\d*/, "g");
          const charData = {};
          const id = match.match(idReg)[0].split("=")[1];
          const x = match.match(xReg)[0].split("=")[1];
          const y = match.match(yReg)[0].split("=")[1];
          const width = match.match(widthReg)[0].split("=")[1];
          const height = match.match(heightReg)[0].split("=")[1];
          const xoffset = match.match(xoffsetReg)[0].split("=")[1];
          const yoffset = match.match(yoffsetReg)[0].split("=")[1];
          const xadvance = match.match(xadvanceReg)[0].split("=")[1];
          const page = match.match(pageReg)[0].split("=")[1];
          const chnl = match.match(chnlReg)[0].split("=")[1];
          charData.id = id;
          charData.x = x;
          charData.y = y;
          charData.width = width;
          charData.height = height;
          charData.xoffset = xoffset;
          charData.yoffset = yoffset;
          charData.xadvance = xadvance;
          charData.page = page;
          charData.chnl = chnl;
          fontData.chars.push(Object.assign({}, charData));
        });
        completed++;
        if (completed === files.length) {
          start();
        }
      };
      fr.readAsText(file);
    }
  }
}

function onImportChanged(e) {
  let file = e.target.files[0];
  let fr = new FileReader();
  fr.onload = () => {
    const plistData = JSON.parse(fr.result);
    console.log(plistData)
    Object.keys(plistData.frames).forEach((key) => {
      console.log(key[0], key[0].charCodeAt())
      const charData = {
        id: key[0].charCodeAt(),
        x: plistData.frames[key].frame.x,
        y: plistData.frames[key].frame.y,
        width: plistData.frames[key].frame.w,
        height: plistData.frames[key].frame.h,
        xoffset: 0,
        yoffset: 0,
        xadvance: 58,
        page: 0,
        chnl: 15,
      };
      fontData.chars.push(Object.assign({}, charData));
    });
    refreshCanvas(e, true);
    refreshForm();
  };
  fr.readAsText(file);
}

const start = () => {
  let canvas = document.createElement("canvas");
  canvas.id = "canvas";
  canvas.setAttribute("width", `${fontImg.w}px`);
  canvas.setAttribute("height", `${fontImg.h}px`);
  document.querySelector("#file").after(canvas);
  draw();
  removeImg();
  generateForm();
};

const draw = () => {
  console.log(fontData);
  let canvas = document.querySelector("#canvas");
  let ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.drawImage(fontImg.data, 0, 0, +fontImg.w, +fontImg.h);
  if (Object.keys(fontData).length > 0) {
    ctx.strokeStyle = "blue";
    fontData.chars.forEach((char) => {
      console.log(char);
      ctx.setLineDash([6]);
      ctx.strokeRect(+char.x, +char.y, +char.width, +char.height);
      ctx.setLineDash([0]);
      ctx.strokeRect(
        +char.x - +char.xoffset,
        +char.y - +char.yoffset,
        +char.width,
        +char.height
      );
      ctx.fillStyle = "red";
      ctx.fillRect(
        +char.x - +char.xoffset + +char.width / 2 - 3,
        +char.y + +char.height / 2,
        7,
        1
      );
      ctx.fillRect(
        +char.x - +char.xoffset + +char.width / 2,
        +char.y + +char.height / 2 - 3,
        1,
        7
      );
    });
  }
  ctx.stroke();
};

function removeImg() {
  document.querySelectorAll("img").forEach((el) => el.remove());
}

function generateForm() {
  const exportBtn = getExport();
  const plistJsonBtn = getPlistJson();
  const name = getName();
  const base = getBase();
  const count = getCharCount();
  const chars = getChars();
  const form = document.querySelector("form");
  form.append(base);
  form.append(count);
  chars.forEach((char) => {
    form.append(char);
  });
  form.before(exportBtn);
  exportBtn.after(plistJsonBtn);
  form.before(name);
}

function getExport() {
  const exportBtn = document.createElement("div");
  exportBtn.id = "export";
  exportBtn.className = "export";
  exportBtn.innerText = "匯出.fnt";
  exportBtn.onclick = onExport;
  exportBtn.after(name);
  return exportBtn;
}

function getPlistJson() {
  const importJsonBtn = document.createElement("div");
  importJsonBtn.id = "plistJson";
  importJsonBtn.className = "export";
  importJsonBtn.style.width = "fit-content";
  importJsonBtn.style.backgroundColor = "white";
  importJsonBtn.innerText = "匯入plist用的.json";
  importJsonBtn.onclick = onClickImportPlist;
  importJsonBtn.after(name);
  return importJsonBtn;
}

function getName() {
  const name = getField("name", fontImg.name);
  let block = document.createElement("div");
  block.className = "block";
  block.append(name);
  return block;
}

function getBase() {
  const size = getField("size", fontData.size);
  const padding = getField("padding", fontData.padding);
  const lineheight = getField("lineheight", fontData.lineheight);
  const base = getField("base", fontData.base);
  const scaleW = getField("scaleW", fontData.scaleW);
  const scaleH = getField("scaleH", fontData.scaleH);
  let block = document.createElement("div");
  block.className = "block";
  [size, padding, lineheight, base, scaleW, scaleH].forEach((el) =>
    block.append(el)
  );
  return block;
}

function getCharCount() {
  const count = getField("charCount", fontData.chars.length, true);
  let block = document.createElement("div");
  let plus = document.createElement("span");
  plus.className = "actionBtn";
  plus.innerText = "+";
  plus.onclick = onClickAdd;
  count.append(plus);
  block.className = "block";
  block.append(count);
  return block;
}

function getChars() {
  let chars = [];
  fontData.chars.forEach((char) => {
    const charEle = getChar(char);
    chars.push(charEle);
  });
  return chars;
}

function getChar(char) {
  let block = document.createElement("div");
  block.className = "block";
  block.setAttribute("data-type", "char");
  let minus = document.createElement("span");
  minus.className = "actionBtn";
  minus.innerText = "-";
  const id = getField("id", char.id, false, updateCharId);
  const x = getField("x", char.x);
  const y = getField("y", char.y);
  const width = getField("width", char.width);
  const height = getField("height", char.height);
  const xoffset = getField("xoffset", char.xoffset);
  const yoffset = getField("yoffset", char.yoffset);
  const xadvance = getField("xadvance", char.xadvance);
  const page = getField("page", char.page);
  const chnl = getField("chnl", char.chnl);
  [id, x, y, width, height, xoffset, yoffset, xadvance, page, chnl].forEach(
    (el) => block.append(el)
  );
  minus.onclick = onClickRemove;
  block.append(minus);
  return block;
}

function getField(name, value, readonly = false, onChange) {
  let field = document.createElement("span");
  let fieldText = document.createElement("span");
  let input = document.createElement("input");
  field.className = "field";
  fieldText.className = "fieldText";
  fieldText.innerText = `${name}: `;
  input.type = name === "padding" || name === "name" ? "text" : "number";
  input.readOnly = readonly;
  input.name = name;
  input.value = value;
  input.preValue = value;
  input.onchange = onChange ? onChange : refreshCanvas;
  field.append(fieldText);
  field.append(input);
  return field;
}

function updateCharId(e) {
  const input = e.target;
  const valid =
    fontData.chars.findIndex((char) => char.id === input.value) === -1;
  if (valid) {
    const updateIdx = fontData.chars.findIndex(
      (char) => char.id === input.preValue
    );
    fontData.chars[updateIdx].id = input.value;
    input.preValue = input.value;
    if ((input.name = "id")) {
      input.title = String.fromCharCode(input.value);
    }
  } else {
    input.value = input.preValue;
  }
}

function refreshCanvas(e, skip = false) {
  const input = e.target;
  if (!skip) {
    if (!input.className.includes("Btn") && !input.name.includes("name")) {
      if (!baseKey.includes(input.name)) {
        const idEle =
          e.target.parentElement.parentElement.querySelector(
            'input[name="id"]'
          );
        const updateIdx = fontData.chars.findIndex(
          (char) => +char.id === +idEle.value
        );
        fontData.chars[updateIdx][input.name] = input.value;
        input.preValue = input.value;
      }
    }
  }

  let canvas = document.querySelector("#canvas");
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, fontImg.w, fontImg.h);
  draw();
}

function refreshForm() {
  const form = document.querySelector("form");
  document.querySelectorAll('div.block[data-type="char"]').forEach(charEle => charEle.remove())
  fontData.chars.forEach((char) => {
    const charEle = getChar({ ...char });
    form.append(charEle);
  });
}

function onExport() {
  const form = document.querySelector("form");
  const name = form.name.value;
  const size = +form.size.value;
  const padding = form.padding.value;
  const lineheight = +form.lineheight.value;
  const base = +form.base.value;
  const scaleW = +form.scaleW.value;
  const scaleH = +form.scaleH.value;
  const charCount = +form.id.length;
  let result = `info face="Arial" size=${size} bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=1 aa=1 padding=${padding} spacing=1,1 outline=0
  common lineHeight=${lineheight} base=${base} scaleW=${scaleW} scaleH=${scaleH} pages=1 packed=0 alphaChnl=1 redChnl=0 greenChnl=0 blueChnl=0
  page id=0 file="${name}"\n`;
  result += `chars count=${charCount}`;
  form.id.forEach((field, index) => {
    let charResult = "";
    const id = field.value;
    const x = form.x[index].value;
    const y = form.y[index].value;
    const width = form.width[index].value;
    const height = form.height[index].value;
    const xoffset = form.xoffset[index].value;
    const yoffset = form.yoffset[index].value;
    const xadvance = form.xadvance[index].value;
    const page = form.page[index].value;
    const chnl = form.chnl[index].value;
    charResult = `char id=${id}   x=${x}   y=${y}   width=${width}    height=${height}    xoffset=${xoffset}     yoffset=${yoffset}     xadvance=${xadvance}    page=${page}  chnl=${chnl}\n`;
    result += charResult;
  });
  console.log(result);
  result = `data:text/csv;charset=utf-8,${result}`;
  const encodedUri = encodeURI(result);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${fontImg.name}.fnt`);
  document.body.appendChild(link); // Required for FF

  link.click(); // This will download the data file named "my_data.csv".
  window.open(encodedUri);
}

function onClickImportPlist() {
  const input = document.createElement("input");
  input.accept = ".json";
  input.type = "file";
  input.multiple = false;
  input.hidden = true;
  input.onchange = onImportChanged;
  input.click();
}

function onClickAdd(e) {
  const cloneData = Object.assign(
    {},
    fontData.chars[fontData.chars.length - 1]
  );
  const newId = getValidId(cloneData.id);
  cloneData.id = newId;
  fontData.chars.push(cloneData);
  const form = document.querySelector("form");
  const charEle = getChar(cloneData);
  form.append(charEle);
  refreshCanvas(e, true);
}

function onClickRemove(e) {
  const block = e.target.parentElement;
  const input = block.querySelector('input[name="id"]');
  const deleteIdx = fontData.chars.findIndex((char) => {
    return char.id === input.value;
  });
  fontData.chars.splice(deleteIdx, 1);
  const count = document.querySelector('input[name="charCount"]');
  count.value = fontData.chars.length;
  block.remove();
  refreshCanvas(e);
}

function getValidId(cloneId) {
  let newId = +cloneId + 1;
  const ids = fontData.chars.map((char) => +char.id);
  while (ids.includes(newId)) {
    newId++;
  }
  return newId;
}
