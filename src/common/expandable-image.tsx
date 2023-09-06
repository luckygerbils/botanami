import React, { useCallback, useState } from "react";

interface ExpandableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
}

export function ExpandableImage({
    className: providedClassName,
    ...props
}: ExpandableImageProps) {
  const [ expanded, setExpanded ] = useState(false);
  const toggleExpanded = useCallback(() => setExpanded(expanded => !expanded), []);
  const className = expanded
    ? "fixed inset-0 w-screen h-screen object-contain w-full h-full bg-black" 
    : providedClassName;

  return (
    <img className={className} {...props} onClick={toggleExpanded} />
  );
}