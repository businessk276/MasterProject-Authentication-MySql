import { auth } from "@/auth";
import LoginForm from "@/components/LoginForm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session) redirect("/");

  return (
    <main className="auth-page">
      <section className="welcome-panel" aria-label="Welcome">
        <Link className="brand-lockup" href="/login" aria-label="Northstar sign in">
          <span className="brand-symbol">N</span>
          <span>Northstar</span>
        </Link>
        <div className="welcome-copy">
          <p className="eyebrow">A clearer way forward</p>
          <h1>Make room for<br /><em>what matters.</em></h1>
          <p className="welcome-description">
            Your work, ideas, and next big thing all start in one place.
          </p>
        </div>
        <div className="panel-footer">
          <span className="status-dot" /> Thoughtfully made for your next chapter
        </div>
        <span className="panel-index" aria-hidden="true">01 / 02</span>
      </section>

      <section className="form-panel">
        <div className="form-heading">
          <p className="eyebrow">Your space is waiting</p>
          <h2>Welcome back<span>.</span></h2>
          <p>Sign in or create an account to get started.</p>
        </div>
        <LoginForm />
        <p className="secure-note"><span aria-hidden="true">✳</span> Your details are encrypted and kept private.</p>
      </section>
    </main>
  );
}