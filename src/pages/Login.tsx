import { Button } from '@/bbl/button'
import { SignInSplit } from '@/patterns/sign-in-split'

/** The CNH sign-in — webds `sign-in-split`, which was measured on this page. */
export function Login({ onSignIn }: { onSignIn: () => void }) {
  return (
    <SignInSplit
      banner={<img src="/img/login-banner.png" alt="" width={534} height={713} className="rounded-[var(--radius-4)]" />}
      mark={<img src="/bbl-logo.svg" alt="Bangkok Bank" width={250} height={62} />}
      welcome="Welcome to"
      title="Customer Notification Hub (CNH)"
      note="For login assistance, please contact the Service Desk at 02-031-0888"
      action={
        <Button onClick={onSignIn} className="h-[44px] w-[285px]">
          Log in
        </Button>
      }
    />
  )
}
