export interface IDeeplResponse {
  result: IDeeplResponseResult
}

interface IDeeplResponseResult {
  translations: IDeeplResponseTranslation[]
}

interface IDeeplResponseTranslation {
  beams: IDeeplResponseBeam[]
}

interface IDeeplResponseBeam {
  postprocessed_sentence: string
}
