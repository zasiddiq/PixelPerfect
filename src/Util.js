let undoList = []
let redoList = []

export const clear = (params) => {
  params.ctx.clearRect(0, 0, params.canvasWidth, params.canvasHeight)
  return 'draw'
}
export const setPixelSize = (params, newSize) => {
  const temp_canvas = document.createElement('canvas')
  const temp_ctx = temp_canvas.getContext('2d')
  temp_canvas.width = params.width*newSize
  temp_canvas.height = params.height*newSize
  params.size = newSize
  temp_ctx.drawImage(params.canvas,0,0,params.width*newSize,params.height*newSize)
  params.canvas.width = params.width*newSize
  params.canvas.height = params.height*newSize
  params.ctx.drawImage(temp_canvas, 0, 0)

}

export const save = (canvas, arg) => {
  console.log(arg)
  const link = document.getElementById('saveButton')
  canvas.toBlob(function(blob){
    link.href = URL.createObjectURL(blob);
    console.log(blob);
    console.log(link.href); // this line should be here
    // const newImg = document.createElement('img'), url = URL.createObjectURL(blob);
    // newImg.style.padding = '.5em'
    // newImg.onload = function() {
    //   // no longer need to read the blob so it's revoked
    //   URL.revokeObjectURL(url);
    // };
    // newImg.src = url;
    // newImg.width = (16*35)
    // newImg.height = (16*35)
    // const createA = document.createElement('a');
    // const createAText = document.createTextNode('Download');
    // createA.setAttribute('download','test-image')
    // createA.setAttribute('href','#')
    // createA.setAttribute('onClick',()=> {console.log('hi')})
    // createA.appendChild(createAText);
    // document.body.appendChild(newImg);
    // document.body.appendChild(createA);

  },'image/png');
}

export const rgbToHex = (r, g, b) => {
  if (r > 255 || g > 255 || b > 255) { throw 'Invalid color component' }
  return ((r << 16) | (g << 8) | b).toString(16)
}
const arrayUniqueFill = (arr) => {
  return (arr.filter((ar, index, self) => self.findIndex(t => t.x === ar.x && t.y === ar.y) === index))
}
export const toolHandler = (e, params, tool, colorSelect) => {
  const location = { x: Math.floor((e.pageX - (window.pageXOffset + params.canvas.getBoundingClientRect().left)) / params.size), y: Math.floor((e.pageY - (window.pageYOffset + params.canvas.getBoundingClientRect().top)) / params.size) }
  switch (tool) {
    case 'fill':
      if (location.x >= 0 && location.x < params.canvasWidth && location.y >= 0 && location.y < params.canvasHeight) {
        if (colorSelect !== getColor(location, params)) {
          undoList.push({ color: getColor(location, params), prevColor: colorSelect, location, alpha: getAlpha(location, params), fill: true})
          floodFill(location, colorSelect, params, params.canvasWidth/params.size, params.canvasHeight/params.size)
        }
      }
      return { colorSelect, tool }
    case 'draw':
      undoList.push({ color: getColor(location, params), prevColor: colorSelect, location, alpha: getAlpha(location, params)})

      params.ctx.fillStyle = colorSelect
      params.ctx.fillRect(location.x * params.size, location.y * params.size, params.size, params.size)
      return { colorSelect, tool }
    case 'undo':
      if (undoList.length > 0) {
        if (undoList[undoList.length-1].fill) {
          if (undoList[undoList.length-1].alpha) {
            floodFill(undoList[undoList.length - 1].location, undoList[undoList.length - 1].color, params, params.canvasWidth / params.size, params.canvasHeight / params.size)
          } else {
            floodFill(undoList[undoList.length - 1].location, "alpha", params, params.canvasWidth / params.size, params.canvasHeight / params.size)
          }
          undoList.pop()
          tool = 'draw'
          return { colorSelect, tool }
        }
        else if (undoList[undoList.length-1].alpha) {
          params.ctx.fillStyle = undoList[undoList.length - 1].color
          params.ctx.fillRect(undoList[undoList.length - 1].location.x * params.size, undoList[undoList.length - 1].location.y * params.size, params.size, params.size)
          redoList.push({color: undoList[undoList.length-1].prevColor, location: undoList[undoList.length-1].location, alpha: undoList[undoList.length-1].alpha});
        } else {
          params.ctx.clearRect(undoList[undoList.length - 1].location.x * params.size, undoList[undoList.length - 1].location.y * params.size, params.size, params.size)
          redoList.push({color: undoList[undoList.length-1].prevColor, location: undoList[undoList.length-1].location, alpha: 0});
        }
        undoList.pop()
      }
      tool = 'draw'
      return { colorSelect, tool }
    case 'redo':
      if (redoList.length > 0) {
        params.ctx.fillStyle = redoList[redoList.length - 1].color;
        params.ctx.fillRect(redoList[redoList.length - 1].location.x * params.size, redoList[redoList.length - 1].location.y * params.size, params.size, params.size);
        redoList.pop();
      }
      tool = 'draw'
      return { colorSelect, tool }
    case 'mirror':
      let mirX = (params.canvasWidth/params.size) - location.x -1
      undoList.push({ color: getColor(location, params), prevColor: colorSelect, location })
      undoList.push({ color: getColor(location, params), prevColor: colorSelect, location: {x: mirX, y: location.y} })
      params.ctx.fillStyle = colorSelect
      params.ctx.fillRect(location.x * params.size, location.y * params.size, params.size, params.size)
      params.ctx.fillRect(mirX * params.size, location.y * params.size, params.size, params.size)

      return { colorSelect, tool }
    case 'erase':
      const alpha = getAlpha(location, params)
      if (alpha) {
        undoList.push({ color: getColor(location, params), prevColor: colorSelect, location, alpha})
        params.ctx.clearRect(location.x * params.size, location.y * params.size, params.size, params.size)
      }
      return { colorSelect, tool }
    case 'picker':
      colorSelect = getAlpha(location, params)
      tool = 'draw'
      return { colorSelect, tool }
    default:
      params.ctx.clearRect(0, 0, params.canvasWidth, params.canvasHeight)
      return { colorSelect, tool }
  }
}
export const getColor = (location, params) => {
  const p = params.ctx.getImageData(location.x * params.size, location.y * params.size, 1, 1).data
  return '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6)
};

export const getAlpha = (location, params) => {
  return params.ctx.getImageData(location.x * params.size, location.y * params.size, 1, 1).data[3];
};

const floodFill = (location, colorSelect, params, canvasWidth, canvasHeight) => {
  let q = []
  q.push(location)
  q.push(location); q.push(location); q.push(location)
  while (q.length > 0) {
    q = arrayUniqueFill(q)
    const loc = q.shift()
    const initcolor = getColor(loc, params)
    if (colorSelect === "alpha") {
      params.ctx.clearRect(loc.x * params.size, loc.y * params.size, params.size, params.size)
    } else {
      params.ctx.fillStyle = colorSelect
      params.ctx.fillRect(loc.x * params.size, loc.y * params.size, params.size, params.size)
    }


    const leftLocation = { x: loc.x - 1, y: loc.y }
    const leftColor = getColor(leftLocation, params)
    const rightLocation = { x: loc.x + 1, y: loc.y }
    const rightColor = getColor(rightLocation, params)
    const upLocation = { x: loc.x, y: loc.y - 1 }
    const upColor = getColor(upLocation, params)
    const downLocation = { x: loc.x, y: loc.y + 1 }
    const downColor = getColor(downLocation, params)

    if (leftLocation.x >= 0 && leftColor === initcolor) {
      q.push(leftLocation)
    }
    if (rightLocation.x < (canvasWidth) && !(location.x === canvasWidth) && rightColor === initcolor) {
      q.push(rightLocation)
    }
    if (upLocation.y >= 0 && upColor === initcolor) {
      q.push(upLocation)
    }
    if (downLocation.y < (canvasHeight) && !(location.y === canvasHeight) && downColor === initcolor) {
      q.push(downLocation)
    }
  }
}
