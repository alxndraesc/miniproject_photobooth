# Developer Custom Frames Guide for Photobooth App

## Overview
This photobooth app now supports developer-controlled custom frames. Instead of allowing users to upload frames, you (the developer) can add pre-approved, high-quality frames directly to the project.

## Adding Custom Frames

### Step 1: Prepare Your Frame Images
1. Create or obtain frame images in PNG format (recommended for transparency)
2. Ensure frames have transparent centers where photos will appear
3. Recommended dimensions: 1000x1000px or larger for best quality
4. Keep file sizes reasonable (under 2MB each)

### Step 2: Add Frame Files
1. Place your frame image files in the `frames/` folder
2. Use descriptive filenames (e.g., `vintage-border.png`, `golden-frame.png`)

### Step 3: Update frames.json Configuration
Edit `frames/frames.json` to include your new frames:

```json
[
  {
    "id": "vintage-border",
    "name": "VINTAGE",
    "filename": "vintage-border.png",
    "description": "Classic vintage border"
  },
  {
    "id": "golden-frame",
    "name": "GOLDEN", 
    "filename": "golden-frame.png",
    "description": "Elegant golden frame"
  }
]
```

### Configuration Properties:
- `id`: Unique identifier (used internally)
- `name`: Display name (shown to users, keep short)
- `filename`: Exact filename in the frames folder
- `description`: Tooltip text shown on hover

## Frame Design Guidelines

### Transparent Centers
- The photo will be placed in the center at 80% of the frame size
- Make sure the central area is transparent or minimal
- Test with sample photos to ensure good visibility

### Aspect Ratios
- Frames can be any aspect ratio
- Photos will be scaled to fit within the frame proportionally
- Square frames (1:1) work well for most photos

### Design Elements
- Keep decorative elements around the edges
- Use consistent styling that matches your app's aesthetic
- Consider vintage/retro themes to match the photobooth concept

## Example Frame Ideas

### Basic Decorative Frames
- Simple colored borders
- Rounded corner frames
- Drop shadow effects

### Themed Frames
- Vintage polaroid style
- Film strip borders  
- Holiday/seasonal themes
- Wedding or special event frames

### Artistic Frames
- Hand-drawn borders
- Watercolor effects
- Geometric patterns
- Textured backgrounds

## Implementation Details

### Loading Process
1. App loads `frames/frames.json` on startup
2. Validates that each frame image file exists
3. Creates frame selection buttons dynamically
4. Only displays frames that load successfully

### Photo Processing
1. User takes photo with selected frame
2. Photo is scaled to fit within frame (80% size)
3. Photo is centered within the frame
4. Frame is overlaid on top of the photo
5. Final composite image is created for download

### Error Handling
- Missing frame files are logged but don't break the app
- Invalid JSON in frames.json shows empty custom frames section
- Network errors loading frames show appropriate fallbacks

## File Structure
```
photobooth/
├── frames/
│   ├── frames.json          # Frame configuration
│   ├── vintage-border.png   # Frame image files
│   ├── golden-frame.png
│   └── README.txt
├── index.html
├── script.js
├── styles.css
└── CUSTOM_FRAMES_GUIDE.md
```

## Testing New Frames

1. Add your frame image to the `frames/` folder
2. Update `frames.json` with the new frame configuration
3. Refresh the photobooth app
4. Check that your frame appears in the Custom Frames section
5. Take a test photo to verify the frame applies correctly
6. Test with different photo orientations and content

## Best Practices

### Performance
- Optimize frame images (compress without losing quality)
- Use appropriate file formats (PNG for transparency, JPG for solid backgrounds)
- Limit the number of custom frames to avoid overwhelming users

### Quality Control
- Test frames with various photo types and lighting conditions
- Ensure frames work well with both portrait and landscape photos
- Maintain consistent visual style across all frames

### User Experience
- Use clear, descriptive names for frames
- Provide helpful descriptions in tooltips
- Order frames logically in the JSON file (popular ones first)

## Troubleshooting

### Frame Not Appearing
1. Check that the image file exists in the `frames/` folder
2. Verify the filename in `frames.json` matches exactly
3. Check browser console for loading errors
4. Ensure the JSON syntax is valid

### Frame Not Applying Correctly
1. Verify the frame image has transparent areas for the photo
2. Check that the frame image loads properly in a browser
3. Test with different photo sizes and orientations
4. Review browser console for JavaScript errors

### Performance Issues
1. Reduce frame image file sizes
2. Limit the number of active frames
3. Use appropriate image compression
4. Consider lazy loading for large frame collections

This system gives you complete control over the frames available to users while maintaining a clean, professional experience.
