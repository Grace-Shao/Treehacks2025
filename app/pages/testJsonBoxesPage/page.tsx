"use client"
import BoundingBoxDrawer from '@/components/boundingBoxDrawer';

const boxes = [
    {"box_2d": [400, 68, 546, 202], "label": "red sprinkles"},
    {"box_2d": [447, 254, 540, 371], "label": "pink frosting with sprinkles"},
    {"box_2d": [460, 435, 569, 564], "label": "pink frosting with eyes"},
    {"box_2d": [420, 561, 526, 667], "label": "pink frosting with blue sprinkles"},
    {"box_2d": [569, 68, 680, 194], "label": "white frosting with colorful sprinkles"},
    {"box_2d": [562, 297, 699, 447], "label": "white frosting with sprinkles and eyes"},
    {"box_2d": [572, 564, 699, 701], "label": "white frosting with sprinkles and eyes"},
    {"box_2d": [578, 701, 677, 827], "label": "white frosting with colorful sprinkles"},
    {"box_2d": [490, 825, 643, 964], "label": "white frosting with colorful sprinkles"},
    {"box_2d": [656, 350, 807, 497], "label": "white frosting with two eyes"},
    {"box_2d": [687, 111, 865, 287], "label": "white frosting with two eyes"},
    {"box_2d": [380, 740, 511, 862], "label": "chocolate frosting"},
    {"box_2d": [368, 556, 433, 644], "label": "pink frosting"},
    {"box_2d": [366, 418, 454, 523], "label": "pink frosting"}
];

export default function ImageWithBoundingBoxes() {
    const imageUrl = '/cupcakes.png'; 
  
    return (
      <main className="flex flex-col items-center justify-center bg-black p-4 min-h-screen">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Bounding Boxes on Image</h1>
          <BoundingBoxDrawer imageUrl={imageUrl} boxes={boxes} />
        </div>
      </main>
    );
  }