import React from 'react'
import { View, Image, StyleSheet } from 'react-native'
import { useTheme } from '@/Hooks'

interface Props {
  height?: number | string
  width?: number | string
  mode?: 'contain' | 'cover' | 'stretch' | 'repeat' | 'center'
}

const Brand = ({ height, width, mode }: Props) => {
  const { Images } = useTheme()

  return (
    <View style={{ height, width }}>
      <Image
        style={{ alignSelf: 'center' }}
        source={Images.logo}
        resizeMode={mode}
      />
    </View>
  )
}

const styles = StyleSheet.create({})

Brand.defaultProps = {
  height: 200,
  mode: 'contain',
  width: 250,
}

export default Brand
