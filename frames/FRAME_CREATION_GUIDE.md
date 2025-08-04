# Example Frame Creation

To create a simple custom frame, you can use any image editor. Here's an example of how to create a basic vintage-style frame:

## Method 1: Using Canva (Free Online Tool)
1. Go to canva.com and create a new custom design (1000x1000px)
2. Add a rectangle border around the edges (leave center transparent)
3. Add vintage decorative elements in the corners
4. Download as PNG with transparent background
5. Save as `vintage-border.png` in the frames folder

## Method 2: Using GIMP (Free Software)
1. Open GIMP and create new image (1000x1000px)
2. Add a layer with border design
3. Use selection tools to cut out center area
4. Add decorative elements around edges
5. Export as PNG with transparency

## Method 3: Using AI Tools
You can also use AI image generators like:
- DALL-E
- Midjourney  
- Stable Diffusion

Prompt examples:
- "Vintage photo frame border, transparent center, decorative corners, PNG"
- "Elegant golden picture frame, ornate design, empty center for photo"
- "Retro polaroid frame border, white background, transparent middle"

## Testing Your Frame
1. Add the PNG file to the `frames/` folder
2. Add entry to `frames.json`:
```json
{
  "id": "my-custom-frame",
  "name": "CUSTOM",
  "filename": "my-frame.png",
  "description": "My custom frame design"
}
```
3. Refresh the app and test!

Remember: The photo will appear in the center at 80% of the frame size, so design accordingly.
