'use client'

import { FC, useEffect, useRef, useState } from 'react'
import { useDraw } from '../hooks/useDraw'
import { ChromePicker, CirclePicker, HuePicker, SliderPicker } from 'react-color'
import { io } from 'socket.io-client'
import { drawLine } from '@/utils/drawLine'
import './globals.css';
import useWindowDimensions from '../hooks/useWindowDimensions';
import rgbHex from "rgb-hex";

// const socket = io('https://theboardserver-1.onrender.com')
// const socket = io('http://localhost:3001/')
// const socket = io('https://the-board-server.vercel.app:3001')
const socket = io('creepy-latia-ryanorg-4db01151.koyeb.app/')


interface pageProps {}

type DrawLineProps = {
  prevPoint: Point | null
  currentPoint: Point
  color: string
}

const Page: FC<pageProps> = ({}) => {
  const [color, setColor] = useState<string>("#0a0a23")
  const { controllerCanvasRef, onMouseDown, onTouchDown, clear } = useDraw(createLine)
  const [canvasImgBase64, setCanvasImgBase64] = useState<string>('');
  const [ canvasClassName, setCanvasClassName ] = useState<string>('canvasController');
  const [ screenBigEnough, setScreenBigEnough ] = useState<boolean>(false);
  const { width, height } = useWindowDimensions();
  const viewCanvasRef = useRef<HTMLCanvasElement>(null);
  const queue = useRef(new Array())
  // var queue: { prevPoint: Point | null; currentPoint: Point; color: string }[];

  useEffect(() => {
    if( width == undefined || height == undefined ){
      setScreenBigEnough(false);
    } else {
      setScreenBigEnough(width > 480);
    }


    const ctx = viewCanvasRef.current?.getContext('2d');
    

    const onBeforeUnload = (ev: { returnValue: string }) => {
      
      // var base64Image = controllerCanvasRef.current?.toDataURL();
      socket.emit('draw-line', JSON.stringify(queue.current));
      console.log(queue.current);
      ev.returnValue = 'aad';
      return null;
    };

    window.addEventListener("beforeunload", onBeforeUnload);

    const img = new Image();
    img.src = canvasImgBase64;
    img.onload = () => {
      ctx?.drawImage(img, 0, 0)
    }

    socket.emit('client-ready')

    socket.on("server-ready",(base64img)=>{
      setCanvasImgBase64(base64img);
    })

    socket.on('clear', clear)

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      socket.off('get-canvas-state')
      socket.off('canvas-state-from-server')
      socket.off('draw-line')
      socket.off('clear')
    }
  },[controllerCanvasRef, canvasImgBase64,screenBigEnough])

  function createLine({prevPoint, currentPoint, ctx : ct}: Draw){
    drawLine({prevPoint, currentPoint, ctx: ct, color})
    queue.current.push({prevPoint, currentPoint, color})
  }

  function mouseDown(){
    setCanvasClassName('canvasController downDrawingCursor');
    onMouseDown()
  }

  function onMouseUp(){
    setCanvasClassName('canvasController')
  }

  // function sendImageToServer(ctx: any){
  //   var base64Image = ctx.canvas.toDataURL();
  //   socket.emit('draw-line', base64Image);
  // }

  function getWindowDimensions(){
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height
    };
  }
  
  return (
    <div className='container'>
      {
        
        canvasImgBase64 == '' || width == undefined || height == undefined ?

          <div className="loading-text-container">
            <div className='loader'> Please wait</div>
            {/* <h2>Experiencing high volume of requests. Please check back later.</h2> */}
          </div>
          :
          screenBigEnough?
            <>
            <h1>The Board</h1>
            <p></p>
            <div id="wrapper">
              <canvas
                  onMouseDown={mouseDown}
                  onMouseUp={onMouseUp}
                  onTouchStart={onTouchDown}
                  ref={controllerCanvasRef}
                  width={900}
                  height={750}
                  className={canvasClassName} />
              <canvas
                    ref={viewCanvasRef}
                    width={900}
                    height={750}
                    className={"canvasView"} />
            </div>
            <div className="pickerContainer">
                <CirclePicker colors={["#0a0a23", "#1b1b32", "#2a2a40", "#3b3b4f", "#ffffff"]} color={color} onChange={(e) => setColor(e.hex)}></CirclePicker>
                {/* <ChromePicker color={color} onChange={(e) => setColor(e.hex)}></ChromePicker> */}
            </div></>
          :
          <h2>Please use a bigger window.</h2>
      }
      </div>)
}

export default Page
