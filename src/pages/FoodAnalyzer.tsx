import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  Info,
  Key,
  X,
} from 'lucide-react';
import { api } from '../services/api.js';
import { MealType, FoodAnalysis } from '../types/index.js';
import { AcademicDisclaimer } from '../components/AcademicDisclaimer.js';

interface FoodAnalyzerProps {
  onAnalysisComplete: (analysis: FoodAnalysis) => void;
}

export const FoodAnalyzer: React.FC<FoodAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [userNotes, setUserNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [qualityWarning, setQualityWarning] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; provider: string } | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  React.useEffect(() => {
    api.getAISettings().then(setAiStatus).catch(() => {});
  }, []);

  const stages = [
    { title: 'Processing meal image', desc: 'Validating aspect ratio, resolution, and color histogram...' },
    { title: 'Open-ended multimodal AI vision', desc: 'Scanning entire image (center, left, right, top, bottom, foreground, background)...' },
    { title: 'Identifying all distinct foods', desc: 'Recognizing separate dishes and atomic components without list restrictions...' },
    { title: 'Estimating portions in grams', desc: 'Calculating volumetric serving weights with confidence scores...' },
    { title: 'Querying nutrition & compiling totals', desc: 'Matching reference nutritional data and formulating dietary advice...' },
  ];

  const presetMeals = [
    {
      name: 'Pizza & Fries Combo',
      foods: 'Pizza + Fries + Ketchup',
      img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      type: 'Dinner' as MealType,
      notes: 'Pizza + Fries + Ketchup',
    },
    {
      name: 'Burger & Soda Meal',
      foods: 'Burger + French Fries + Soft Drink',
      img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      type: 'Lunch' as MealType,
      notes: 'Burger + French Fries + Soft Drink',
    },
    {
      name: 'Indian Complete Thali',
      foods: 'Rice + Chicken Curry + Dal + Salad + Pickle + Curd',
      img: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
      type: 'Lunch' as MealType,
      notes: 'Rice + Chicken Curry + Dal + Salad + Pickle + Curd',
    },
    {
      name: 'South Indian Breakfast',
      foods: 'Dosa + Sambar + Chutney',
      img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
      type: 'Breakfast' as MealType,
      notes: 'Dosa + Sambar + Chutney',
    },
    {
      name: 'Fresh Fruit Plate',
      foods: 'Apple + Banana + Orange + Grapes',
      img: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
      type: 'Snack' as MealType,
      notes: 'Apple + Banana + Orange + Grapes',
    },
  ];

  const handleFile = (file: File) => {
    setError(null);
    setQualityWarning(null);
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum image file size is 10 MB.');
      return;
    }

    // Image quality check
    if (file.size < 20 * 1024) {
      setQualityWarning('The image quality may affect food recognition accuracy. Try uploading a clearer image.');
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);

      // Check resolution
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth < 350 || img.naturalHeight < 350) {
          setQualityWarning('The image quality may affect food recognition accuracy. Try uploading a clearer image.');
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    stopCamera();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const selectPreset = (preset: typeof presetMeals[0]) => {
    setImagePreview(preset.img);
    setSelectedFile(null);
    setMealType(preset.type);
    setUserNotes(preset.notes);
    setError(null);
    stopCamera();
  };

  const startCamera = async () => {
    setError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
        setImagePreview(null);
        setSelectedFile(null);
      } else {
        setError('Camera capture is not supported on this browser or device.');
      }
    } catch (err: any) {
      setError('Could not access camera. Please allow camera permissions or upload an image file.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(dataUrl);
      setSelectedFile(null);
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setImagePreview(null);
    stopCamera();
    setError(null);
  };

function extractCanvasVisualFeatures(dataUrlOrImgSrc: string): Promise<any> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const size = 64;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(undefined);
            return;
          }
          ctx.drawImage(img, 0, 0, size, size);
          const data = ctx.getImageData(0, 0, size, size).data;
          const totalPixels = size * size;

          let red = 0, orange = 0, yellow_golden = 0, green = 0, blue = 0, purple = 0, white_cream = 0, brown = 0, dark = 0;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const max = Math.max(r, g, b) / 255;
            const min = Math.min(r, g, b) / 255;
            const diff = max - min;
            let h = 0;
            if (diff !== 0) {
              if (max === r / 255) {
                h = (60 * ((g - b) / 255 / diff) + 360) % 360;
              } else if (max === g / 255) {
                h = 60 * ((b - r) / 255 / diff) + 120;
              } else {
                h = 60 * ((r - g) / 255 / diff) + 240;
              }
            }
            const s = max === 0 ? 0 : diff / max;
            const v = max;

            if (v < 0.16) {
              dark++;
            } else if (s < 0.18 && v > 0.72) {
              white_cream++;
            } else if (h >= 15 && h < 48 && s >= 0.22 && v >= 0.18 && v <= 0.62) {
              brown++;
            } else if (h < 18 || h >= 345) {
              red++;
            } else if (h >= 18 && h < 45) {
              orange++;
            } else if (h >= 45 && h < 72) {
              yellow_golden++;
            } else if (h >= 72 && h < 165) {
              green++;
            } else if (h >= 165 && h < 260) {
              blue++;
            } else {
              purple++;
            }
          }

          const redPct = Math.round((red / totalPixels) * 100);
          const orangePct = Math.round((orange / totalPixels) * 100);
          const yellowPct = Math.round((yellow_golden / totalPixels) * 100);
          const greenPct = Math.round((green / totalPixels) * 100);
          const whitePct = Math.round((white_cream / totalPixels) * 100);
          const brownPct = Math.round((brown / totalPixels) * 100);
          const darkPct = Math.round((dark / totalPixels) * 100);

          const aspectRatio = (img.naturalWidth || 1) / (img.naturalHeight || 1);

          let dominantHueCategory = 'balanced';
          if (greenPct > 28) dominantHueCategory = 'green_salad';
          else if (orangePct > 20 && yellowPct > 12) dominantHueCategory = 'orange_saffron';
          else if (yellowPct > 22 || (yellowPct + brownPct > 35)) dominantHueCategory = 'yellow_golden';
          else if (redPct > 20) dominantHueCategory = 'red_tomato';
          else if (whitePct > 30) dominantHueCategory = 'white_cream';
          else if (redPct > 8 && yellowPct > 8 && orangePct > 8) dominantHueCategory = 'multi_fruit';

          let detectedDish: string | undefined;
          const dominantColors: string[] = [];
          if (yellowPct > 15) dominantColors.push('Golden-Yellow');
          if (orangePct > 15) dominantColors.push('Warm-Orange');
          if (redPct > 12) dominantColors.push('Rich-Red');
          if (greenPct > 15) dominantColors.push('Fresh-Green');
          if (whitePct > 15) dominantColors.push('Cream-White');
          if (brownPct > 15) dominantColors.push('Savory-Brown');

          if (whitePct > 36 && redPct < 10 && orangePct < 10) {
            detectedDish = 'paneer';
          } else if (greenPct > 32) {
            detectedDish = 'salad';
          } else if (orangePct + redPct > 40) {
            detectedDish = 'kofta';
          } else if (yellowPct + brownPct > 25 && greenPct > 10) {
            detectedDish = 'vada';
          } else if (redPct > 10 && yellowPct > 10 && orangePct > 10 && (purple > 150 || greenPct > 10)) {
            detectedDish = 'fruit_plate';
          } else if (aspectRatio < 0.88 && (yellowPct + brownPct > 22)) {
            detectedDish = 'dosa';
          } else if (orangePct > 18 && (yellowPct > 12 || brownPct > 12)) {
            detectedDish = 'biryani';
          } else if (redPct > 16 && (yellowPct > 12 || whitePct > 12)) {
            detectedDish = 'pizza';
          } else if (brownPct > 18 && yellowPct > 12) {
            detectedDish = 'burger';
          } else if (whitePct > 25 && (yellowPct > 12 || orangePct > 12)) {
            detectedDish = 'thali';
          }

          resolve({
            detectedDish,
            dominantColors,
            aspectRatio,
            dominantHueCategory,
            colorPercentages: {
              red: redPct,
              orange: orangePct,
              yellow_golden: yellowPct,
              green: greenPct,
              white_cream: whitePct,
              brown: brownPct,
              dark: darkPct,
            },
          });
        } catch {
          resolve(undefined);
        }
      };
      img.onerror = () => resolve(undefined);
      img.src = dataUrlOrImgSrc;
    } catch {
      resolve(undefined);
    }
  });
}

  const runAnalysis = async () => {
    if (!imagePreview) {
      setError('Please upload or select a food image before analyzing.');
      return;
    }

    setError(null);
    setLoading(true);
    setCurrentStageIndex(0);

    // Progress stage simulation for smooth UI UX
    const interval = setInterval(() => {
      setCurrentStageIndex(prev => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      let analysisResult: FoodAnalysis;

      // Extract canvas visual features
      const visualAnalysis = await extractCanvasVisualFeatures(imagePreview);

      if (selectedFile) {
        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
        const base64Data = await base64Promise;

        analysisResult = await api.analyzeMeal({
          imageBase64: base64Data,
          mealType,
          userNotes,
          filename: selectedFile.name,
          visualAnalysis,
        });
      } else {
        // Image URL or captured dataUrl
        analysisResult = await api.analyzeMeal({
          imageBase64: imagePreview.startsWith('data:') ? imagePreview : undefined,
          imageUrl: !imagePreview.startsWith('data:') ? imagePreview : undefined,
          mealType,
          userNotes,
          visualAnalysis,
        });
      }

      clearInterval(interval);
      setCurrentStageIndex(stages.length - 1);
      setTimeout(() => {
        setLoading(false);
        onAnalysisComplete(analysisResult);
      }, 400);
    } catch (err: any) {
      clearInterval(interval);
      setLoading(false);
      setError(err.message || 'Failed to analyze food image. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/80">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multimodal Food Detection Pipeline</span>
          </div>

          {aiStatus?.configured ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gemini Vision Active</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium border border-amber-200 transition-colors cursor-pointer"
              title="Gemini API key missing"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Configure Gemini Key</span>
            </button>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Analyze Meal Nutrition from Photo
        </h1>
        <p className="text-sm text-slate-600">
          Upload or capture a plate photo. Gemini Vision identifies each food item, estimates portion grams, and returns accurate calories and macros.
        </p>
      </div>

      <AcademicDisclaimer />

      {/* Main Analysis Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-semibold">Analysis Notice</p>
                <p className="text-xs text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {qualityWarning && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-bold">Image Quality Notice: </span>
                <span>{qualityWarning}</span>
              </div>
            </div>
          )}

          {/* Camera Viewfinder */}
          {cameraActive && (
            <div className="relative rounded-2xl bg-black overflow-hidden flex flex-col items-center justify-center min-h-[360px]">
              <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[440px] object-cover" />
              <div className="absolute bottom-4 flex items-center gap-4">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Meal</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Dropzone & Preview */}
          {!cameraActive && (
            <div>
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
                  <img
                    src={imagePreview}
                    alt="Meal preview"
                    className="w-full h-72 sm:h-96 object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white/90 hover:bg-white text-slate-800 text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replace Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="px-4 py-2 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1">
                    Drag and drop your food photo here
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Supports JPG, PNG, WEBP files up to 10 MB
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Browse Files</span>
                    </button>

                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          )}

          {/* Quick 1-Click Sample Meal Presets for Instant Testing */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant Test Presets (Multi-Food Examples)</span>
              </span>
              <span className="text-[11px] text-slate-600">Click any preset to load</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {presetMeals.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className={`p-2 rounded-xl border text-left transition-all group cursor-pointer ${
                    imagePreview === preset.img
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={preset.img}
                    alt={preset.name}
                    className="w-full h-16 object-cover rounded-lg mb-1.5"
                  />
                  <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-700">
                    {preset.name}
                  </p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{preset.foods}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Meal Details Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Meal Type</label>
              <select
                value={mealType}
                onChange={e => setMealType(e.target.value as MealType)}
                className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preparation Notes (Optional)
              </label>
              <input
                type="text"
                value={userNotes}
                onChange={e => setUserNotes(e.target.value)}
                placeholder="e.g. Homestyle thali with less oil"
                className="w-full py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800"
              />
            </div>
          </div>

          {/* Analyze Action Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 max-w-md">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>“Nutrition values are estimates and may vary depending on ingredients, preparation method and portion size.” Multi-food recognition identifies all plate components.</span>
            </div>

            <button
              type="button"
              onClick={runAnalysis}
              disabled={loading || !imagePreview}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Meal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Meal Nutrition</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Multi-Stage Animated Processing Loader */}
          {loading && (
            <div className="mt-6 p-6 rounded-2xl bg-slate-900 text-white space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-bold text-emerald-400">
                    AI Food Vision Pipeline Active
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Stage {currentStageIndex + 1} of {stages.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%` }}
                />
              </div>

              {/* Stages List */}
              <div className="space-y-2 pt-2">
                {stages.map((stage, idx) => {
                  const isDone = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 text-xs transition-opacity ${
                        isCurrent
                          ? 'text-white font-semibold'
                          : isDone
                          ? 'text-emerald-400/90'
                          : 'text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border border-emerald-400 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                      )}
                      <div>
                        <span>{stage.title}</span>
                        {isCurrent && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {stage.desc}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Gemini Vision Setup</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Meal analysis uses <strong>VITE_GEMINI_API_KEY</strong> from your project <code className="text-xs bg-slate-100 px-1 rounded">.env</code> file.
              Set the key, restart <code className="text-xs bg-slate-100 px-1 rounded">npm run dev</code>, and analysis will work automatically.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
              <p>VITE_GEMINI_API_KEY=your-key-here</p>
            </div>

            <p className="text-xs text-slate-500">
              Get a free key at{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:underline font-medium"
              >
                Google AI Studio
              </a>
              . Runtime key entry is not supported in this SPA build for security.
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
