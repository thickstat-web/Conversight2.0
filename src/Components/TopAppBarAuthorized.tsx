import { View, Text, TouchableOpacity } from 'react-native-ui-lib'
import React from 'react'
import BurgerIcon from '@/Assets/Images/iconsSVG/burger.svg'

const TopAppBarAuthorized = () => {
  return (
    <View absT paddingL-15 paddingT-20>
      <TouchableOpacity>
        <BurgerIcon />
      </TouchableOpacity>
    </View>
  )
}

export default TopAppBarAuthorized
