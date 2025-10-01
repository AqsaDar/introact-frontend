import React, { useState, useEffect } from "react";
import { getRequest, postRequest, putRequest, deleteRequest } from "../utils/httpClient";
import { 
  Phone, 
  Settings, 
  Play, 
  Pause, 
  Square, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";

export default function VapiIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState("Ready");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // VAPI Configuration
  const [vapiConfig, setVapiConfig] = useState({
    apiKey: "",
    assistantId: "",
    webhookUrl: "",
    maxDuration: 300,
    voice: "sarah",
    language: "en-US"
  });

  // Load VAPI configuration on mount
  useEffect(() => {
    loadVapiConfig();
  }, []);

  const loadVapiConfig = async () => {
    try {
      const response = await getRequest("vapi/config/");
      if (response.data) {
        setVapiConfig(response.data);
        setIsConnected(true);
      }
    } catch (err) {
      console.error("Failed to load VAPI config:", err);
    }
  };

  const saveVapiConfig = async () => {
    setLoading(true);
    setError("");
    try {
      await postRequest("vapi/config/", vapiConfig);
      setSuccess("VAPI configuration saved successfully!");
      setIsConnected(true);
    } catch (err) {
      setError(err?.message || "Failed to save VAPI configuration");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setError("");
    try {
      await getRequest("vapi/test-connection/");
      setSuccess("VAPI connection test successful!");
      setIsConnected(true);
    } catch (err) {
      setError(err?.message || "VAPI connection test failed");
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const startCall = async () => {
    if (!phoneNumber) {
      setError("Please enter a phone number");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await postRequest("vapi/start-call/", { 
        phoneNumber, 
        assistantId: vapiConfig.assistantId 
      });
      setIsCallActive(true);
      setCallStatus("Calling...");
      setSuccess("Call initiated successfully!");
    } catch (err) {
      setError(err?.message || "Failed to start call");
    } finally {
      setLoading(false);
    }
  };

  const endCall = async () => {
    setLoading(true);
    try {
      await postRequest("vapi/end-call/", {});
      setIsCallActive(false);
      setCallStatus("Call ended");
    } catch (err) {
      setError(err?.message || "Failed to end call");
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Here you would call VAPI mute/unmute API
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Here you would call VAPI speaker toggle API
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VAPI Integration</h1>
          <p className="mt-2 text-gray-600">Configure and manage voice AI calls with VAPI</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
                {isConnected ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Connection Status</p>
                <p className={`text-lg font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${isCallActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Phone className={`h-6 w-6 ${isCallActive ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Call Status</p>
                <p className={`text-lg font-semibold ${isCallActive ? 'text-blue-600' : 'text-gray-600'}`}>
                  {callStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-gray-100">
                <Settings className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Assistant</p>
                <p className="text-lg font-semibold text-gray-600">
                  {vapiConfig.assistantId || 'Not configured'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          {/* <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">VAPI Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={vapiConfig.apiKey}
                  onChange={(e) => setVapiConfig({...vapiConfig, apiKey: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your VAPI API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assistant ID
                </label>
                <input
                  type="text"
                  value={vapiConfig.assistantId}
                  onChange={(e) => setVapiConfig({...vapiConfig, assistantId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter assistant ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={vapiConfig.webhookUrl}
                  onChange={(e) => setVapiConfig({...vapiConfig, webhookUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://your-domain.com/webhook"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={vapiConfig.maxDuration}
                    onChange={(e) => setVapiConfig({...vapiConfig, maxDuration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="30"
                    max="3600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice
                  </label>
                  <select
                    value={vapiConfig.voice}
                    onChange={(e) => setVapiConfig({...vapiConfig, voice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="sarah">Sarah</option>
                    <option value="michael">Michael</option>
                    <option value="emma">Emma</option>
                    <option value="david">David</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={saveVapiConfig}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Save Configuration"}
                </button>
                <button
                  onClick={testConnection}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div> */}

          {/* Call Control Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Controls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div className="flex space-x-3">
                {!isCallActive ? (
                  <button
                    onClick={startCall}
                    disabled={loading || !isConnected}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Call
                  </button>
                ) : (
                  <button
                    onClick={endCall}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    End Call
                  </button>
                )}
              </div>

              {isCallActive && (
                <div className="flex space-x-3">
                  <button
                    onClick={toggleMute}
                    className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center ${
                      isMuted 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>

                  <button
                    onClick={toggleSpeaker}
                    className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center ${
                      isSpeakerOn 
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSpeakerOn ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                    {isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
                  </button>
                </div>
              )}
            </div>

            {/* Call Logs */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Calls</h4>
              <div className="space-y-2">
                <div className="text-sm text-gray-500 text-center py-4">
                  No recent calls
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
