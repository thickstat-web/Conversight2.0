import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SvgCss } from 'react-native-svg'
import { useTheme } from '@/Hooks'
import downArrow from '@/Assets/Images/xml-svg/downArrow'
import upArrow from '@/Assets/Images/xml-svg/upArrow'

interface ExpandButtonProps {
  expanded: boolean
  onPress?: (...args: any) => any
  style?: any
  expandedText: string
  collapsedText: string
}

const ExpandButton = ({
  expanded,
  onPress,
  style,
  expandedText,
  collapsedText,
}: ExpandButtonProps) => {
  const { Colors } = useTheme()
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
      <Text
        style={[
          {
            color: Colors.GREEN_MAIN,
          },
          styles.expandCollapseStyle,
        ]}
      >
        {expanded ? collapsedText : expandedText}
      </Text>
      <SvgCss
        width="10"
        height="10"
        xml={expanded ? upArrow : downArrow}
        style={styles.icon}
      />
    </TouchableOpacity>
  )
}

ExpandButton.defaultProps = {
  onPress: () => {},
  style: {},
}
const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    padding: 4,
  },
  expandCollapseStyle: {
    textDecorationLine: 'underline',
    letterSpacing: 0.8,
  },
  icon: {
    marginTop: 4,
    marginHorizontal: 4,
  },
})

export default ExpandButton
