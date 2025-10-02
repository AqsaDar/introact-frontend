import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getRequest, postRequest } from "../utils/httpClient";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

export default function InviteAnalyst() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const uid = searchParams.get("uid");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // If there's a token, verify it and fetch the email tied to it
  useEffect(() => {
    async function verifyToken() {
      const email = localStorage.getItem("invite_email");
      if (email) {
        setEmail(email);
      }
      // if (!token) return;
      // setLoading(true);
      // setError("");
      // try {
      //   const res = await getRequest(`user/invite-analyst/verify/`, { params: { token } });
      //   const emailFromServer = res?.data?.email;
      //   if (emailFromServer) setEmail(emailFromServer);
      // } catch (err) {
      //   setError(err?.message || "Invalid or expired invite link.");
      // } finally {
      //   setLoading(false);
      // }
    }
    verifyToken();
  }, [token]);

  // Handler to send invite email
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await postRequest("user/invite/", { email });
      setSuccess("Invitation sent successfully. Please ask the analyst to check their email.");
      localStorage.setItem("invite_email", email);
      setEmail("");
    } catch (err) {
      setError(err?.message || "Failed to send invite. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handler to set password using token
  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await postRequest("user/accept-invite/", { uid, token, password });
      toast.success("Password set successfully. Please login to continue.");
      localStorage.removeItem("invite_email");
      logout()
      // On success go to login
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Failed to set password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isInviteMode = !token;

  return (
    <div className="h-full flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {
          user.is_superadmin ? (
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isInviteMode ? "Add Analyst" : "Set Password"}
            </h1>
          ) : (""
          )
        } 
        <p className="text-sm text-gray-500 mb-6">
          {isInviteMode
            ? "Send an invite to an analyst by entering their email address."
            : "Create a new password for your account to complete the invite."}
        </p>

        {error && (
          <div className="mb-4 text-sm px-3 py-2 rounded-lg border border-red-200 text-red-700 bg-red-50">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 text-sm px-3 py-2 rounded-lg border border-green-200 text-green-700 bg-green-50">
            {success}
          </div>
        )}

        {isInviteMode ? (
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analyst Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="analyst@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={handleSendInvite}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Setting..." : "Set Password"}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">Back to login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
