'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomeLink() {
  const router = useRouter()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    router.push(user ? '/pages/mainOptionsPage' : '/')
  }

  return (
    <Link 
      href="/" 
      onClick={handleClick}
      className="font-semibold"
    >
      Home Page
    </Link>
  )
}
