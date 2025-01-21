import React, { useState } from "react";
import { Upload, X } from "lucide-react";

const PredictPage = () => {
  const [prediction, setPrediction] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getPredictionStyle = (prediction) => {
    const lowerPrediction = prediction.toLowerCase();
    if (lowerPrediction.includes('fresh')) {
      return "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200";
    } else if (lowerPrediction.includes('rotten') || lowerPrediction.includes('spoiled')) {
      return "bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200";
    }
    return "bg-gradient-to-r from-blue-50 to-indigo-50";
  };

  const getPredictionTextStyle = (prediction) => {
    const lowerPrediction = prediction.toLowerCase();
    if (lowerPrediction.includes('fresh')) {
      return "text-green-700";
    } else if (lowerPrediction.includes('rotten') || lowerPrediction.includes('spoiled')) {
      return "text-red-700";
    }
    return "text-gray-800";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagePreview) {
      alert("Please select an image to upload.");
      return;
    }

    setIsLoading(true);
    const fileInput = e.target.elements.foto;
    const formData = new FormData();
    formData.append("foto", fileInput.files[0]);

    try {
      const response = await fetch(
        "https://web-production-8985.up.railway.app/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        return;
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setImagePath(data.image_path);
      setShowModal(true);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-xl">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Freshify
            </h1>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="fileInput"
                  name="foto"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-700">
                    Drop your image here, or{" "}
                    <span className="text-blue-500">browse</span>
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Supports: JPG, PNG, GIF
                  </p>
                </div>
              </div>

              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded-lg w-full max-h-96 object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview("")}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !imagePreview}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                  isLoading || !imagePreview
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                }`}
              >
                {isLoading ? "Processing..." : "Predict Freshness"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4">
          <div className="max-w-lg w-full bg-white/90 backdrop-blur-sm rounded-lg shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-center">
                Prediction Result
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className={`p-6 rounded-lg ${getPredictionStyle(prediction)}`}>
                <p className={`text-center text-xl font-bold ${getPredictionTextStyle(prediction)}`}>
                  {prediction}
                </p>
                {prediction.toLowerCase().includes('fresh') && (
                  <p className="text-center text-green-600 mt-2">
                    ✓ This item appears to be fresh and safe to consume
                  </p>
                )}
                {prediction.toLowerCase().includes('rotten') && (
                  <p className="text-center text-red-600 mt-2">
                    ⚠ This item may not be safe to consume
                  </p>
                )}
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Uploaded Preview"
                  className="rounded-lg max-h-80 mx-auto"
                />
              )}
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:from-blue-600 hover:to-indigo-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictPage;