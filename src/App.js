import React from 'react'
import { GithubPicker } from 'react-color'
import './app.css'
import { Button, Navbar } from 'react-bootstrap'

import { toolHandler, save, clear, getColor } from './Util'

const size = 25
const width = 16
const height = 16
const canvasWidth = size * width
const canvasHeight = size * height


const colors = ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#e53935', '#d32f2f', '#c62828', '#b71c1c',
  '#fce4ec', '#f8bbd0', '#f48fb1', '#f06292', '#ec407a', '#e91e63', '#d81b60', '#c2185b', '#ad1457', '#880e4f',
  '#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2', '#6a1b9a', '#4a148c',
  '#ede7f6', '#d1c4e9', '#b39ddb', '#9575cd', '#7e57c2', '#673ab7', '#5e35b1', '#512da8', '#4527a0', '#311b92',
  '#e8eaf6', '#c5cae9', '#9fa8da', '#7986cb', '#5c6bc0', '#3f51b5', '#3949ab', '#303f9f', '#283593', '#1a237e',
  '#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2', '#1565c0', '#0d47a1',
  '#e1f5fe', '#b3e5fc', '#81d4fa', '#4fc3f7', '#29b6f6', '#03a9f4', '#039be5', '#0288d1', '#0277bd', '#01579b',
  '#e0f7fa', '#b2ebf2', '#80deea', '#4dd0e1', '#26c6da', '#00bcd4', '#00acc1', '#0097a7', '#00838f', '#006064',
  '#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#009688', '#00897b', '#00796b', '#00695c', '#004d40',
  '#e8f5e9', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#43a047', '#388e3c', '#2e7d32', '#1b5e20',
  '#f1f8e9', '#dcedc8', '#c5e1a5', '#aed581', '#9ccc65', '#8bc34a', '#7cb342', '#689f38', '#558b2f', '#33691e',
  '#f9fbe7', '#f0f4c3', '#e6ee9c', '#dce775', '#d4e157', '#cddc39', '#c0ca33', '#afb42b', '#9e9d24', '#827717',
  '#fffde7', '#fff9c4', '#fff59d', '#fff176', '#ffee58', '#ffeb3b', '#fdd835', '#fbc02d', '#f9a825', '#f57f17',
  '#fff8e1', '#ffecb3', '#ffe082', '#ffd54f', '#ffca28', '#ffc107', '#ffb300', '#ffa000', '#ff8f00', '#ff6f00',
  '#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#ff9800', '#fb8c00', '#f57c00', '#ef6c00', '#e65100',
  '#fbe9e7', '#ffccbc', '#ffab91', '#ff8a65', '#ff7043', '#ff5722', '#f4511e', '#e64a19', '#d84315', '#bf360c',
  '#efebe9', '#d7ccc8', '#bcaaa4', '#a1887f', '#8d6e63', '#795548', '#6d4c41', '#5d4037', '#4e342e', '#3e2723',
  '#fafafa', '#f5f5f5', '#eeeeee', '#e0e0e0', '#bdbdbd', '#9e9e9e', '#757575', '#616161', '#424242', '#212121',
  '#eceff1', '#cfd8dc', '#b0bec5', '#90a4ae', '#78909c', '#607d8b', '#546e7a', '#455a64', '#37474f', '#263238',
  '#ffffff', '#000000']

const App = () => {
  // Get a regular interval for drawing to the screen
  window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimaitonFrame ||
      function (callback) {
        window.setTimeout(callback, 1000/60);
      };
  })();
  let lastLoc = {}
  let grid = false
  let canvas
  let ctx
  let rect
  let gridCanvas
  let gridctx
  let params = {}

  let colorSelect = '#ff0000'
  let tool = 'draw'
  let isDrawing = false

  document.addEventListener("DOMContentLoaded", () => {
    // console.log('started')
    canvas = document.getElementById('canvas')
    ctx = canvas.getContext('2d')
    rect = canvas.getBoundingClientRect()
    gridCanvas = document.getElementById('gridcanvas')
    gridctx = gridCanvas.getContext('2d')
    params = {canvas, ctx, rect, canvasWidth, canvasHeight, size}
    // console.log(params)

    document.getElementById('testTouch').addEventListener("touchstart", () => {
      alert('This is a touch event')
    }, false);

    canvas.addEventListener("touchstart", touchStart, false);
    canvas.addEventListener("touchend", touchEnd, false);
    canvas.addEventListener("touchcancel", touchEnd, false);
    canvas.addEventListener("touchmove", touchMove, false);

    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);
    canvas.addEventListener("mouseleave", mouseUp, false);
  });
  // Set up touch events for mobile, etc
  const touchStart = (e) => {
    const touch = e.touches[0];
    // console.log(e.touches[0])
    const location = { x: Math.floor((touch.clientX - rect.left) / size), y: Math.floor((touch.clientY - rect.top) / size) }
    const col = getColor(location, params)
    // console.log('touch start',location, ctx)
    isDrawing = true
    if (!(col===colorSelect) || tool==='erase') {
      lastLoc = location
      const vals = toolHandler(touch, params, tool, colorSelect)
      colorSelect = vals.colorSelect
      tool = vals.tool
    }
  }

  const touchEnd = (e) => {
    // console.log('touch end')
    e.preventDefault()
    isDrawing = false
  };

  const touchMove = (e) => {
    if (isDrawing) {
      const touch = e.touches[0];
      const location = { x: Math.floor((touch.clientX - rect.left) / size), y: Math.floor((touch.clientY - rect.top) / size) }
      const col = getColor(location, params)
      // console.log('touch move',location, ctx)
      if (!(col===colorSelect) || tool==='erase') {
        if (!(lastLoc.x === location.x && lastLoc.y === location.y) || tool==='erase') {
          lastLoc = location
          const vals = toolHandler(touch, params, tool, colorSelect)
          colorSelect = vals.colorSelect
          tool = vals.tool
        }
      }
    }
  }

  const mouseDown = (e) => {
    const location = { x: Math.floor((e.clientX - rect.left) / size), y: Math.floor((e.clientY - rect.top) / size) }
    const col = getColor(location, params)
    isDrawing = true
    // console.log('mouse',location, ctx, e)
    if (!(col===colorSelect) || tool==='erase') {
      lastLoc = location
      const vals = toolHandler(e, params, tool, colorSelect)
      colorSelect = vals.colorSelect
      tool = vals.tool
    }
  }
  const mouseUp = (e) => {
    isDrawing = false
  }
  const mouseMove = (e) => {
    if (isDrawing) {
      const location = { x: Math.floor((e.clientX - rect.left) / size), y: Math.floor((e.clientY - rect.top) / size) }
      const col = getColor(location, params)
      if (!(col===colorSelect) || tool==='erase') {
        if (!(lastLoc.x === location.x && lastLoc.y === location.y) || tool==='erase') {
          lastLoc = location
          const vals = toolHandler(e, params, tool, colorSelect)
          colorSelect = vals.colorSelect
          tool = vals.tool
        }
      }
    }
  }
  const undoButton = (e) => {
    tool = 'undo'
    const vals = toolHandler(e, params, tool, colorSelect)
    colorSelect = vals.colorSelect
    tool = vals.tool
  }
  const redoButton = (e) => {
    tool = 'redo'
    const vals = toolHandler(e, params, tool, colorSelect)
    colorSelect = vals.colorSelect
    tool = vals.tool
  }

  const toggleGrid = () => {
    gridctx.clearRect(0, 0, canvasWidth, canvasHeight)
    if (!grid) {
      grid = true
      for (let x = 0; x <= width; x++) {
        gridctx.beginPath()
        gridctx.moveTo(x * (size), 0)
        gridctx.lineTo(x * (size), canvasHeight)
        gridctx.strokeStyle = '#000000'
        gridctx.stroke()
      }
      for (let y = 0; y <= height; y++) {
        gridctx.beginPath()
        gridctx.moveTo(0, y * (size))
        gridctx.lineTo(canvasWidth, y * (size))
        ctx.strokeStyle = '#000000'
        gridctx.stroke()
      }
    } else {
      grid = false
    }
  }

  return (
    <div>
      <Navbar bg='light' expand='lg'>
        <Navbar.Brand href='#home'>Pixel Perfect by MemeLords</Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
      </Navbar>
      <div className='row'>
        <div className='leftcolumn'>
          <div className='card'>
            <GithubPicker
              color={colorSelect}
              width={275}
              colors={colors}
              triangle='hide'
              onChangeComplete={color => { colorSelect = color.hex }}
            />
          </div>
          <div className='card'>
            <span>
              <Button variant='primary' className='padding' onClick={() => { tool = 'draw' }}>Draw</Button>
              <Button variant='danger' className='padding' onClick={() => { tool = 'erase' }}>Erase</Button>
              <Button variant='primary' className='padding' onClick={() => { tool = 'fill' }}>Fill</Button>
              <Button variant='primary' className='padding' onClick={() => { tool = 'picker' }}>Picker</Button>
            </span>
            <span>
              <Button variant='warning' className='padding' onClick={(e) => { undoButton(e) }}>Undo</Button>
              <Button variant='success' className='padding' onClick={(e) => { redoButton(e) }}>Redo</Button>
              <a id='saveButton' download='my-image'><Button variant='info' className='padding' onClick={() => { save() }}>Save Image</Button></a>
            </span>
            <Button variant='primary' className='padding' onClick={() => { tool = 'mirror' }}>Mirror</Button>
            <Button variant='primary' id="testTouch" className='padding' onClick={() => {}}>Test Touch</Button>
          </div>
        </div>
        <div className='rightcolumn'>
          <div className='card'>
            <canvas
              width={canvasWidth}
              height={canvasHeight}
              id='gridcanvas'
            />
            <canvas
              width={canvasWidth}
              height={canvasHeight}
              className='app'
              id='canvas'
              style={{ cursor: 'crosshair' }}
            />

          </div>
          <div className='card'>
            <span>
              <Button variant='info' className='padding' onClick={() => { toggleGrid() }}>Toggle Grid</Button>
              <span className='clear'>
                <Button variant='danger' className='padding' onClick={() => { tool = clear(params) }}>Clear</Button>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
