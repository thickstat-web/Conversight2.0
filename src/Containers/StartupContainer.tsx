import React, { useCallback, useEffect } from 'react'
import { ActivityIndicator, View, Text } from 'react-native'
import { useTranslation } from 'react-i18next'
import { MAIN_SCREEN } from '@/Constants/screens'
import { useTheme, useAppDispatch } from '@/Hooks'
import { Brand } from '@/Components'
import { setSelectedDatasetId } from '@/Store/Auth'
import { setDefaultTheme } from '@/Store/Theme'
import { useLazyGetDatasetsQuery } from '@/Services/modules/chat'
import { navigateAndSimpleReset } from '@/Navigators/utils'

const StartupContainer = () => {
  const { Layout, Gutters, Colors, Fonts } = useTheme()
  const dispatch = useAppDispatch()
  const [getDatasets] = useLazyGetDatasetsQuery()

  const { t } = useTranslation()

  const init = useCallback(async () => {
    const delayStart = new Promise(resolve =>
      setTimeout(() => {
        resolve(true)
      }, 2000),
    )

    // Load all the initial datasets
    const [datasetsRes] = await Promise.all([getDatasets(), delayStart])

    // Set first dataset as default for chat
    const datasets = datasetsRes.data?.data
    if (datasets && datasets?.length) {
      dispatch(setSelectedDatasetId(datasets[0].dataSetID))
    }

    setDefaultTheme({ theme: 'default', darkMode: null })
    navigateAndSimpleReset(MAIN_SCREEN)
  }, [dispatch, getDatasets])

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
