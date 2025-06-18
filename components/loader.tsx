"use client"

import { cn } from "@/lib/utils"

interface LoaderProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function Loader({ size = "md", text, className }: LoaderProps) {
  const sizeClasses = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-5xl",
  }

  const containerClasses = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={cn("relative flex items-center justify-center", containerClasses[size])}>
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, #ffd700 90deg, #ffffff 180deg, #ffd700 270deg, transparent 360deg)",
              padding: "3px",
              filter: "blur(1px)",
            }}
          >
            <div className="w-full h-full rounded-full bg-black" />
          </div>

          {/* Inner pulsing ring */}
          <div
            className="absolute inset-2 rounded-full animate-pulse"
            style={{
              background: "linear-gradient(45deg, rgba(255, 215, 0, 0.3), rgba(255, 255, 255, 0.3))",
              filter: "blur(2px)",
            }}
          />

          {/* CNQR Logo in center */}
          <div
            className={cn(
              "font-black bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent z-10 relative",
              sizeClasses[size],
            )}
            style={{
              textShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
              animation: "sigma-glow 2s ease-in-out infinite",
            }}
          >
            CNQR
          </div>
        </div>
      </div>

      {text && (
        <div className="mt-6 text-center">
          <p className="text-gray-200 font-bold text-base mb-3 tracking-wide">{text}</p>
          <div className="flex justify-center space-x-2">
            <div
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "0ms", boxShadow: "0 0 10px rgba(255, 215, 0, 0.5)" }}
            />
            <div
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "150ms", boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)" }}
            />
            <div
              className="w-3 h-3 bg-primary rounded-full animate-bounce"
              style={{ animationDelay: "300ms", boxShadow: "0 0 10px rgba(255, 215, 0, 0.5)" }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function PageLoader({ text = "Loading CNQR..." }: { text?: string }) {
  return (
    <div
      className="fixed inset-0 w-screen h-screen flex items-center justify-center z-[9999] overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, #000000 0%, #1a1a00 25%, #000000 50%, #1a1a00 75%, #000000 100%)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        maxHeight: "100vh",
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 4}px`,
              height: `${Math.random() * 6 + 4}px`,
              backgroundColor: ["#ffd700", "#ffffff", "#ffd700"][Math.floor(Math.random() * 3)],
              animationDelay: `${Math.random() * 3}s`,
              animation: `sigma-float ${3 + Math.random() * 2}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 w-full h-full opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
            linear-gradient(rgba(255, 215, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 215, 0, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main content - Perfectly centered */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-4 text-center">
        <div className="flex flex-col items-center justify-center">
          <Loader size="lg" text={text} />

          {/* Additional loading text */}
          <div className="mt-12 text-center max-w-md">
            <p className="text-gray-300 text-base font-semibold tracking-wider">
              Powered by <span className="text-primary font-bold">Lotus Dash</span>
            </p>
            <div className="mt-6 w-40 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
