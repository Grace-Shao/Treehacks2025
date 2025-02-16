"use client"

import { useState, useEffect } from "react"

const phrases = ["Prevent dangerous activity", "Real-time analytics", "Receive instant alerts"]

export default function AnimatedText() {
  const [text, setText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % phrases.length
      const fullText = phrases[i]

      setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1))

      setTypingSpeed(isDeleting ? 30 : 150)

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1500)
      } else if (isDeleting && text === "") {
        setIsDeleting(false)
        setLoopNum(loopNum + 1)
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [text, isDeleting, loopNum, typingSpeed])

  return (
    <div className="h-16 flex items-center justify-center">
      <p className="text-2xl font-light tracking-wide bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
        {text}
        <span className="animate-blink text-blue-400">|</span>
      </p>
    </div>
  )
}

