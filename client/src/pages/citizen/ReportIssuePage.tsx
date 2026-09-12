import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../services/api.js';
import { Button } from '../../components/common/Button.js';
import {
  Camera,
  MapPin,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Construction,
  Trash2,
  Droplets,
  Lightbulb,
  Waves
} from 'lucide-react';
import { ICategory, IWard, Priorities, PriorityLabels } from '@bmc/shared';

export const ReportIssuePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Form State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600'
  );
  const [address, setAddress] = useState<string>('Near City Center Road, Bhavnagar');
  const [coordinates, setCoordinates] = useState<[number, number]>([72.138, 21.753]);
  const [detectedWard, setDetectedWard] = useState<IWard | null>(null);
  const [isDetectingWard, setIsDetectingWard] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch Categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res: any = await api.get('/admin/categories');
      return res.data as ICategory[];
    }
  });

  const categories = categoriesData || [];

  // Auto-select category if passed in query param
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        const matched = categories.find((c) =>
          c.name.toLowerCase().includes(categoryParam.toLowerCase())
        );
        if (matched) setSelectedCategoryId(matched.id);
      } else {
        setSelectedCategoryId(categories[0].id);
      }
    }
  }, [categories, searchParams]);

  // Smart Ward Detection triggered on coordinate changes
  const runSmartWardDetection = async (lng: number, lat: number) => {
    setIsDetectingWard(true);
    try {
      const res: any = await api.get(`/geo/detect-ward?lng=${lng}&lat=${lat}`);
      if (res.data) {
        setDetectedWard(res.data);
      }
    } catch (e) {
      console.warn('Smart ward detection fallback', e);
    } finally {
      setIsDetectingWard(false);
    }
  };

  useEffect(() => {
    runSmartWardDetection(coordinates[0], coordinates[1]);
  }, [coordinates]);

  // Create Complaint Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        categoryId: selectedCategoryId,
        subcategory: subcategory || undefined,
        title,
        description,
        location: {
          coordinates,
          address
        },
        wardId: detectedWard?.id,
        priority: selectedCategory?.defaultPriority || Priorities.NORMAL,
        attachments: [
          {
            url: photoUrl,
            fileType: 'IMAGE'
          }
        ]
      };
      const res: any = await api.post('/complaints', payload);
      return res.data;
    },
    onSuccess: (data) => {
      navigate(`/citizen/ticket/${data.ticketId || data.id}`);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to submit complaint');
    }
  });

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const getCategoryIcon = (name: string) => {
    if (name.includes('Road')) return <Construction className="w-5 h-5 text-amber-600" />;
    if (name.includes('Garbage') || name.includes('Cleanliness'))
      return <Trash2 className="w-5 h-5 text-emerald-600" />;
    if (name.includes('Water')) return <Droplets className="w-5 h-5 text-blue-600" />;
    if (name.includes('Street') || name.includes('Light'))
      return <Lightbulb className="w-5 h-5 text-yellow-600" />;
    return <Waves className="w-5 h-5 text-indigo-600" />;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!selectedCategoryId) {
        setError('Please select a complaint category');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!title.trim() || !description.trim()) {
        setError('Please provide a title and description');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Report a Civic Issue</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Follow 3 simple steps to submit your complaint to Bhavnagar Municipal Corporation.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200">
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-civic-600' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-civic-600 text-white' : 'bg-slate-200'}`}>
            1
          </div>
          <span>Category</span>
        </div>
        <div className="w-8 h-0.5 bg-slate-200"></div>
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-civic-600' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-civic-600 text-white' : 'bg-slate-200'}`}>
            2
          </div>
          <span>Details & Photo</span>
        </div>
        <div className="w-8 h-0.5 bg-slate-200"></div>
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 3 ? 'text-civic-600' : 'text-slate-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-civic-600 text-white' : 'bg-slate-200'}`}>
            3
          </div>
          <span>Location & Submit</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Step 1: Category Picker */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800">Select Issue Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  if (cat.subcategories.length > 0) setSubcategory(cat.subcategories[0]);
                }}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                  selectedCategoryId === cat.id
                    ? 'border-civic-600 bg-civic-50/50 ring-2 ring-civic-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {getCategoryIcon(cat.name)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{cat.name}</div>
                  <div className="text-[11px] text-slate-500">{cat.subcategories?.slice(0, 2).join(', ')}</div>
                </div>
              </button>
            ))}
          </div>

          {selectedCategory && selectedCategory.subcategories?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Subcategory (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedCategory.subcategories.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubcategory(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      subcategory === sub
                        ? 'bg-civic-600 text-white border-civic-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button size="lg" className="gap-2" onClick={handleNext}>
              <span>Next: Add Details</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Details & Evidence */}
      {step === 2 && (
        <form onSubmit={handleNext} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole right in front of bus stop"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the condition, severity, and any landmarks..."
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Photo Evidence <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                <img src={photoUrl} alt="Complaint preview" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1.5 flex-1">
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Paste image URL or take photo"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  You can use camera upload or keep the sample demo photo.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button type="button" variant="outline" size="md" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button type="submit" size="lg" className="gap-2">
              <span>Next: Location</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Location Pinning & Smart Information */}
      {step === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Address / Area Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Rupani Circle, Ward 5"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-civic-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Smart Suggestion Card */}
          <div className="bg-civic-50/80 border border-civic-200/90 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-civic-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Smart Ward & Department Auto-Routing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-civic-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Detected Ward</span>
                <span className="font-bold text-slate-800">
                  {isDetectingWard ? 'Detecting...' : detectedWard ? `${detectedWard.name}` : 'Ward 5 - Kaliabid'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-civic-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Dept</span>
                <span className="font-bold text-slate-800">
                  {selectedCategory?.defaultDepartmentName || 'Road & Infrastructure'}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-civic-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Priority & SLA</span>
                <span className="font-bold text-amber-700">
                  {PriorityLabels[selectedCategory?.defaultPriority || Priorities.NORMAL]}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <Button type="button" variant="outline" size="md" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="gap-2"
              isLoading={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Submit Complaint</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
