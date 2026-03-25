import express, { Request, Response } from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";

const router = express.Router();

// Store files in memory (max 10 MB per file)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
  },
});

/**
 * POST /api/upload/portfolio
 * Accepts up to 5 images, uploads each to S3, returns the URLs.
 * Requires authentication.
 */
router.post(
  "/portfolio",
  async (req: Request, res: Response, next) => {
    // Verify session before processing files
    try {
      const user = await sdk.authenticateRequest(req);
      (req as any).authUser = user;
      next();
    } catch {
      res.status(401).json({ error: "Unauthorized" });
    }
  },
  upload.array("images", 5),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).authUser;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({ error: "No images provided" });
        return;
      }

      const uploadedUrls: string[] = [];

      for (const file of files) {
        const ext = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
        const key = `portfolio/${user.id}/${nanoid(12)}.${ext}`;
        const { url } = await storagePut(key, file.buffer, file.mimetype);
        uploadedUrls.push(url);
      }

      res.json({ urls: uploadedUrls });
    } catch (err: any) {
      console.error("[Upload] Portfolio upload error:", err);
      res.status(500).json({ error: err.message || "Upload failed" });
    }
  }
);

/**
 * POST /api/upload/avatar
 * Accepts a single avatar image, uploads to S3, returns the URL.
 * Requires authentication.
 */
router.post(
  "/avatar",
  async (req: Request, res: Response, next) => {
    try {
      const user = await sdk.authenticateRequest(req);
      (req as any).authUser = user;
      next();
    } catch {
      res.status(401).json({ error: "Unauthorized" });
    }
  },
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).authUser;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "No image provided" });
        return;
      }

      const ext = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
      const key = `avatars/${user.id}/${nanoid(12)}.${ext}`;
      const { url } = await storagePut(key, file.buffer, file.mimetype);

      res.json({ url });
    } catch (err: any) {
      console.error("[Upload] Avatar upload error:", err);
      res.status(500).json({ error: err.message || "Upload failed" });
    }
  }
);

// Handle multer errors (file size, type, etc.)
router.use((err: any, _req: Request, res: Response, _next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ error: "File too large. Maximum size is 10 MB." });
      return;
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      res.status(400).json({ error: "Too many files. Maximum is 5 images at once." });
      return;
    }
  }
  res.status(400).json({ error: err.message || "Upload error" });
});

export default router;
