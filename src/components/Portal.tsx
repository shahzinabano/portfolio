"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** renders children at the end of <body> so overlays escape section stacking contexts */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount flag
  useEffect(() => setMounted(true), []);
  return mounted ? createPortal(children, document.body) : null;
}
