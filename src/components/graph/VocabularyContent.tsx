import { VocabularySubject } from "../../db/subjects";
import CommaSeparatedList from "./CommaSeparatedList";
import ReadingWithAudio from "./ReadingWithAudio";
import ReadingMnemonic from "./ReadingMnemonic";

export default function VocabularyContent({ vocabulary }: { vocabulary: VocabularySubject }) {
  return (
    <>
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

      <ReadingMnemonic subject={vocabulary} />
    </>
  );
}
