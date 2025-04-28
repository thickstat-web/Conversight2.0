import { botApi } from '../../api';
import {
  fetchDashboardFilters,
  updateDashboardFilters,
} from '@/Services/modules/dashboardFilter/dashboardFilter';

export const dashboardFiltersApiSlice = botApi.injectEndpoints({
  endpoints: build => ({
    fetchDashboardFilters: fetchDashboardFilters(build),
    updateDashboardFilters: updateDashboardFilters(build),
  }),
  overrideExisting: false,
});

export const {
  useFetchDashboardFiltersQuery,
  useLazyFetchDashboardFiltersQuery,
  useUpdateDashboardFiltersMutation,
} = dashboardFiltersApiSlice;