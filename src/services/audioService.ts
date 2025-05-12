import { useRef, useEffect, useState } from 'react';

// Define mood types that can have associated sounds
export type MoodType = 'calm' | 'tense' | 'joyful' | 'melancholic';

// Map of audio URLs - these would be replaced with actual audio files
const audioSources: Record<MoodType, string> = {
    calm: 'https://example.com/sounds/calm-ambient.mp3',
    tense: 'https://example.com/sounds/tense-ambient.mp3',
    joyful: 'https://example.com/sounds/joyful-ambient.mp3',
    melancholic: 'https://example.com/sounds/melancholic-ambient.mp3'
};

interface UseAmbientSoundOptions {
    volume?: number;
    fadeTime?: number;
    enabled?: boolean;
}

// Hook to manage ambient sounds for different moods
export const useAmbientSound = (options: UseAmbientSoundOptions = {}) => {
    const {
        volume = 0.2,
        fadeTime = 1000,
        enabled = false
    } = options;

    const [currentMood, setCurrentMood] = useState<MoodType | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Refs for audio elements
    const audioElements = useRef<Record<MoodType, HTMLAudioElement | null>>({
        calm: null,
        tense: null,
        joyful: null,
        melancholic: null
    });

    // Create audio elements
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Only initialize if audio is enabled
        if (!enabled) return;

        // Create audio elements for each mood
        (Object.keys(audioSources) as MoodType[]).forEach(mood => {
            const audio = new Audio();
            audio.src = audioSources[mood];
            audio.loop = true;
            audio.volume = 0;
            audio.preload = 'auto';
            audioElements.current[mood] = audio;
        });

        // Clean up on unmount
        return () => {
            (Object.keys(audioSources) as MoodType[]).forEach(mood => {
                const audio = audioElements.current[mood];
                if (audio) {
                    audio.pause();
                    audio.src = '';
                }
            });
        };
    }, [enabled]);

    // Function to change the current mood with fade effect
    const changeMood = (newMood: MoodType | null) => {
        if (!enabled) return;

        setCurrentMood(newMood);

        if (!newMood) {
            // Fade out all sounds
            (Object.keys(audioSources) as MoodType[]).forEach(mood => {
                fadeOut(mood);
            });
            setIsPlaying(false);
            return;
        }

        // Start playing new mood and fade in
        const audioElement = audioElements.current[newMood];
        if (audioElement) {
            audioElement.play().catch(error => {
                console.warn('Audio playback was prevented:', error);
            });

            // Fade out all other audio
            (Object.keys(audioSources) as MoodType[]).forEach(mood => {
                if (mood !== newMood) {
                    fadeOut(mood);
                }
            });

            // Fade in the new audio
            fadeIn(newMood);
            setIsPlaying(true);
        }
    };

    // Helper function to fade in audio
    const fadeIn = (mood: MoodType) => {
        const audio = audioElements.current[mood];
        if (!audio) return;

        const finalVolume = isMuted ? 0 : volume;

        let currentVolume = audio.volume;
        const interval = window.setInterval(() => {
            currentVolume = Math.min(currentVolume + 0.05, finalVolume);
            audio.volume = currentVolume;

            if (currentVolume >= finalVolume) {
                clearInterval(interval);
            }
        }, fadeTime / 20);
    };

    // Helper function to fade out audio
    const fadeOut = (mood: MoodType) => {
        const audio = audioElements.current[mood];
        if (!audio) return;

        let currentVolume = audio.volume;
        const interval = window.setInterval(() => {
            currentVolume = Math.max(currentVolume - 0.05, 0);
            audio.volume = currentVolume;

            if (currentVolume <= 0) {
                clearInterval(interval);
                audio.pause();
            }
        }, fadeTime / 20);
    };

    // Toggle mute state
    const toggleMute = () => {
        setIsMuted(!isMuted);

        (Object.keys(audioSources) as MoodType[]).forEach(mood => {
            const audio = audioElements.current[mood];
            if (audio) {
                if (!isMuted) {
                    // Muting
                    audio.volume = 0;
                } else if (mood === currentMood) {
                    // Unmuting current mood
                    audio.volume = volume;
                }
            }
        });
    };

    return {
        currentMood,
        changeMood,
        isPlaying,
        isMuted,
        toggleMute
    };
}; 