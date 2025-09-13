import React, { useState } from 'react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Debug environment variables
console.log('Environment variables:', import.meta.env);
console.log('API Key loaded:', apiKey ? 'Yes' : 'No');
console.log('API Key value:', apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined');

// Validate API key
if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY is not defined. Please check your .env file.');
  console.error('Make sure to restart the development server after creating/updating .env file.');
}

const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;

// Pre-defined background options for the user to choose from
const backgroundOptions = [
  'Red Carpet Premiere',
  'Tropical Beach Paradise',
  'Futuristic Spaceship Lounge',
  'Cozy Coffee Shop Corner',
  'Vibrant Music Festival',
];

// Reusable SVG components to replace the external icon library
const UserIcon = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
    <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.4 304 0 383.4 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.4 368.6 304 269.7 304H178.3z" />
  </svg>
);

const StarIcon = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor">
    <path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.7 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2.3 12.7 3.1 25.4 13.1 32.9s23.5 7.6 34.5 1.4l128.7-68.5 128.7 68.5c11 6.2 24.2 5.2 34.5-1.4s15.4-20.2 13.1-32.9L438.5 329l106.5-106.4c8.6-8.5 11.3-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z" />
  </svg>
);

const WandMagicSparklesIcon = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
    <path d="M260.6 150.6L201.4 91.4c-12.5-12.5-32.8-12.5-45.3 0L30.6 216.2c-12.5 12.5-12.5 32.8 0 45.3l59.3 59.3c12.5 12.5 32.8 12.5 45.3 0l125.7-125.7c12.4-12.5 12.4-32.8-.1-45.3zM464 256a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM384 32a48 48 0 1 0 0 96 48 48 0 1 0 0-96zM464 352a48 48 0 1 0 0 96 48 48 0 1 0 0-96zM320 256a64 64 0 1 0 0 128 64 64 0 1 0 0-128zM32 448c-17.7 0-32 14.3-32 32s14.3 32 32 32h384c17.7 0 32-14.3 32-32s-14.3-32-32-32H32z" />
  </svg>
);

const ImageIcon = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
    <path d="M448 256c0 106-103.8 192-232 192S0 362 0 256 103.8 64 232 64s216.5 86.8 228.8 192H448zm-192 108a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM224 320a96 96 0 1 1 0-192 96 96 0 1 1 0 192zM64 256a160 160 0 1 1 320 0 160 160 0 1 1 -320 0z" />
  </svg>
);

const DownloadIcon = ({ className = '' }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
    <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-5.8 4.6c-43.2 34.6-96.2 53.4-150.7 54.4s-107.8-17.5-150.1-51.8L64 352zm256 96a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
  </svg>
);


const App = () => {
  const [userImage, setUserImage] = useState(null);
  const [celebrityImage, setCelebrityImage] = useState(null);
  const [backgroundPrompt, setBackgroundPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const handleImageUpload = (e, setImageSetter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSetter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!userImage || !celebrityImage) {
      setError('Please upload both images to continue.');
      return;
    }

    setError('');
    setIsLoading(true);
    setGeneratedImageUrl('');
    setMessage('');
    setRetryCount(0);

    try {
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Merge these two people into a single image, as if they are standing together on a ${backgroundPrompt || 'glamorous red carpet'}. Ensure the second person's face is clear and an accurate representation of the original imageMake the image fun and look like a high-fashion photo shoot.Negative prompt: distorted faces, multiple faces, blurry facial features, asymmetrical eyes.`
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: userImage.split(',')[1]
                }
              },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: celebrityImage.split(',')[1]
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      };
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 400) {
          throw new Error('Invalid request. Please check your images and try again.');
        } else if (response.status === 401) {
          throw new Error('API key is invalid or expired. Please check your configuration.');
        } else if (response.status === 403) {
          throw new Error('API access forbidden. Please check your API key permissions.');
        } else {
          throw new Error(`API error (${response.status}). Please try again later.`);
        }
      }

      const result = await response.json();
      const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

      if (base64Data) {
        const imageUrl = `data:image/png;base64,${base64Data}`;
        setGeneratedImageUrl(imageUrl);
        setMessage('Your celebrity-level photo is ready!');
      } else {
        setError('Failed to generate image. Please try again with different images.');
      }
    } catch (e) {
      console.error("Error generating image:", e);
      const errorMessage = e.message || 'An error occurred while generating the image. Please try again.';
      setError(errorMessage);
      
      // If it's a rate limit error, suggest waiting
      if (e.message && e.message.includes('rate limit')) {
        setError(errorMessage + ' You can try again in a few minutes.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = 'celebrity_merge_photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 min-h-screen flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-4xl transform transition-all duration-300 hover:scale-105">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 tracking-tight mb-2">
            VIP Photo Fusion
          </h1>
          <p className="text-lg md:text-xl text-gray-500">
            Merge your vibe with a star's sparkle!
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Powered by Google Gemini AI • Rate limits may apply
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* User Image Upload */}
          <label className="flex-1 relative border-4 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors duration-300">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, setUserImage)}
            />
            {userImage ? (
              <img src={userImage} alt="User" className="w-full h-auto rounded-xl object-contain" />
            ) : (
              <>
                <UserIcon className="text-5xl text-indigo-400 mb-4" />
                <span className="text-lg font-semibold text-gray-600">Your Selfie</span>
                <span className="text-sm text-gray-400 mt-1">Click to upload or drag & drop</span>
              </>
            )}
          </label>

          {/* Celebrity Image Upload */}
          <label className="flex-1 relative border-4 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors duration-300">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, setCelebrityImage)}
            />
            {celebrityImage ? (
              <img src={celebrityImage} alt="Celebrity" className="w-full h-auto rounded-xl object-contain" />
            ) : (
              <>
                <StarIcon className="text-5xl text-purple-400 mb-4" />
                <span className="text-lg font-semibold text-gray-600">A Star's Photo</span>
                <span className="text-sm text-gray-400 mt-1">Click to upload or drag & drop</span>
              </>
            )}
          </label>
        </div>

        {/* Background Options */}
        <div className="bg-gray-100 p-6 rounded-2xl mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-700">Choose Your Scene</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            {backgroundOptions.map((bg) => (
              <button
                key={bg}
                onClick={() => setBackgroundPrompt(bg)}
                className={`text-sm font-medium py-3 px-2 rounded-xl transition-all duration-200
                  ${backgroundPrompt === bg ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
              >
                {bg}
              </button>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mb-2">
            or type your own...
          </p>
          <div className="flex items-center space-x-2">
            <ImageIcon className="text-gray-400 text-xl w-5 h-5" />
            <input
              type="text"
              placeholder="e.g., in a magical castle at sunset"
              value={backgroundPrompt}
              onChange={(e) => setBackgroundPrompt(e.target.value)}
              className="flex-grow p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateImage}
          disabled={isLoading || (!userImage || !celebrityImage)}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-6 rounded-2xl text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              <span>Generating...</span>
            </div>
          ) : (
            <>
              <WandMagicSparklesIcon className="mr-2 w-5 h-5" />
              Create Your Slay!
            </>
          )}
        </button>

        {/* Status and Result */}
        {(error || message || generatedImageUrl) && (
          <div className="mt-8 text-center">
            {error && <p className="text-red-500 font-bold">{error}</p>}
            {message && <p className="text-green-600 font-bold">{message}</p>}
            {generatedImageUrl && (
              <div className="mt-6 p-4 bg-gray-100 rounded-2xl shadow-inner">
                <img
                  src={generatedImageUrl}
                  alt="Generated"
                  className="w-full max-h-[500px] object-contain rounded-xl shadow-md mb-4"
                />
                <button
                  onClick={handleDownload}
                  className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center mx-auto"
                >
                  <DownloadIcon className="mr-2 w-5 h-5" />
                  Download Image
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Root rendering is handled in src/main.jsx

export default App;
