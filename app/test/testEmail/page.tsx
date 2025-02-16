'use client'

import { useState } from 'react'

export default function TestEmailPage() {
  const [sending, setSending] = useState(false)

  const handleSendEmail = async () => {
    try {
      setSending(true)
      const response = await fetch('/api/send-email', {
        method: 'POST'
      })

      const result = await response.json()
      
      if (result.error) {
        throw new Error('Failed to send email')
      }

      alert('Email sent successfully!')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <button
      onClick={handleSendEmail}
      disabled={sending}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      {sending ? 'Sending...' : 'Send Email'}
    </button>
  )
}