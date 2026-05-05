"use client";

import { useState, useRef, useEffect } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";
import { motion } from "framer-motion";

interface WebRTCCallProps {
  isCallActive: boolean;
  onCallStart: () => void;
  onCallEnd: () => void;
  roomId: string;
  userId: string;
  pairedUserName: string;
  isInitiator: boolean;
}

export default function WebRTCCall({
  isCallActive,
  onCallStart,
  onCallEnd,
  roomId,
  userId,
  pairedUserName,
  isInitiator,
}: WebRTCCallProps) {
  const {
    isConnected,
    isAudioEnabled,
    isVideoEnabled,
    localStream,
    remoteStream,
    error,
    remoteUserJoined,
    connectionStatus,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useWebRTC(roomId, userId, isInitiator);

  const [isStarting, setIsStarting] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Set up video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleStartCall = async () => {
    setIsStarting(true);
    try {
      const success = await startCall();
      if (success) {
        onCallStart();
      }
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndCall = () => {
    endCall();
    onCallEnd();
  };

  if (!isCallActive) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-gray-900 rounded-lg shadow-2xl p-6 max-w-6xl w-full mx-4"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isConnected ? "Call Connected" : "WebRTC Video Call"}
          </h2>
          <p className="text-gray-300">
            {isConnected
              ? `Connected with ${pairedUserName}`
              : `Calling ${pairedUserName}...`}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Video Streams */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Local Video */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">You</h3>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${isAudioEnabled ? "bg-green-500" : "bg-red-500"}`}
                  title="Microphone"
                ></div>
                <div
                  className={`w-3 h-3 rounded-full ${isVideoEnabled ? "bg-green-500" : "bg-red-500"}`}
                  title="Camera"
                ></div>
              </div>
            </div>
            <div
              className="relative bg-gray-700 rounded-lg overflow-hidden"
              style={{ height: "300px" }}
            >
              {localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <p>Camera off</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Remote Video */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">{pairedUserName}</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    remoteUserJoined
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {remoteUserJoined ? "Joined" : "Waiting"}
                </span>
              </div>
            </div>
            <div
              className="relative bg-gray-700 rounded-lg overflow-hidden"
              style={{ height: "300px" }}
            >
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg
                        className="w-8 h-8"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <p>
                      {remoteUserJoined ? "Connecting..." : "Waiting for join"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-gray-800 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Connection Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                connectionStatus === "connected"
                  ? "bg-green-100 text-green-800"
                  : connectionStatus === "connecting"
                    ? "bg-yellow-100 text-yellow-800"
                    : connectionStatus === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "connecting"
                  ? "Connecting..."
                  : connectionStatus === "failed"
                    ? "Failed"
                    : "Disconnected"}
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Audio:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                isAudioEnabled
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isAudioEnabled ? "Enabled" : "Muted"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-white font-medium">Video:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                isVideoEnabled
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isVideoEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex justify-center gap-4">
          {!isConnected ? (
            <button
              onClick={handleStartCall}
              disabled={isStarting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              {isStarting ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Starting...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Start Call
                </>
              )}
            </button>
          ) : (
            <div className="flex gap-4">
              {/* Audio Control */}
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full transition ${
                  isAudioEnabled
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
              >
                {isAudioEnabled ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 5.586A2 2 0 017 5V5a2 2 0 114 0v6a2 2 0 01-1.414 1.414L12 17.414l4.586-4.586A2 2 0 0117 11V5a2 2 0 114 0v6a2 2 0 01-2 2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </button>

              {/* Video Control */}
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full transition ${
                  isVideoEnabled
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
                title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>

              {/* End Call */}
              <button
                onClick={handleEndCall}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m-6 6.5a9 9 0 1112.5 0M12 6v6l4 2"
                  />
                </svg>
                End Call
              </button>
            </div>
          )}
        </div>

        {/* Technical Info */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          WebRTC Video Call - Phase 8 • Room: {roomId}
        </div>
      </motion.div>
    </motion.div>
  );
}
