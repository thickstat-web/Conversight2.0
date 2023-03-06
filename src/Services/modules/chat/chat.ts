import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { getAPIUrl } from '@/Config'
import { ResponseType } from '@/Types/Common'
import { Dataset, DataSetResponse } from '@/Types/DataSet'
import { HelpQuestion, HelpQuestionResponse } from '@/Types/Faq'
import { Text2VoiceRequest, Text2VoiceResponse } from '@/Types/Voice'

export const getDatasets = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<Dataset[]>, void>({
    // query: () => `${getAPIUrl()}/datamanager/api/v1/dataset?isFetchGroup=true`, //v1 api call
    query: () => `${getAPIUrl()}/datamanager-v1/api/v3/dataset?`,
    transformResponse: (response: DataSetResponse) => {
      const { code = [] } = response

      const getTrueAccessDatasets = response.data.filter(
        (val: { access: boolean }) => {
          return val.access === true
        },
      )

      const formattedData: any = getTrueAccessDatasets.map((obj: Dataset) => {
        return {
          access: obj.access,
          createdTime: obj.created_at,
          dataSetID: obj._key,
          datasetName: obj.dataset_name,
          defaultLocaleSettings: obj.defaultLocaleSettings,
          description: obj.description,
          email_domains: obj.email_domains,
          group_setting: obj.group_setting,
          isRestricted: obj.isRestricted,
          kbNet: obj.kbNet,
          status: obj.status,
          updatedTime: obj.updated_at,
          republishCompletedTime: obj.load_completed_at,
        }
      })

      const sortedDataSets = formattedData.sort((a: Dataset, b: Dataset) =>
        a.datasetName.localeCompare(b.datasetName),
      )
      return { success: code === 200, data: sortedDataSets }
    },
  })
}

export const getHelpQuestions = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<HelpQuestion[]>, string>({
    query: (datasetId: string) =>
      `${getAPIUrl()}/kbnet/helpQuestions?datasetID=${datasetId}`,
    transformResponse: (response: HelpQuestionResponse) => {
      const { msg, question_list = [] } = response
      return { success: msg === 'success', data: question_list }
    },
  })
}

export const getTextToVoice = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseType<string>, Partial<Text2VoiceRequest>>({
    query: (body: Text2VoiceRequest) => ({
      url: `${getAPIUrl()}/api/v1/mp3`,
      method: 'POST',
      body,
    }),
    transformResponse: (response: Text2VoiceResponse) => {
      return { success: true, data: response.b64 }
    },
  })
}
