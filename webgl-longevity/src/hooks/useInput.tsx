import { useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Vector2 } from "three";

/**
 * Keep track of input position (mouse/touch) in relation to THREE.js canvas
 *
 * @returns THREE.Vector2
 */
export function useInput() {
  const { gl } = useThree();
  const NDCMousePos = useRef(new Vector2());

  const [down, setDown] = useState(false); // is mouse button down or touch pressed?

  // store canvas offset from top of screen
  const canvasOffsetY = useRef<number>(0);
  useLayoutEffect(() => {
    canvasOffsetY.current = gl.domElement.getBoundingClientRect().top;
  }, [gl]);

  const setMousePos = (e: MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY - canvasOffsetY.current;

    NDCMousePos.current.x = (x / gl.domElement.width) * 2 - 1;
    NDCMousePos.current.y = (1 - y / gl.domElement.height) * 2 - 1;
  };

  const setTouchPos = (e: TouchEvent) => {
    if (e.type === "touchstart") {
      setDown(true);
    }

    if (e.type === "touchend") {
      setDown(false);
    }

    if (
      typeof e.touches[0] === "undefined" &&
      typeof e.changedTouches[0] === "undefined"
    ) {
      return;
    } else {
      const touch = e.touches[0] || e.changedTouches[0];

      const x = touch.clientX;
      const y = touch.clientY - canvasOffsetY.current;

      NDCMousePos.current.x = (x / gl.domElement.width) * 2 - 1;
      NDCMousePos.current.y = (1 - y / gl.domElement.height) * 2 - 1;
    }
  };

  const setMouseDown = () => {
    setDown(true);
  };

  const setMouseUp = () => {
    setDown(false);
  };

  // constructor
  useEffect(() => {
    document.addEventListener("mousemove", setMousePos, false);
    document.addEventListener("mousedown", setMouseDown, false);
    document.addEventListener("mouseup", setMouseUp, false);

    document.addEventListener("touchmove", setTouchPos, false);
    document.addEventListener("touchstart", setTouchPos, false);
    document.addEventListener("touchend", setTouchPos, false);
    document.addEventListener("touchcancel", setTouchPos, false);

    // clean up
    return () => {
      document.removeEventListener("mousemove", setMousePos);
      document.removeEventListener("mousedown", setMouseDown, false);
      document.removeEventListener("mouseup", setMouseUp, false);

      document.removeEventListener("touchmove", setTouchPos);
      document.removeEventListener("touchstart", setTouchPos);
      document.removeEventListener("touchend", setTouchPos);
      document.removeEventListener("touchcancel", setTouchPos);
    };
  }, []);

  return {
    pos: NDCMousePos.current,
    down: down
  };
}
