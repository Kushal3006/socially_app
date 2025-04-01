"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ToastProvider() {
  const { theme } = useTheme();
  
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: theme === "dark" ? "hsl(240 10% 3.9%)" : "white",
          color: theme === "dark" ? "white" : "black",
          border: theme === "dark" ? "1px solid hsl(240 3.7% 15.9%)" : "1px solid hsl(240 5.9% 90%)",
        },
      }}
    />
  );
} 