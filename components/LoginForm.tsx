"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  doSocialLogin,
  signInWithCredentials,
  signUpWithCredentials,
} from "@/app/actions";

const LoginForm = () => {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, isSigningIn] = useActionState(
    signInWithCredentials,
    {},
  );
  const [signUpState, signUpAction, isSigningUp] = useActionState(
    signUpWithCredentials,
    {},
  );
  const isSignUp = mode === "signup";
  const error = isSignUp ? signUpState.error : signInState.error;

  return (
    <div className="auth-form-wrap">
      <div className="auth-tabs" role="tablist" aria-label="Account access">
        <button
          type="button"
          role="tab"
          aria-selected={!isSignUp}
          className={!isSignUp ? "auth-tab active" : "auth-tab"}
          onClick={() => setMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isSignUp}
          className={isSignUp ? "auth-tab active" : "auth-tab"}
          onClick={() => setMode("signup")}
        >
          Create account
        </button>
      </div>

      <form action={isSignUp ? signUpAction : signInAction} className="credentials-form">
        {isSignUp && (
          <label className="field-label">
            Full name
            <input
              className="auth-input"
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              maxLength={100}
              required
            />
          </label>
        )}
        <label className="field-label">
          Email address
          <input
            className="auth-input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="field-label">
          Password
          <input
            className="auth-input"
            type="password"
            name="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder={isSignUp ? "At least 8 characters" : "Your password"}
            minLength={isSignUp ? 8 : undefined}
            required
          />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={isSigningIn || isSigningUp}>
          {isSigningIn || isSigningUp
            ? "Please wait..."
            : isSignUp
              ? "Create your account"
              : "Sign in with email"}
          <span aria-hidden="true">→</span>
        </button>
      </form>

      <div className="divider"><span>or continue with</span></div>
      <form action={doSocialLogin} className="social-buttons">
        <button className="social-button" type="submit" name="action" value="google">
          <Image
            className="provider-mark"
            src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000"
            alt=""
            width={20}
            height={20}
            unoptimized
          />
          Google
        </button>
        <button className="social-button" type="submit" name="action" value="github">
          <Image
            className="provider-mark"
            src="https://img.icons8.com/?size=100&id=3tC9EQumUAuq&format=png&color=000000"
            alt=""
            width={20}
            height={20}
            unoptimized
          />
          GitHub
        </button>
      </form>
      <p className="terms-note">Your account details are handled securely.</p>
    </div>
  );
};

export default LoginForm;