import { Handle, Position } from "@xyflow/react";
import { NodeProps, Node } from "@xyflow/react";
import Mnemonic from "../Mnemonic";
import { VocabularySubject } from "../../../db/subjects";
import Urls from "./Urls";
import CommaSeparatedList, { SpanItem } from "./CommaSeparatedList";
import Heading from "./Heading";
import SpeakerIcon from "../../SpeakerIcon";
import { createRef, useCallback, useState } from "react";

export type VocabularyNode = Node<VocabularySubject, "vocabulary">;

function ReadingWithAudio({
  reading,
  vocabulary,
}: {
  reading: string;
  vocabulary: VocabularySubject;
}) {
  const audio = vocabulary.readingAudio.find((a) => a.reading === reading);
  const audioRef = createRef<HTMLAudioElement>();
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

export default function VocabularyNode(props: NodeProps<VocabularyNode>) {
  const vocabulary = props.data;

  return (
    <>
      <div className="card card-node card-node-vocabulary">
        <Heading subject={vocabulary} />

        <ul className="list-group list-group-flush">
          {vocabulary.otherMeanings.length > 0 && (
            <li className="list-group-item">
              <div>
                <strong>Other meanings</strong>
              </div>
              <div>
                <CommaSeparatedList
                  items={vocabulary.otherMeanings}
                  component={SpanItem}
                />
              </div>
            </li>
          )}

          <li className="list-group-item">
            <div>
              <strong>Meaning mnemonic</strong>
            </div>
            <div>
              <Mnemonic value={vocabulary.meaningMnemonic} />
            </div>
          </li>

          <li className="list-group-item">
            <div>
              <strong>Readings</strong>
            </div>
            <div className="lh-2">
              <CommaSeparatedList
                items={[vocabulary.primaryReading, ...vocabulary.otherReadings]}
                component={({ item }) =>
                  ReadingWithAudio({ reading: item, vocabulary })
                }
              />
            </div>
          </li>

          <li className="list-group-item">
            <div>
              <strong>Reading mnemonic</strong>
            </div>
            <div>
              <Mnemonic value={vocabulary.readingMnemonic} />
            </div>
          </li>

          <Urls subject={vocabulary} />
        </ul>
      </div>
      <Handle type="target" position={Position.Top} hidden={true} />
    </>
  );
}
