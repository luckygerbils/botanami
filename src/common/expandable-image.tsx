import React, { useCallback, useState } from "react";
import { BasePhoto } from "../types";
import { useObjectURL } from "../util/object-url";

interface ExpandableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  photo: BasePhoto,
}

export function ExpandableImage({
  photo,
  className: providedClassName,
  ...props
}: ExpandableImageProps) {
  const [ expanded, setExpanded ] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded(expanded => !expanded), []);
  const className = expanded
    ? "fixed inset-0 w-screen h-screen object-contain w-full h-full bg-black" 
    : providedClassName;

  const src = useObjectURL(photo.blob);

  return (
    <img src={src} className={className} {...props} onClick={toggleExpanded} />
  );
}