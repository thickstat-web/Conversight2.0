// features/api/dashboardFiltersApi.ts
import { EndpointBuilder } from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import { getAPIUrl, getBotUrl } from '@/Config';
import { ResponseType } from '@/Types/Common';
// import { Pinboard, RetainFilter } from '@/Types/Pinboard';
import { Pinboard } from '@/Types/Pinboard';

export const fetchDashboardFilters = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any[]>, string>({ 
    query: (pinboardId: string) => `${getBotUrl()}/pinboard/filters?pinBoardID=${pinboardId}`,
    transformResponse: (response: { code: string; message: string; data: { retainFilters: any[] } }) => {
      const { code, message, data } = response;
      return {
        success: code === '200' && message === 'success',
        data: data.retainFilters || [],
      };
    },
  });
};

export const updateDashboardFilters = (build: EndpointBuilder<any, any, any>) => {
  return build.mutation<ResponseType<Pinboard>, { pinBoardID: string; retainFilters: any }>({
    query: ({ pinBoardID, retainFilters }) => ({
      url: `${getBotUrl()}/pinboard/filters`,
      method: 'PUT',
      body: { pinBoardID, retainFilters },
    }),
    transformResponse: (response: { code: string; message: string; data: Pinboard }) => {
      const { code, message, data } = response;
      return {
        success: code === '200' && message === 'success',
        data,
      };
    },
  });
};

export const fetchDatasetMetadata = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: (datasetId: string) => `${getAPIUrl()}/kbnet/metadata?isUser=true&dataset=${datasetId}`,
    transformResponse: (response: { code: string; message: string; data: any }) => {
      const { code, message, data } = response;
      return {
        success: code === '200' && message === 'success',
        data,
      };
    },
  });
};


export const fetchDatasetSynonyms = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: (datasetId: string) => `${getAPIUrl()}/kbnet/synonyms?isUser=true&relation=col_syn&dataset=${datasetId}`,
    transformResponse: (response: { code: string; message: string; data: any }) => {
      const { code, message, data } = response;
      return {
        success: code === '200' && message === 'success',
        data,
      };
    },
  });
};


export const fetchDatasetTableMetadata = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: (datasetId: string) => `${getAPIUrl()}/kbnet/table/metadata?dataset=${datasetId}`,
    transformResponse: (response: { code: string; message: string; data: any }) => {
      const { code, message, data } = response;
      return {
        success: code === '200' && message === 'success',
        data,
      };
    },
  });
};


export const fetchDatasetSubjectAreas = (build: EndpointBuilder<any, any, any>) => {
  return build.query<ResponseType<any>, string>({
    query: (datasetId: string) => `${getBotUrl()}/subject-areas?datasetId=${datasetId}`,
    transformResponse: (response: { code: string; message: string; data: any }) => {
      const { code, message, data } = response;
      return {
        success: code === '200' && message === 'success',
        data,
      };
    },
  });
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
