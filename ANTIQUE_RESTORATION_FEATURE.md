# Antique Image Restoration Feature

## Overview
This feature allows users to upload images of old, rusted, or broken antique items and get an enhanced version with AI-powered analysis and restoration guidance.

## How It Works

### 1. Image Upload
- Users can drag and drop an image or click to browse and select an antique item image
- Supported formats: All standard image formats (JPEG, PNG, etc.)

### 2. AI Analysis
The system uses **Groq AI** models to analyze the antique:
- **Vision Model** (`llama-3.2-90b-vision-preview`): Analyzes the image to understand what the antique would look like when brand new
- **Text Model** (`llama-3.3-70b-versatile`): Generates a detailed restoration guide based on the analysis

### 3. Image Enhancement
The system applies Cloudinary transformations to enhance the image quality:
- Sharpening (100%)
- Contrast enhancement (20%)
- Vibrance boost (30%)
- Brightness adjustment (10%)
- Saturation increase (20%)
- Auto color correction
- Auto contrast

### 4. Results Display
The UI shows:
- **Original Image**: The uploaded antique item
- **Enhanced Image**: The image with applied transformations
- **AI Analysis**: Detailed description of what the antique would look like when new
- **Restoration Guide**: Step-by-step guidance on how to restore the item

## Technical Stack

- **Frontend**: Next.js 15.5.6, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **AI**: Groq SDK with Vision and Text models
- **Image Storage**: Cloudinary
- **Image Processing**: Cloudinary Transformations

## Environment Variables Required

```bash
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## API Endpoint

### POST `/api/restore`

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field containing the image

**Response:**
```json
{
  "uploadedUrl": "https://cloudinary.com/...",
  "restoredImageUrl": "https://cloudinary.com/...",
  "restorationDescription": "AI-generated description...",
  "restorationGuide": "Detailed restoration guide..."
}
```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. Upload an image of an old/rusted antique item

4. Click "Restore Image" button

5. View the results with side-by-side comparison and AI insights

## Features

- ✅ Drag and drop file upload
- ✅ Image preview before processing
- ✅ AI-powered antique analysis
- ✅ Cloudinary-based image enhancement
- ✅ Side-by-side comparison view
- ✅ Restoration guide generation
- ✅ Responsive design with antique-themed UI
- ✅ Error handling and loading states

## Future Enhancements

- Add support for actual AI image generation/restoration (when available)
- Implement image history and gallery
- Add download functionality for enhanced images
- Support batch processing of multiple images
- Add more sophisticated image restoration algorithms
