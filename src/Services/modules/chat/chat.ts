import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { getAPIUrl } from '@/Config'
import { ResponseType } from '@/Types/Common'
import { Dataset, DataSetResponse } from '@/Types/DataSet'
import { HelpQuestion, HelpQuestionResponse } from '@/Types/Faq'

export const getDatasets = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<Dataset[]>, void>({
    query: () => `${getAPIUrl()}/datamanager/api/v1/dataset?isFetchGroup=true`,
    transformResponse: (response: DataSetResponse) => {
      const { code, data = [] } = response
      const sortedDataSets = data.sort((a: Dataset, b: Dataset) =>
        a.datasetName.localeCompare(b.datasetName),
      )
      return { success: code === 200, data: sortedDataSets }
    },
  })
}

export const getHelpQuestions = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<HelpQuestion[]>, string>({
    query: (datasetId: string) => `${getAPIUrl()}/kbnet/helpQuestions?datasetID=${datasetId}`,
    transformResponse: (response: HelpQuestionResponse) => {
      const { msg, question_list = [] } = response
      return { success: msg === 'success', data: question_list }
    },
  })
}
