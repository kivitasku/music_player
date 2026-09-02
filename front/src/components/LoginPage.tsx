import { useEffect, useState } from "react";

import "./LoginPage.css";

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({
  onLogin,
}: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedUsername = document.cookie
      .split("; ")
      .find((row) => row.startsWith("rememberedUsername="))
      ?.split("=")[1];

    if (savedUsername) {
      setUsername(decodeURIComponent(savedUsername));
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Login failed");
        return;
      }

      //remember username in cookie for 30 days if rememberMe is checked, otherwise delete the cookie
      if (rememberMe) {
        document.cookie = `rememberedUsername=${encodeURIComponent(username)}; max-age=2592000; path=/; SameSite=Lax`;
      } else {
        document.cookie =
          "rememberedUsername=; max-age=0; path=/; SameSite=Lax";
      }

      onLogin();
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-header">
          <h1>Music Player</h1>
        </div>

        <h2>Log in</h2>

        <div className="login-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="login-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="login-remember">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Remember username
          </label>
        </div>

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <button
          className="login-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );


}