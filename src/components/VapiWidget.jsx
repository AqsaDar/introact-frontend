import React, { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";
import { postRequest } from "../utils/httpClient";

export const VapiWidget = ({ apiKey, assistantId, sessionId, config }) => {
  const [vapi, setVapi] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [callId, setCallId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);
  const timerRef = useRef(null);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

    // Event listeners
    vapiInstance.on("call-start", () => {
      setIsConnected(true);
      setIsInitializing(false);
      // start duration timer
      if (timerRef.current) clearInterval(timerRef.current);
      setCallSeconds(0);
      timerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    });

    vapiInstance.on("call-end", () => {
      setIsConnected(false);
      setIsSpeaking(false);
      setIsInitializing(false);
      setHasEnded(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    });

    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false);
    });

    vapiInstance.on("message", (message) => {
      if (message.type === "transcript") {
        setTranscript((prev) => [
          ...prev,
          {
            role: message.role,
            text: message.transcript,
          },
        ]);
      }
    });

    vapiInstance.on("error", (error) => {
      console.error("Vapi error:", error);
      setIsInitializing(false);
    });

    return () => {
      vapiInstance?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [apiKey]);

  useEffect(() => {
    if (vapi) {
      startCall();
    }
  }, [vapi]);

  const startCall = async () => {
    try {
      setIsInitializing(true);
      if (vapi) {
        const res = await vapi.start(assistantId, config);
        setCallId(res.id);
        await postRequest("company/ai-call/session/attach", {
          session_id: sessionId,
          vapi_call_id: res.id,
        });
      }
    } catch (e) {
      console.error("Vapi error:", e);
      setIsInitializing(false);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
    setHasEnded(true);
  };

  const formatTime = (total) => {
    const m = Math.floor(total / 60)
      .toString()
      .padStart(2, "0");
    const s = (total % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "Inter, system-ui, Arial, sans-serif",
      }}
    >
      {/* Connecting Loader */}
      {isInitializing && (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            width: 320,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            border: "1px solid #e6e8eb",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#12A59410",
              border: "3px solid #12A594",
              borderTopColor: "transparent",
              animation: "spin 0.9s linear infinite",
            }}
          />
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>Connecting…</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Please wait while we initialize the audio call.
            </div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Idle state (rarely visible since auto-start) */}
      {/* {!isInitializing && !isConnected && (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:12}}>
          <button
            // onClick={startCall}
            style={{
              background: '#12A594',
              color: '#fff',
              border: 'none',
              width: 88,
              height: 88,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(18, 165, 148, 0.35)',
              transition: 'transform .15s ease, box-shadow .2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(18, 165, 148, 0.45)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(18, 165, 148, 0.35)';
            }}
          >
            🎤
          </button>
          <div style={{fontWeight:700, color:'#0f172a'}}>Talk to Assistant</div>
          <div style={{fontSize:12, color:'#6b7280'}}>Start a voice conversation</div>
        </div>
      )} */}

      {/* In-call UI */}
      {isConnected && (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            width: 360,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
            border: "1px solid #e6e8eb",
          }}
        >
          {/* Top: avatar + status + duration + end */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#12A594",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                  }}
                >
                  AI
                </div>
                <div
                  style={{
                    position: "absolute",
                    right: -2,
                    bottom: -2,
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: isSpeaking ? "#ef4444" : "#22c55e",
                    boxShadow: "0 0 0 2px #fff",
                  }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>
                  {isSpeaking ? "Assistant Speaking" : "Listening…"}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Duration {formatTime(callSeconds)}
                </div>
              </div>
            </div>
            <button
              onClick={endCall}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              End
            </button>
          </div>

          {/* Transcript */}
          <div
            style={{
              maxHeight: 220,
              overflowY: "auto",
              marginBottom: 8,
              padding: 8,
              background: "#f8fafc",
              borderRadius: 12,
            }}
          >
            {transcript.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
                Conversation will appear here…
              </p>
            ) : (
              transcript.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 8,
                    textAlign: msg.role === "user" ? "right" : "left",
                  }}
                >
                  <span
                    style={{
                      background: msg.role === "user" ? "#12A594" : "#1f2937",
                      color: "#fff",
                      padding: "8px 12px",
                      borderRadius: 12,
                      display: "inline-block",
                      fontSize: 14,
                      maxWidth: "80%",
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Call Ended UI */}
      {!isConnected && hasEnded && !isInitializing && (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            width: 360,
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
            border: "1px solid #e6e8eb",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ef4444",
              margin: "0 auto 12px",
            }}
          >
            ⏹️
          </div>
          <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
            Call has ended
          </div>
          <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 14 }}>
            You can go back to dashboard.
          </div>
          <button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #111827",
              color: "#111827",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Go to Dashboard
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: .5; } 100% { opacity: 1; } }
      `}</style>
    </div>
  );
};
