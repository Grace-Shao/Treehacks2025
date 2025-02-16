import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HawkWatch <onboarding@resend.dev>',
      to: ['graceshao203@gmail.com'],
      subject: '[IMPORTANT] SECURITY ALERT',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    })

    if (error) {
      return NextResponse.json({ error })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error })
  }
}
