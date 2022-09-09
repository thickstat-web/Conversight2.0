import React, { useCallback, useEffect } from 'react'
import { ActivityIndicator, View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { DRAWER_NAVIGATOR } from '@/Constants/screens'
import { useAppSelector, useAppDispatch, useTheme } from '@/Hooks'
import { Brand } from '@/Components'
import { selectDatasetId, setSelectedDatasetId } from '@/Store/Auth'
import { setDefaultTheme } from '@/Store/Theme'
import { useLazyGetDatasetsQuery } from '@/Services/modules/chat'
import { navigateAndSimpleReset } from '@/Navigators/utils'

const StartupContainer = () => {
  const { Layout, Gutters, Colors, Fonts } = useTheme()
  const dispatch = useAppDispatch()
  const [getDatasets] = useLazyGetDatasetsQuery()
  const selectedDatasetId = useAppSelector(selectDatasetId)

  const { t } = useTranslation()

  const init = useCallback(async () => {
    const delayStart = new Promise(resolve =>
      setTimeout(() => {
        resolve(true)
      }, 100),
    )

    if (!selectedDatasetId) {
      // Load all the initial datasets
      const [datasetsResp] = await Promise.all([
        // No to prefer cache data
        getDatasets(undefined, false).unwrap(),
        delayStart,
      ])

      // Set first dataset as default for chat
      const datasets = datasetsResp.data
      if (datasets && datasets?.length) {
        dispatch(setSelectedDatasetId(datasets[0].dataSetID))
      }
    }
    setDefaultTheme({ theme: 'default', darkMode: null })
    navigateAndSimpleReset(DRAWER_NAVIGATOR)
  }, [dispatch, selectedDatasetId])

  useEffect(() => {
    init()
  }, [init])

  return (
    <View style={[Layout.fill, Layout.colCenter]}>
      <Brand />
      <ActivityIndicator
        size={'large'}
        style={[Gutters.largeVMargin]}
        color={Colors.GREEN_MAIN}
      />
      {/* <Text style={Fonts.textCenter}>{t('welcome')}</Text> */}
    </View>
  )
}

export default StartupContainer
