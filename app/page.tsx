'use client'

import { FC, useEffect, useState } from 'react'
import { useDraw } from '../hooks/useDraw'
import { ChromePicker, CirclePicker, HuePicker, SliderPicker } from 'react-color'
import { io } from 'socket.io-client'
import { drawLine } from '@/utils/drawLine'
import './globals.css';
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
  const { canvasRef, onMouseDown, clear } = useDraw(createLine)
  const [loading, setLoading ] = useState<boolean>(true);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')

    socket.emit('client-ready')

    socket.on("server-ready",(base64img)=>{
      const img = new Image()
      img.src = base64img
      img.onload = () => {
        ctx?.drawImage(img, 0, 0)
        setLoading(false);
      }
    })

    // socket.on('get-canvas-state', () => {
    //   if(!canvasRef.current?.toDataURL()) return
    //   socket.emit('canvas-state', canvasRef.current.toDataURL())
    // })

    // socket.on("canvas-update", (base64img) => {
    //   const img = new Image()
    //   img.src = base64img
    //   img.onload = () => {
    //     ctx?.drawImage(img, 0, 0)
    //   }
    // })

    // socket.on('canvas-state-from-server', (state: string) => {
    //   console.log("I received the state")
    //   const img = new Image()
    //   img.src = state
    //   img.onload = () => {
    //     ctx?.drawImage(img, 0, 0)
    //   }
    // })

    socket.on('draw-line', ({prevPoint, currentPoint, color}: DrawLineProps) => {
      if(!ctx) return
      drawLine({prevPoint, currentPoint, ctx, color})
    })

    socket.on('clear', clear)

    return () => {
      socket.off('get-canvas-state')
      socket.off('canvas-state-from-server')
      socket.off('draw-line')
      socket.off('clear')
    }
  },[canvasRef, loading])

  function createLine({prevPoint, currentPoint, ctx}: Draw){
    socket.emit('draw-line', ({prevPoint, currentPoint, color}))
    drawLine({prevPoint, currentPoint, ctx, color})
  }
  
  return (
    <div className='container'>
      {
        loading ?

        <div className="loading-text-container">
          <div className='loader'> Please wait</div>
        </div>
        
        :

        <><h1>The Board</h1><p><i>A whiteboard for everyone</i></p><canvas
            onMouseDown={onMouseDown}
            ref={canvasRef}
            width={750}
            height={750}
            className='canvas' /><div className="pickerContainer">
              <CirclePicker colors={["#0a0a23", "#1b1b32", "#2a2a40", "#3b3b4f", "#ffffff"]} color={color} onChange={(e) => setColor(e.hex)}></CirclePicker>
            </div></>
      }
      </div>)
}

export default Page