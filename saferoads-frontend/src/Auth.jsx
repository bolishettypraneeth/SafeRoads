
import React, { useState } from "react";
import "./Auth.css";

const API_URL = "http://localhost:8080/api/users";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setBusy(true);

    const isRegister = mode === "register";
    const endpoint = isRegister ? "register" : "login";

    const payload = isRegister
      ? {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        }
      : {
          email: form.email.trim(),
          password: form.password,
        };

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data.message || data.error || "Authentication failed"
        );
      }

      if (isRegister) {
        setMessage("Registration successful! Please log in.");
        setMode("login");
        setForm((previous) => ({
          ...previous,
          password: "",
        }));
      } else {
        // Store only basic profile details, never the password.
        const user = {
          id: data.id,
          name: data.name || form.email,
          email: data.email || form.email,
        };

        onLogin(user);
      }
    } catch (error) {
      setMessage(
        error.message ||
          "Cannot connect to the server. Check your backend."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🛣️</div>
        <h1>SafeRoads</h1>
        <p className="auth-subtitle">
          Smart City Traffic System
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "selected" : ""}
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
          >
            User Login
          </button>

          <button
            type="button"
            className={mode === "register" ? "selected" : ""}
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        <h2>
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="auth-description">
          {mode === "login"
            ? "Log in to access your SafeRoads dashboard."
            : "Register to report road issues in your area."}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </>
          )}

          <label htmlFor="auth-email">Email Address</label>
          <input
            id="auth-email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete={
              mode === "login"
                ? "current-password"
                : "new-password"
            }
            minLength={8}
            required
          />

          {message && (
            <p className="auth-message" role="status">
              {message}
            </p>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={busy}
          >
            {busy
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          SafeRoads · Hyderabad, Telangana
        </p>
      </div>
    </div>
  );
}
