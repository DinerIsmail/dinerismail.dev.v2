import { Play, Square } from "lucide-react";
import useAudio from "@/hooks/useAudio";
import { cn } from "@/lib/utils";

export default function HeroPlay() {
  const [audio, state, controls] = useAudio({
    src: "/assets/pronunciation.mp3",
    autoPlay: false,
  });

  const play = () => {
    controls.play();
  };

  const stop = () => {
    controls.pause();
    controls.seek(0);
  };

  const toggle = () => {
    if (state.playing) {
      stop();
    } else {
      play();
    }
  };

  return (
    <>
      {audio}
      <button
        onClick={toggle}
        aria-label="Play pronunciation track"
        className={cn(
          "flex items-center justify-center cursor-pointer",
          "rounded-full",
          "w-12 h-12 md:w-8 md:h-8",
          "text-[#34d399]",
          "hover:opacity-80",
          "transition-opacity",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {state.playing ? (
          <Square className="w-full h-full" />
        ) : (
          <Play className="w-full h-full" />
        )}
      </button>
    </>
  );
}

