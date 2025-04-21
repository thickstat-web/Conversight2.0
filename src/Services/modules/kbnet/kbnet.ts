import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { getAPIUrl, getBotUrl } from '@/Config';
import { ResponseType } from '@/Types/Common';
import { setMetadata, setSubjectArea, setSynonyms, setTableMetadata } from '@/Store/Kbnet';
import { getLocalStore, setLocalStore } from '@/Utils/asyncStorage';
import { find, map, uniq } from 'lodash';


export const fetchDatasetMetadata = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: (datasetId: string) => `${getAPIUrl()}/kbnet/metadata?isUser=true&dataset=${datasetId}`,
    async onQueryStarted(datasetId, { dispatch, queryFulfilled }) {
      try {
        const { data } = await queryFulfilled
        dispatch(setMetadata({ datasetId, data }))
      } catch (err) {
      }
    },
  })
};


export const fetchDatasetSynonyms = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: (datasetId: string) => `${getAPIUrl()}/kbnet/synonyms?isUser=true&relation=col_syn&dataset=${datasetId}`,
    async onQueryStarted(datasetId, { dispatch, queryFulfilled }) {
      try {
        const { data } = await queryFulfilled
        dispatch(setSynonyms({ datasetId, data }))
      } catch (err) { }
    },
  })
}


export const fetchDatasetTableMetadata = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: (datasetId: string) => `${getAPIUrl()}/kbnet/table/metadata?dataset=${datasetId}`,
    async onQueryStarted(datasetId, { dispatch, queryFulfilled }) {
      try {
        const { data } = await queryFulfilled
        dispatch(setTableMetadata({ datasetId, data }))
      } catch (err) { }
    },
  })
};


export const fetchDatasetSubjectAreas = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: (datasetId: string) => `${getAPIUrl()}/kbnet/subjectArea?dataset=${datasetId}`,
    async onQueryStarted(datasetId, { dispatch, queryFulfilled }) {
      try {
        const { data } = await queryFulfilled
        dispatch(setSubjectArea({ datasetId, data }))
      } catch (err) { }
    },
  })
};

export const fetchRelationByDatasetId = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: (datasetId: string) => `${getBotUrl()}/kbnet/relation?dataset_id=${datasetId}`,
    transformResponse: (response: { code: string; message: string; data: any }) => {
      const { code, message, data } = response;
      return {
        success: code === '200' && message === 'success',
        data,
      };
    },
  });
};

export const fetchUserGuideRelationByDatasetId = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: (datasetId: string) => `${getBotUrl()}/kbnet/user-guide/relation/graph?datasetID=${datasetId}`,
    transformResponse: (response: { code: string; message: string; data: any }) => {
      const { code, message, data } = response;
      return {
        success: code === '200' && message === 'success',
        data,
      };
    },
  });
};

export const fetchUserGuideObjectsByDatasetId = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: (datasetId: string) => `${getBotUrl()}/kbnet/user/objects?dataset=${datasetId}`,
    transformResponse: (response: { code: string; message: string; data: any }) => {
      const { code, message, data } = response;
      return {
        success: code === '200' && message === 'success',
        data,
      };
    },
  });
};




export const fetchDefaultConfig = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: () => `${getAPIUrl()}/kbnet/Configuration?type=defaultConfig`,
    transformResponse: (response) => {
      return response
    },
  })
}


export const fetchDefaultData = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: () => `${getAPIUrl()}/kbnet/fetchData`,
    transformResponse: (response) => {
      return response
    }
  })
}

export const fetchOperators = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: () => `${getAPIUrl()}/kbnet/operators`,
    transformResponse: (response) => {
      return response
    }
  })
}