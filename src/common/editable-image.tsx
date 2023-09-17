import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./button";
import { ArrowClockwiseIcon, ArrowCounterclockwiseIcon } from "./icons";
import { BasePhoto } from "../types";
import { useObjectURL } from "../util/object-url";
import exp from "constants";

interface EditableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    image: BasePhoto,
}

export function EditableImage({
    image,
    ...props
}: EditableImageProps) {
  const [ expanded, setExpanded ] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded(expanded => !expanded), []);

  const src = useObjectURL(image.blob);
  const img = useRef<HTMLImageElement>(null);

  return (
    <>
      <img ref={img} {...props} src={src} onClick={toggleExpanded} />
      {expanded && <EditOverlay img={img.current!} onClose={toggleExpanded} />}
    </>
  )
}

interface EditOverlayProps {
  img: HTMLImageElement,
  onClose: () => void,
}

function EditOverlay({
   img,
   onClose,
}: EditOverlayProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ rotateDegrees, setRotateDegrees ] = useState(0);

  useEffect(() => {
    if (canvas.current != null) {
      console.log("rot", rotateDegrees);
      canvas.current.width = img.naturalWidth;
      canvas.current.height = img.naturalHeight;
      const ctx = canvas.current.getContext("2d")!;
      ctx.translate(img.naturalWidth / 2, img.naturalHeight / 2);
      ctx.rotate(rotateDegrees * Math.PI / 180);
      ctx.drawImage(img, 0, 0);
    }
  }, [img, rotateDegrees]);

  const rotateClockwise = useCallback(() => {
    setRotateDegrees(value => (value + 90) % 360);
  }, []);
  const rotateCounterClockwise = useCallback(() => {
    setRotateDegrees(value => (value - 90) % 360);
  }, []);

  return (
    <>
      <canvas ref={canvas} className="fixed inset-0 w-screen h-screen object-contain bg-black" onClick={onClose} />
      <div className="fixed left-0 bottom-0 w-full">
        <div className="m-4 mb-10 p-2 grid grid-flow-col auto-cols-1fr gap-2">
          <Button variant="translucent" onClick={rotateClockwise}><ArrowClockwiseIcon /></Button>
          <Button variant="translucent" onClick={rotateCounterClockwise}><ArrowCounterclockwiseIcon /></Button>
        </div>
      </div>
    </>
  );
}