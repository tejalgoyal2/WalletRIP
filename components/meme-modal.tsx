'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemeModalProps {
    term: string;
    isOpen: boolean;
    onClose: () => void;
}

export function MemeModal({ term, isOpen, onClose }: MemeModalProps) {
    const [gifUrl, setGifUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && term) {
            const fetchGif = async () => {
                try {
                    const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
                    if (!apiKey) {
                        console.warn('GIPHY API Key missing');
                        return;
                    }
                    const res = await fetch(
                        `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=${encodeURIComponent(term)}&rating=pg-13`
                    );
                    const data = await res.json();
                    if (data.data?.images?.original?.url) {
                        setGifUrl(data.data.images.original.url);
                    }
                } catch (error) {
                    console.error('Failed to fetch GIF:', error);
                }
            };

            fetchGif();

            const timer = setTimeout(() => {
                onClose();
                setGifUrl(null); // Reset for next time
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isOpen, term, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative max-w-lg w-full bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800"
                    >
                        <div className="p-4 text-center">
                            <h3 className="text-xl font-bold text-white mb-2 capitalize">
                                {term}
                            </h3>
                            <div className="aspect-video w-full bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
                                {gifUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={gifUrl}
                                        alt={term}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-zinc-500 animate-pulse">Loading meme...</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
