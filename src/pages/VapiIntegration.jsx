import React, { useEffect, useState } from "react";
import { VapiWidget } from "../components/VapiWidget";
import { getRequest, postRequest } from "../utils/httpClient";
import { useSearchParams } from "react-router-dom";

export default function VapiIntegration() {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(null);
  const [pipelineId, setPipelineId] = useState(null);
  const token = searchParams.get('token');
  useEffect(() => {
    const fetchSessionId = async () => {
    const response = await postRequest('company/api/ai-call/session/init', {
      token
    })
      setSessionId(response.data.session_id)
      setPipelineId(response.data.pipeline_item_id)
    }
    fetchSessionId()
  }, []);
  return (
    <VapiWidget 
      apiKey={import.meta.env.VITE_VAPI_PUBLIC_KEY} 
      assistantId={import.meta.env.VITE_VAPI_ASSISTANT_ID}
      sessionId={'a622626a-cabf-4787-a73b-5418bf046b5d'}
      config={{
        metadata: {
          "sessionId": sessionId,
          "pipelineId": pipelineId,
          "linkToken": token
        }
      }}
    />
  );
};




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