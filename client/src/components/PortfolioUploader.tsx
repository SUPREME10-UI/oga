import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { Camera, Upload, X, ImagePlus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  status: "uploading" | "done" | "error";
  progress: number;
  errorMsg?: string;
}

interface PortfolioUploaderProps {
  /** Currently saved portfolio image URLs (from the database) */
  existingImages?: string[];
  /** Called whenever the full list of URLs changes (existing + newly uploaded) */
  onChange: (urls: string[]) => void;
  /** Maximum total images allowed */
  maxImages?: number;
  /** Whether the uploader is in a disabled state */
  disabled?: boolean;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function PortfolioUploader({
  existingImages = [],
  onChange,
  maxImages = 10,
  disabled = false,
}: PortfolioUploaderProps) {
  const [uploads, setUploads] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // All URLs = existing (not removed) + successfully uploaded
  const existingSet = new Set(existingImages);
  const [removedExisting, setRemovedExisting] = useState<Set<string>>(new Set());
  const activeExisting = existingImages.filter((u) => !removedExisting.has(u));
  const doneUploads = uploads.filter((u) => u.status === "done");
  const totalImages = activeExisting.length + doneUploads.length;

  const notifyParent = useCallback(
    (newUploads: UploadedImage[], removed: Set<string>) => {
      const existing = existingImages.filter((u) => !removed.has(u));
      const fresh = newUploads.filter((u) => u.status === "done").map((u) => u.url);
      onChange([...existing, ...fresh]);
    },
    [existingImages, onChange]
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const remaining = maxImages - totalImages;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }
      const toUpload = files.slice(0, remaining);

      // Create pending entries immediately for instant feedback
      const pending: UploadedImage[] = toUpload.map((file) => ({
        id: generateId(),
        url: URL.createObjectURL(file),
        name: file.name,
        status: "uploading",
        progress: 0,
      }));
      setUploads((prev) => [...prev, ...pending]);

      // Upload each file individually so we can track per-file progress
      for (let i = 0; i < toUpload.length; i++) {
        const file = toUpload[i];
        const entry = pending[i];

        try {
          // Simulate progress with XHR for real progress events
          const url = await uploadWithProgress(file, (pct) => {
            setUploads((prev) =>
              prev.map((u) => (u.id === entry.id ? { ...u, progress: pct } : u))
            );
          });

          setUploads((prev) => {
            const updated = prev.map((u) =>
              u.id === entry.id
                ? { ...u, status: "done" as const, url, progress: 100 }
                : u
            );
            notifyParent(updated, removedExisting);
            return updated;
          });
        } catch (err: any) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === entry.id
                ? { ...u, status: "error" as const, errorMsg: err.message || "Upload failed" }
                : u
            )
          );
          toast.error(`Failed to upload ${file.name}: ${err.message || "Unknown error"}`);
        }
      }
    },
    [maxImages, totalImages, notifyParent, removedExisting]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) uploadFiles(files);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length) uploadFiles(files);
  };

  const removeExisting = (url: string) => {
    const updated = new Set(removedExisting).add(url);
    setRemovedExisting(updated);
    notifyParent(uploads, updated);
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      notifyParent(updated, removedExisting);
      return updated;
    });
  };

  const retryUpload = (id: string) => {
    // Remove the failed entry and let user re-select
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const canAddMore = totalImages < maxImages && !disabled;

  return (
    <div className="space-y-4">
      {/* Drop zone / trigger area */}
      {canAddMore && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer
            ${isDragging
              ? "border-amber-500 bg-amber-50 scale-[1.01]"
              : "border-amber-300 bg-amber-50/50 hover:border-amber-500 hover:bg-amber-50"
            }
          `}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          aria-label="Upload portfolio images"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
              <ImagePlus className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">
                {isDragging ? "Drop images here" : "Add Portfolio Photos"}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Drag & drop or tap to choose from gallery
              </p>
              <p className="text-xs text-amber-600 mt-1">
                JPEG, PNG, WebP · Max 10 MB each · Up to {maxImages} photos
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-amber-400 text-amber-800 hover:bg-amber-100"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-1.5" />
                Gallery
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-amber-400 text-amber-800 hover:bg-amber-100"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 mr-1.5" />
                Camera
              </Button>
            </div>
          </div>

          {/* Hidden inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          {/* Camera input — capture="environment" opens rear camera on mobile */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Image grid */}
      {(activeExisting.length > 0 || uploads.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Existing saved images */}
          {activeExisting.map((url) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-amber-200 bg-amber-50">
              <img
                src={url}
                alt="Portfolio"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Saved badge */}
              <div className="absolute bottom-1 left-1">
                <span className="text-xs bg-green-600/80 text-white px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Saved
                </span>
              </div>
              {/* Remove button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeExisting(url)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-md"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {/* Newly uploaded / uploading images */}
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className={`relative group aspect-square rounded-lg overflow-hidden border-2 bg-amber-50 ${
                upload.status === "error"
                  ? "border-red-300"
                  : upload.status === "done"
                  ? "border-green-300"
                  : "border-amber-300"
              }`}
            >
              <img
                src={upload.url}
                alt={upload.name}
                className={`w-full h-full object-cover transition-opacity ${
                  upload.status === "uploading" ? "opacity-60" : "opacity-100"
                }`}
                loading="lazy"
              />

              {/* Uploading overlay */}
              {upload.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
                  <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
                  <div className="w-3/4 bg-white/30 rounded-full h-1.5">
                    <div
                      className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                  <span className="text-white text-xs mt-1">{upload.progress}%</span>
                </div>
              )}

              {/* Done badge */}
              {upload.status === "done" && (
                <div className="absolute bottom-1 left-1">
                  <span className="text-xs bg-green-600/80 text-white px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Uploaded
                  </span>
                </div>
              )}

              {/* Error overlay */}
              {upload.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/60 p-2">
                  <AlertCircle className="w-6 h-6 text-white mb-1" />
                  <p className="text-white text-xs text-center leading-tight">
                    {upload.errorMsg || "Upload failed"}
                  </p>
                  <button
                    type="button"
                    onClick={() => retryUpload(upload.id)}
                    className="mt-2 text-xs bg-white text-red-700 px-2 py-0.5 rounded-full font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Remove button for done uploads */}
              {upload.status === "done" && !disabled && (
                <button
                  type="button"
                  onClick={() => removeUpload(upload.id)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-md"
                  aria-label="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-amber-700">
        {totalImages} / {maxImages} photos added
        {totalImages >= maxImages && (
          <span className="ml-1 text-amber-600 font-medium">(maximum reached)</span>
        )}
      </p>
    </div>
  );
}

/**
 * Upload a single file to /api/upload/portfolio using XHR so we get real progress events.
 */
async function uploadWithProgress(
  file: File,
  onProgress: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("images", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.urls && data.urls.length > 0) {
            resolve(data.urls[0]);
          } else {
            reject(new Error("No URL returned from server"));
          }
        } catch {
          reject(new Error("Invalid server response"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.open("POST", "/api/upload/portfolio");
    xhr.withCredentials = true; // send session cookie
    xhr.send(formData);
  });
}
