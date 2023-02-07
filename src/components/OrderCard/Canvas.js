import React, { useRef, useEffect } from 'react'

export default function Canvas ({
    pixel_data = [],
    width,
    height,
    onBarcode,
    ...rest
}) {
    const canvasRef = useRef(null)
    const draw = (ctx) => {
        ctx.clearRect(0, 0, width + 8, height + 8)
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width + 8, height + 8)        
        
        if (pixel_data.length > 0) {
            let mImgData = ctx.createImageData(width, height)
            let index = 0
            for (index = 0; index < pixel_data.length; index++){
                mImgData.data[index] = pixel_data[index]
            }
            ctx.putImageData(mImgData, 4, 4) //, 0, 0, width, height
            console.log("Image data  :", mImgData);
        } 
    }

    useEffect(() => {
        if(canvasRef.current){
            const canvas = canvasRef.current
            canvas.width = width + 8
            canvas.height = height + 8
            const context = canvas.getContext('2d')
            draw(context)
            let barcode = canvas.toDataURL("image/jpeg");            
            onBarcode(barcode)
        }
    
    }, [pixel_data, canvasRef])

    return <canvas ref={canvasRef} {...rest}/>
}