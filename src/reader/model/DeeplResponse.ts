export interface DeeplResponse {
  result: DeeplResponseResult
}

interface DeeplResponseResult {
  translations: DeeplResponseTranslation[]
}

interface DeeplResponseTranslation {
  beams: DeeplResponseBeam[]
}

interface DeeplResponseBeam {
  postprocessed_sentence: string
}
