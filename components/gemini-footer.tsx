import Image from 'next/image'

export function GeminiFooter() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Powered by</span>
      <Image
        src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg"
        alt="Gemini Logo"
        width={20}
        height={20}
        className="inline-block"
      />
      <span className="text-xs font-medium">Gemini</span>
    </div>
  )
}
