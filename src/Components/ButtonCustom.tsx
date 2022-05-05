import { Button } from 'react-native-ui-lib'
import React from 'react'
import { StyleSheet } from 'react-native'

interface Props {
  label?: string
  action?: any
  color?: string
  disabled?: boolean
  labelColor?: string
}

const ButtonCustom = ({
  label,
  action,
  color,
  disabled,
  labelColor,
}: Props) => {
  return (
    <Button
      labelProps={{ color: labelColor }}
      marginT-10
      disabled={disabled}
      onPress={action}
      label={label}
      style={{ ...styles.root, backgroundColor: color }}
      labelStyle={{ ...styles.label }}
    />
  )
}

ButtonCustom.defaultProps = {
  label: 'label',
  action: () => {},
  color: '#FFFFFF',
  disabled: false,
  labelColor: '#000000',
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 8,
    marginHorizontal: 30,
    width: 300,
    height: 50,
  },
  label: {
    fontFamily: 'Montserrat-Regular',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 18,
  },
})

export default ButtonCustom
