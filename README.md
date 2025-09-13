# Celebrity Merge App - VIP Photo Fusion

A modern React web application that merges user photos with celebrity images using Google's Gemini 2.5 Flash Image Preview model. Create stunning photo combinations with custom backgrounds and AI-powered image generation.

## Features

- 📸 **Dual Image Upload**: Upload your selfie and a celebrity photo
- 🎨 **Pre-defined Backgrounds**: Choose from 5 stunning background options
- ✨ **Custom Background Prompts**: Create your own unique scenes
- 🤖 **AI-Powered Merging**: Uses Gemini 2.5 Flash Image Preview for high-quality results
- 📱 **Responsive Design**: Beautiful, modern UI that works on all devices
- 💾 **Download Results**: Save your generated images instantly

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Google AI API key (Gemini API)

## Setup Instructions

1. **Clone or download the project**
   ```bash
   cd celebrity-merge-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get your Google AI API key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

4. **Configure the API key**
   - Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   - Open `.env` and replace `your_api_key_here` with your actual API key:
   ```bash
   VITE_GEMINI_API_KEY=your-actual-api-key-here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Start creating amazing photo merges!

## Usage

1. **Upload Images**: Click on the upload areas to select your selfie and a celebrity photo
2. **Choose Background**: Select from pre-defined options or type your own custom background
3. **Generate**: Click "Create Your Slay!" to generate your merged photo
4. **Download**: Save your result with the download button

## Background Options

- Red Carpet Premiere
- Tropical Beach Paradise
- Futuristic Spaceship Lounge
- Cozy Coffee Shop Corner
- Vibrant Music Festival

## Custom Backgrounds

You can create any custom background by typing in the text input. Examples:
- "in a magical castle at sunset"
- "on a luxury yacht in Monaco"
- "at a high-end fashion show"
- "in a cozy mountain cabin"

## Technical Details

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 2.5 Flash Image Preview
- **Icons**: Custom SVG icons (no external dependencies)
- **File Structure**: Single-file React component for easy deployment

## API Usage

The app uses Google's Gemini API with the following configuration:
- Model: `gemini-2.5-flash-image-preview`
- Response modalities: TEXT and IMAGE
- Input: Two images + text prompt
- Output: Generated merged image

## Environment Variables

The app uses environment variables for configuration:

- **VITE_GEMINI_API_KEY**: Your Google AI API key for Gemini access

**Important Security Notes:**
- Never commit your `.env` file to version control
- The `.env` file is already included in `.gitignore`
- Use `.env.example` as a template for other developers
- In production, set environment variables through your hosting platform

## Troubleshooting

**API Key Issues:**
- Ensure your API key is correctly set in the `.env` file
- Verify the API key has access to the Gemini API
- Check that billing is enabled for your Google Cloud project
- Make sure the `.env` file is in the project root directory

**Image Upload Issues:**
- Supported formats: JPG, PNG, GIF, WebP
- Maximum file size: Check your browser's file upload limits
- Ensure images are clear and well-lit for best results

**Generation Errors:**
- Try different images if generation fails
- Check the browser console for detailed error messages
- Ensure stable internet connection

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the app.

---

**Note**: Remember to keep your API key secure and never commit it to version control. Consider using environment variables for production deployments.
