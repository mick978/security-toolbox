"use client";
import { useEffect, useState } from "react";

// 极简 toast，避免 radix ui 依赖
type ToastItem = { id: number; msg: string };
let listeners: ((t: ToastItem) => void)[] = [];
let idCounter = 0;

export function toast(msg: string) {
  const t = { id: ++idCounter, msg };
  listeners.forEach((l) => l(t));
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    const push = (t: ToastItem) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 2200);
    };
    listeners.push(push);
    return () => {
      listeners = listeners.filter((l) => l !== push);
    };
  }, []);
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
      {items.map((i) => (
        <div
          key={i.id}
          className="rounded-md border border-border bg-popover text-popover-foreground shadow-lg px-4 py-2 text-sm animate-in fade-in slide-in-from-bottom-2"
        >
          {i.msg}
        </div>
      ))}
    </div>
  );
}
