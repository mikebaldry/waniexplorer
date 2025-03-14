import { Subject } from "../../db/subjects";

export type Tools = {
  zoomTo: (subject: Subject, animated: boolean, scaleFit: boolean) => void;
};
