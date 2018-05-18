import { SentenceWithTranslations } from "~/app/model";

export interface ExampleSentences {
  data: SentenceWithTranslations[];
  sourceDomain: string;
  sourceUrl: string;
}
