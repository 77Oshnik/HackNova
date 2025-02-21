"use client";
import WorldMap from "@/components/ui/world-map";
import { motion } from "framer-motion";

export default function WorldMapDemo() {
  return (
    <div className="relative h-full w-full min-h-screen">
      {/* Text content positioned above the map */}
      <div className="relative z-10 pt-20 mb-36">
        <div className="max-w-7xl mx-auto text-center px-4">
          <p className="font-bold text-xl md:text-4xl mb-4">
            Remote{" "}
            <span className="text-neutral-400">
              {"Connectivity".split("").map((word, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.04 }}>
                  {word}
                </motion.span>
              ))}
            </span>
          </p>
          <div className="max-w-2xl mx-auto">
            <p className="text-sm md:text-lg text-neutral-500 mb-8">
              Break free from traditional boundaries. Work from anywhere, at the
              comfort of your own studio apartment. Perfect for Nomads and
              Travellers.
            </p>
          </div>
        </div>
      </div>

      {/* World map */}
      <div className="absolute top-0 left-0 w-full h-full">
        <WorldMap
          className="w-full h-full"
          dots={[
            {
              start: {
                lat: 64.2008,
                lng: -149.4937,
              }, // Alaska (Fairbanks)
              end: {
                lat: 34.0522,
                lng: -118.2437,
              }, // Los Angeles
            },
            {
              start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
              end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
            },
            {
              start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
              end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
            },
            {
              start: { lat: 51.5074, lng: -0.1278 }, // London
              end: { lat: 28.6139, lng: 77.209 }, // New Delhi
            },
            {
              start: { lat: 28.6139, lng: 77.209 }, // New Delhi
              end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
            },
            {
              start: { lat: 28.6139, lng: 77.209 }, // New Delhi
              end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
            },
          ]} />
      </div>
    </div>
  );
}
