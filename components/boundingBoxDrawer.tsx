import React, { useRef, useEffect } from 'react';

const BoundingBoxDrawer = ({ imageUrl, boxes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const image = new Image();
    image.src = imageUrl;
    image.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (canvas && ctx) {
        // Resize the image to fit within 640x640 while maintaining aspect ratio
        const maxDimension = 640;
        let { width, height } = image;
        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);

        // Define a list of colors
        const colors = [
            'red', 'green', 'blue', 'yellow', 'orange', 'pink', 'purple', 'brown', 'gray', 'beige',
            'turquoise', 'cyan', 'magenta', 'lime', 'navy', 'maroon', 'teal', 'olive', 'coral', 'lavender',
            'violet', 'gold', 'silver'
          ];

        // Scale the bounding boxes to match the resized image
        const xScale = width / image.width;
        const yScale = height / image.height;

        boxes.forEach((box, i) => {
          // Convert normalized coordinates to absolute coordinates
          let [y1, x1, y2, x2] = box.box_2d;
          y1 = (y1 / 1000) * height;
          x1 = (x1 / 1000) * width;
          y2 = (y2 / 1000) * height;
          x2 = (x2 / 1000) * width;

          // Ensure coordinates are in the correct order
          if (x1 > x2) [x1, x2] = [x2, x1];
          if (y1 > y2) [y1, y2] = [y2, y1];

          const color = colors[i % colors.length];

          ctx.beginPath();
          ctx.rect(x1, y1, x2 - x1, y2 - y1);
          ctx.lineWidth = 2;
          ctx.strokeStyle = color;
          ctx.stroke();
          ctx.font = '12px Arial';
          ctx.fillStyle = color;
          ctx.fillText(box.label, x1 + 8, y1 + 6);
        });
      }
    };
  }, [imageUrl, boxes]);

  return <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />;
};

export default BoundingBoxDrawer;