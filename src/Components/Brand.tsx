import React from 'react'
import { View } from 'react-native'
import Logo from '@/Assets/Images/logo.svg'

interface Props {
  height?: number | string
  width?: number | string
}

const Brand = ({ height, width }: Props) => {
  return (
    <View style={{ height, width }}>
      <Logo />
    </View>
  )
}

Brand.defaultProps = {
  height: 100,
  width: 220,
}

export default Brand
