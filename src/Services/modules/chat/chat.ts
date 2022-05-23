import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import { ResponseType } from '@/Types/Common'
import { Dataset, DataSetResponse } from '@/Types/DataSet'

export const getDatasets = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<Dataset[]>, void>({
    query: () => '/datamanager/api/v1/dataset?isFetchGroup=true',
    transformResponse: (response: DataSetResponse) => {
      const { code, data = [] } = response
      const sortedDataSets = data.sort((a: Dataset, b: Dataset) =>
        a.datasetName.localeCompare(b.datasetName),
      )
      return { success: code === 200, data: sortedDataSets }
    },
  })
}
