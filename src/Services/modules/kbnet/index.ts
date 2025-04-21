// kbnetApiSlice.ts
import { csApi } from '../../api';
import {
    fetchDatasetMetadata,
    fetchDatasetSynonyms,
    fetchDatasetTableMetadata,
    fetchDatasetSubjectAreas,
    fetchRelationByDatasetId,
    fetchUserGuideRelationByDatasetId,
    fetchUserGuideObjectsByDatasetId,
    fetchDefaultConfig,
    fetchDefaultData,
    fetchOperators,
} from '@/Services/modules/kbnet/kbnet';

export const kbnetApiSlice = csApi.injectEndpoints({
    endpoints: (build) => ({
        metadata: fetchDatasetMetadata(build),
        synonyms: fetchDatasetSynonyms(build),
        tableMetadata: fetchDatasetTableMetadata(build),
        subjectAreas: fetchDatasetSubjectAreas(build),
        relation: fetchRelationByDatasetId(build),
        userGuideRelation: fetchUserGuideRelationByDatasetId(build),
        userGuideObjects: fetchUserGuideObjectsByDatasetId(build),
        defaultConfig: fetchDefaultConfig(build),
        defaultData: fetchDefaultData(build),
        operators: fetchOperators(build)
    }),
    overrideExisting: false,
});

export const {
    useMetadataQuery,
    useLazyMetadataQuery,
    useSynonymsQuery,
    useLazySynonymsQuery,
    useTableMetadataQuery,
    useLazyTableMetadataQuery,
    useSubjectAreasQuery,
    useLazySubjectAreasQuery,
    useRelationQuery,
    useLazyRelationQuery,
    useUserGuideRelationQuery,
    useLazyUserGuideRelationQuery,
    useUserGuideObjectsQuery,
    useLazyUserGuideObjectsQuery,
    useDefaultConfigQuery,
    useDefaultDataQuery,
    useOperatorsQuery

} = kbnetApiSlice;
