import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, getMe } from "../api/client";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("CLICKED REGISTER");

    setLoading(true);
    setError("");

    try {
      console.log("SENDING DATA:", form);

      const res = await register(form);

      console.log("RESPONSE:", res);

      // ✅ FIX: use res.access_token (not res.data)
      localStorage.setItem("token", res.access_token);

      const me = await getMe();
      setUser(me.data);

      navigate("/onboarding");
    } catch (err) {
      console.error("ERROR:", err);

      setError(
        err.response?.data?.detail || err.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh]">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-navy mb-1">Create account</h1>
        <p className="text-slate-500 text-sm mb-6">
          Start your personalized learning path
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {["email", "username", "password"].map((field) => (
            <div key={field}>
              <label className="text-sm font-medium text-slate-700 block mb-1 capitalize">
                {field}
              </label>

              <input
                type={
                  field === "password"
                    ? "password"
                    : field === "email"
                      ? "email"
                      : "text"
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          Have an account?{" "}
          <Link
            to="/login"
            className="text-teal-700 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
