import Link from "next/link"

export default function MainNavbar() {
  return (
    <nav className="w-full flex justify-between items-center mb-8">
      <Link href="/" className="text-2xl font-bold">
        Hawk Watch
      </Link>
      <Link href="/" className="text-sm hover:underline">
        Back to Home
      </Link>
    </nav>
  )
}

