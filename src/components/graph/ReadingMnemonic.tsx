import { KanjiSubject, VocabularySubject } from "../../db/subjects";
import Mnemonic from "./Mnemonic";

export default function readingMnemonic({ subject }: { subject: KanjiSubject | VocabularySubject }) {
  return (
    <li className="list-group-item">
      <div>
        <strong>Reading mnemonic</strong>
      </div>
      <div>
        <Mnemonic value={subject.readingMnemonic} />
      </div>
    </li>
  )
}