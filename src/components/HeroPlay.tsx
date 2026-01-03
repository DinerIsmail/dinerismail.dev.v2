import useAudio from '@/hooks/useAudio'
import { cn } from '@/lib/utils'
import { Play, Square } from 'lucide-react'

export default function HeroPlay() {
  const [audio, state, controls] = useAudio({
    src: '/assets/pronunciation.mp3',
    autoPlay: false,
  })

  const play = () => {
    controls.play()
  }

  const stop = () => {
    controls.pause()
    controls.seek(0)
  }

  const toggle = () => {
    if (state.playing) {
      stop()
    } else {
      play()
    }
  }

  return (
    <>
      {audio}
      <button
        onClick={toggle}
        aria-label="Play pronunciation track"
        className={cn(
          'flex cursor-pointer items-center justify-center',
          'rounded-full',
          'h-12 w-12 md:h-8 md:w-8',
          'text-[#34d399]',
          'hover:opacity-80',
          'transition-opacity',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        )}
      >
        {state.playing ? (
          <Square className="h-full w-full" />
        ) : (
          <Play className="h-full w-full" />
        )}
      </button>
    </>
  )
}
