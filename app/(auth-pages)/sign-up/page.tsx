import { signUpAction } from "@/app/actions"
import { FormMessage, type Message } from "@/components/form-message"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { SmtpMessage } from "../smtp-message"

export default async function Signup(props: {
  searchParams: Promise<Message>
}) {
  const searchParams = await props.searchParams
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-background">
      <div className="w-full max-w-md px-4">
        <form className="flex flex-col w-full p-8 space-y-6 bg-card rounded-lg shadow-lg">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Sign up</h1>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link className="text-primary font-medium underline" href="/sign-in">
                Sign in
              </Link>
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">
                Email
              </Label>
              <Input name="email" id="email" placeholder="you@example.com" required className="text-base" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">
                Password
              </Label>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Your password"
                minLength={6}
                required
                className="text-base"
              />
            </div>
            <SubmitButton formAction={signUpAction} pendingText="Signing up..." className="w-full text-base">
              Sign up
            </SubmitButton>
            <FormMessage message={searchParams} />
          </div>
        </form>
        <SmtpMessage />
      </div>
    </div>
  )
}

