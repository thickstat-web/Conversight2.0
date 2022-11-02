
export interface Text2VoiceRequest {
  text: string
  textType: string
  voiceLib: string
  output: string
  lang: string
  voiceId: string
  pitch: number
  speakingRate: number
}

export interface Text2VoiceResponse {
  b64: string
}
