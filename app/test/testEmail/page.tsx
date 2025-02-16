'use client'

import { useState } from 'react'

export default function TestEmailPage() {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSendEmail = async () => {
    try {
      setError(null)
      setSuccess(false)
      setSending(true)
      console.log('Sending test email...')

      const emailPayload = {
        title: 'Test Dangerous Activity',
        description: 'This is a test dangerous activity alert from the test page.'
      }

      console.log('Email payload:', emailPayload)

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      })

      console.log('Response status:', response.status)
      const result = await response.json()
      
      if (result.error) {
        console.error('API returned error:', result.error)
        throw new Error(result.error.message || 'Failed to send email')
      }

      console.log('Email sent successfully:', result)
      setSuccess(true)
    } catch (error) {
      console.error('Error sending email:', error)
      setError(error instanceof Error ? error.message : 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Test Email Notifications</h1>
      
      <div className="space-y-2">
        <button
          onClick={handleSendEmail}
          disabled={sending}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send Test Email'}
        </button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded">
            Email sent successfully! Check your inbox.
          </div>
        )}

        <div className="text-sm text-gray-600 mt-4">
          <p>This page tests the email notification system. When you click the button:</p>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li>It will attempt to send a test email to your account</li>
            <li>You must be signed in to receive the email</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
