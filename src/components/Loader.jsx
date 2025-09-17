import React, { useState, useEffect } from 'react';

export const Loader = ({ isVisible, message = "Loading...", messages = [], currentStep = 0 }) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle array of messages
  useEffect(() => {
    console.log("messages", messages);
    console.log("currentStep", currentStep);
    if (messages && messages.length > 0 && currentStep < messages.length) {
      // if (currentStep !== undefined) {
      //   setDisplayMessage(messages[currentStep]);
      //   setCurrentIndex(currentStep);
      // } else {
        // Cycle through messages if no specific step is provided
        const interval = setInterval(() => {
          console.log("currentIndex", currentIndex);
          setCurrentIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % messages.length;
            setDisplayMessage(messages[nextIndex]);
            return nextIndex;
          });
        }, 2000); // Change message every 2 seconds

        return () => clearInterval(interval);
      }
    // } else {
      setDisplayMessage(message);
    // }
  }, [messages, currentStep, message]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-opacity-60 backdrop-blur-sm"></div>
      
      {/* Loader content */}
      <div className="relative rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="text-center">
          {/* Spinner */}
          <div className="relative mx-auto w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          
          {/* Message */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {displayMessage}
          </h3>

          {/* Progress indicator for array of messages */}
          {/* {messages && messages.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-center space-x-2">
                {messages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === currentIndex 
                        ? 'bg-blue-600' 
                        : index < currentIndex 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Step {currentIndex + 1} of {messages.length}
              </p>
            </div>
          )} */}
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
