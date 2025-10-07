import React, { useEffect, useState } from "react";
import { VapiWidget } from "../components/VapiWidget";
import { getRequest, postRequest } from "../utils/httpClient";
import { useSearchParams } from "react-router-dom";

export default function VapiIntegration() {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(null);
  const [pipelineId, setPipelineId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = searchParams.get("token");

  useEffect(() => {
    const fetchSessionId = async () => {
      try {
        const response = await postRequest("company/ai-call/session/init", {
          token,
        });
        setSessionId(response.data.session_id);
        setPipelineId(response.data.pipeline_item_id);
        setError(null);
      } catch (err) {
        console.error("Error initializing VAPI session:", err);
        setError(err?.message || "Failed to connect to VAPI");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessionId();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to VAPI...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Connection Error
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VapiWidget
      apiKey={import.meta.env.VITE_VAPI_PUBLIC_KEY}
      assistantId={import.meta.env.VITE_VAPI_ASSISTANT_ID}
      sessionId={sessionId}
      config={{
        metadata: {
          sessionId: sessionId,
          pipelineId: pipelineId,
          linkToken: token,
        },
      }}
    />
  );
}

// Usage in your app:
// <VapiWidget
//   apiKey="your_public_api_key"
//   assistantId="your_assistant_id"
// />

// import React, { useEffect, useState } from "react";
// import Vapi from "@vapi-ai/web";

// function VapiIntegration() {
//   const [vapi, setVapi] = useState(null);

//   useEffect(() => {
//     const instance = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);
//     setVapi(instance);

//     instance.on("status", (s) => console.log("Status:", s));
//     instance.on("error", (e) => console.error("Error:", e));
//   }, []);

//   const handleStart = () => {
//     if (!vapi) return;
//     vapi.start({
//       model: {
//         provider: "openai",
//         model: "gpt-4o-mini",
//         messages: [{ role: "system", content: "You are a helpful assistant." }]
//       },
//       voice: {
//         provider: "11labs",
//         voiceId: import.meta.env.VITE_VAPI_ASSISTANT_ID
//       }
//     });
//   };

//   return (
//     <div>
//       <h1>Vapi React Test</h1>
//       <button onClick={handleStart}>Start Voice</button>
//     </div>
//   );
// }

// export default VapiIntegration;
