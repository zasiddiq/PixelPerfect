let canvasHeight = 80;
let canvasWidth = 150;

let undoList = [];
let redoList = [];

export const clear = (canvasRef, canvasWidth, canvasHeight) => {
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0,0, canvasWidth, canvasHeight);
  return 'draw';
};
export const save = () => {
  const canvas = document.getElementById('canvas');
  document.getElementById('saveButton').href = canvas.toDataURL();
};
export const rgbToHex = (r, g, b) => {
  if (r > 255 || g > 255 || b > 255)
    throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
};
const arrayUnique = (arr) => {
  return(arr.filter((ar, index, self) => self.findIndex(t => t.color === ar.color && t.locationx === ar.locationx && t.locationy === ar.locationy) === index))
};
const arrayUniqueFill = (arr) => {
  return(arr.filter((ar, index, self) => self.findIndex(t => t.x === ar.x && t.y === ar.y) === index))
};
export const toolHandler = (e, canvasRef, canvasWidth, canvasHeight, tool, colorSelect, size) => {
  const canvas = canvasRef.current;
  const canvasId = document.getElementById("canvas");
  const ctx = canvas.getContext('2d');
  const rect = canvasId.getBoundingClientRect();
  const location = {x: Math.floor((e.clientX - rect.left)/size), y:  Math.floor((e.clientY - rect.top)/size) };
  switch (tool) {
    case 'fill':
      if (location.x>=0 && location.x<canvasWidth  && location.y>=0 && location.y<canvasHeight) {
        if (colorSelect !== getColor(location, ctx, size)){
          floodFill(location, colorSelect, size, ctx)
        }
      }
      return {colorSelect, tool};
    case 'draw':
      undoList.push({color: getColor(location, ctx, size), locationx: location.x, locationy: location.y});

      ctx.fillStyle = colorSelect;
      ctx.fillRect(location.x*size, location.y*size, size, size);
      return {colorSelect, tool};
    case 'undo':
      if (undoList.length > 0) {
        undoList = arrayUnique(undoList);
        ctx.fillStyle = undoList[undoList.length-1].color;
        ctx.fillRect(undoList[undoList.length-1].locationx*size, undoList[undoList.length-1].locationy*size, size, size);
        redoList.push({color: undoList[undoList.length-1].color, locationx: undoList[undoList.length-1].locationx, locationy: undoList[undoList.length-1].locationy});
        undoList.pop();
        ctx.fillStyle = undoList[undoList.length-1].color;
        ctx.fillRect(undoList[undoList.length-1].locationx*size, undoList[undoList.length-1].locationy*size, size, size);
        redoList.push({color: undoList[undoList.length-1].color, locationx: undoList[undoList.length-1].locationx, locationy: undoList[undoList.length-1].locationy});
        undoList.pop();
      }
      tool='draw';
      return {colorSelect, tool};
    case 'redo':
      if (redoList.length > 0) {
        redoList = arrayUnique(redoList);
        ctx.fillStyle = redoList[redoList.length-1].color;
        ctx.fillRect(redoList[redoList.length-1].locationx*size, redoList[redoList.length-1].locationy*size, size, size);
        redoList.pop();
        ctx.fillStyle = redoList[redoList.length-1].color;
        ctx.fillRect(redoList[redoList.length-1].locationx*size, redoList[redoList.length-1].locationy*size, size, size);
        redoList.pop();
      }
      tool='draw';
      return {colorSelect, tool};
    case 'erase':
      ctx.clearRect(location.x*size, location.y*size, size, size);
      return {colorSelect, tool};
    case 'picker':
      colorSelect=getColor(location, ctx, size);
      tool='draw';
      return {colorSelect, tool};
    default:
      ctx.clearRect(0,0, canvasWidth, canvasHeight);
      return {colorSelect, tool};
  }
};
const getColor = (location, ctx, size) => {
  const p = ctx.getImageData(location.x*size, location.y*size, 1, 1).data;
  return "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
};

const floodFill = (location, colorSelect, size, ctx) => {
  let q = [];
  q.push(location);
  q.push(location);q.push(location);q.push(location);
  while (q.length>0) {
    q = arrayUniqueFill(q);
    const loc = q.shift();
    const initcolor = getColor(loc, ctx, size);
    ctx.fillStyle = colorSelect;
    ctx.fillRect(loc.x*size, loc.y*size, size, size);

    const leftLocation = {x: loc.x-1, y:loc.y};
    const leftColor = getColor(leftLocation, ctx, size);
    const rightLocation = {x: loc.x+1, y: loc.y};
    const rightColor = getColor(rightLocation, ctx, size);
    const upLocation = {x: loc.x, y: loc.y-1};
    const upColor = getColor(upLocation, ctx, size);
    const downLocation = {x: loc.x, y: loc.y+1};
    const downColor = getColor(downLocation, ctx, size);

    if (leftLocation.x >= 0 && leftColor===initcolor) {
      q.push(leftLocation);
    }
    if (rightLocation.x < (canvasWidth) && !(location.x===canvasWidth) && rightColor===initcolor) {
      q.push(rightLocation);
    }
    if (upLocation.y >= 0 && upColor===initcolor) {
      q.push(upLocation);
    }
    if(downLocation.y < (canvasHeight) && !(location.y===canvasHeight) && downColor===initcolor) {
      q.push(downLocation);
    }
  }
};
