import { useCallback, useRef, useState } from "react";
import { VocabularySubject } from "../../db/subjects";
import SpeakerIcon from "../SpeakerIcon";

export default function ReadingWithAudio({
  reading,
  vocabulary,
}: {
  reading: string;
  vocabulary: VocabularySubject;
}) {
  const audio = vocabulary.readingAudio.find((a) => a.reading === reading);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const handleOnClick = useCallback(() => {
    if (audioRef.current && !playing) {
      if (!audioRef.current.src) {
        audioRef.current.src = audio!.url;
      } else {
        audioRef.current.play();
      }
    }
  }, [audio, audioRef, playing]);

  const handleCanPlay = useCallback(async () => {
    if (!playing) {
      await audioRef.current!.play();
    }
  }, [playing, audioRef]);

  const handlePlaying = useCallback(() => setPlaying(true), [setPlaying]);
  const handleEnded = useCallback(() => setPlaying(false), [setPlaying]);

  return (
    <span>
      {reading}
      {audio && (
        <>
          <audio
            ref={audioRef}
            autoPlay={false}
            onCanPlayThrough={handleCanPlay}
            onPlaying={handlePlaying}
            onEnded={handleEnded}
          />
          <SpeakerIcon onClick={handleOnClick} playing={playing} />
        </>
      )}
    </span>
  );
}