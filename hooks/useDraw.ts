import { useEffect, useRef, useState } from "react"

export const useDraw = (onDraw: ({ctx, currentPoint, prevPoint}: Draw) => void) => {
    const [mouseDown, setMouseDown] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const prevPoint = useRef<null | Point>(null)

    // <===== touch handling =====>
    const [touchDown, setTouchDown] = useState(false)

    const onTouchDown = () => {
        setTouchDown(true);
    }
    // <===== End =====>

    const onMouseDown = () => { 
        setMouseDown(true);
        
     }
    
    const clear = () => {
        const canvas = canvasRef.current
        if(!canvas) return

        const ctx = canvas.getContext('2d')
        if(!ctx) return
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    useEffect(() => {
        const handler = (e:MouseEvent) => {
            if(!mouseDown) return
            const currentPoint = computePointInCanvas(e)

            const ctx = canvasRef.current?.getContext('2d')
            if(!ctx || !currentPoint) return

            onDraw({ctx, currentPoint, prevPoint: prevPoint.current})
            prevPoint.current = currentPoint
        }

        const computePointInCanvas = (e: MouseEvent) => {
            const canvas = canvasRef.current
            if(!canvas) return
            const rect = canvas.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            return {x, y}
        }

        const mouseUpHandler = () => {
            setMouseDown(false)
            prevPoint.current = null
        }

        canvasRef.current?.addEventListener('mousemove', handler)
        window.addEventListener('mouseup', mouseUpHandler)

        // <===== touch handling =====>

        const touchHandler = (e:TouchEvent) => {
            if(!touchDown) return
            const currentPoint = computeTouchInCanvas(e)

            const ctx = canvasRef.current?.getContext('2d')
            if(!ctx || !currentPoint) return

            onDraw({ctx, currentPoint, prevPoint: prevPoint.current})
            prevPoint.current = currentPoint
        }

        const computeTouchInCanvas = (e: TouchEvent) => {
            const canvas = canvasRef.current
            if(!canvas) return
            const rect = canvas.getBoundingClientRect()
            let touch = e.touches[0]
            const x = touch.clientX - rect.left
            const y = touch.clientY - rect.top
            return {x, y}
        }

        const touchUpHandler = () => {
            setTouchDown(false)
            prevPoint.current = null;
        }


        canvasRef.current?.addEventListener('touchmove', touchHandler)
        window.addEventListener('touchend', touchUpHandler)

        // <===== End =====>

        return () => {
            // <===== Touch Handling =====>
            canvasRef.current?.removeEventListener('touchmove', touchHandler)
            window.removeEventListener('touchend', touchUpHandler)
            // <===== End =====>

            canvasRef.current?.removeEventListener('mousemove', handler)
            window.removeEventListener('mouseup', mouseUpHandler)
        }
    }, [onDraw])

    return { canvasRef, onMouseDown, onTouchDown, clear }
}