"use client"

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from "../../lib/utils"

interface TimelineProps {
  events: {
    startTime: number;
    endTime: number;
    type: 'normal' | 'warning';
    label: string;
  }[];
  totalDuration: number;
  currentTime?: number;
}

export function Timeline({ events, totalDuration, currentTime = 0 }: TimelineProps) {
  const [hoveredEvent, setHoveredEvent] = useState<{
    event: TimelineProps['events'][0],
    position: { x: number, y: number }
  } | null>(null);
  return (
    <>
      <div className="w-full overflow-hidden">
        <div className="relative w-full h-24 bg-gray-800 overflow-x-auto">
          <div className="absolute w-full min-w-full">
            {/* Timeline base */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-600 transform -translate-y-1/2">
              {/* Time markers */}
              {Array.from({ length: 14 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute h-3 w-px bg-gray-500"
                  style={{
                    left: `${(i / 13) * 100}%`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 whitespace-nowrap">
                    {Math.floor((i / 13) * totalDuration)}s
                  </span>
                </div>
              ))}
            </div>

            {/* Events */}
            {events.map((event, index) => {
              const startPercentage = (event.startTime / totalDuration) * 100;
              const duration = ((event.endTime - event.startTime) / totalDuration) * 100;
              
              return (
                <div
                  key={index}
                  className={cn(
                    "absolute h-2 rounded-full cursor-pointer",
                    event.type === 'warning' ? 'bg-red-500 hover:bg-red-400' : 'bg-blue-500 hover:bg-blue-400'
                  )}
                  style={{
                    left: `${startPercentage}%`,
                    width: `${duration}%`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredEvent({
                      event,
                      position: {
                        x: rect.left + (rect.width / 2),
                        y: rect.top - 20
                      }
                    });
                  }}
                  onMouseLeave={() => setHoveredEvent(null)}
                >

                </div>
              );
            })}

            {/* Current time indicator */}
            {currentTime > 0 && (
              <div
                className="absolute w-0.5 h-8 bg-white"
                style={{
                  left: `${(currentTime / totalDuration) * 100}%`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            )}
          </div>
        </div>
      </div>
      {hoveredEvent && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed px-4 py-3 bg-gray-800/95 text-white text-sm pointer-events-none z-50 w-[250px] shadow-xl border border-gray-700/50 transition-opacity duration-200"
          style={{
            left: `${hoveredEvent.position.x}px`,
            top: `${hoveredEvent.position.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-medium text-sm mb-1.5">{hoveredEvent.event.label}</div>
          <div className="text-gray-300 text-xs flex justify-between items-center">
            <span>
              Time: {Math.floor(hoveredEvent.event.startTime / 60)}:
              {String(Math.floor(hoveredEvent.event.startTime % 60)).padStart(2, '0')}
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded",
              hoveredEvent.event.type === 'warning' ? 'bg-red-500/20 text-red-200' : 'bg-blue-500/20 text-blue-200'
            )}>
              {hoveredEvent.event.type === 'warning' ? 'Warning' : 'Normal'}
            </span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
