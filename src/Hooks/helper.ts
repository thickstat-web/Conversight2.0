import { ResponseType } from '@/Types/Common'
import { FollowupRequest } from '@/Types/Followup'
import { InsightComponent, InsightData } from '@/Types/Insights'
import { Text2VoiceRequest } from '@/Types/Voice'

export type AudioTrack = { id: string; url: string }
export type VoiceResponse = { id: string; resp: ResponseType<string> }

export const makeTextToVoiceRequestData = (text: string) => {
  const data: Text2VoiceRequest = {
    text,
    textType: 'text',
    voiceLib: 'google',
    output: 'base64',
    lang: 'en-IN',
    voiceId: 'en-IN-Wavenet-D',
    pitch: 0,
    speakingRate: 1,
  }
  return data
}

export const insightComponentExtractor = ({
  id,
}: InsightData): InsightComponent => ({
  id,
  followupLoading: true,
  voiceLoading: true,
  voice: '',
})

export const updateInsightComponent =
  (id: string, data: Partial<InsightComponent>) =>
    (prev: InsightComponent[]) => {
      const insightComponent = prev.find(item => item.id === id)
      if (insightComponent) {
        Object.assign(insightComponent, data)
      }
      return prev
    }

export const makeFollowupRequest = (
  insightComponentIds: string[],
): FollowupRequest => ({
  followup: [
    {
      dataSetID: '',
      proActiveCompIDs: insightComponentIds,
    },
  ],
})

export const responseToAudioTrack = ({ id, resp }: VoiceResponse): AudioTrack =>
  ({ id, url: resp.data ?? '' } as AudioTrack)
