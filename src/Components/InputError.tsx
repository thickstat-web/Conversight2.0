import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useTheme } from '@/Hooks'

interface Props {
    errorText: string
}


const InputError = ({ errorText }: Props) => {
    const { Colors } = useTheme()
    return (
        <View style={[styles.root, { backgroundColor: Colors.DARK_BLUE }]}>
            <Text style={[styles.text, { color: Colors.WHITE }]}>{errorText}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        padding: 8,
        borderRadius: 8
    },
    text: {
        fontSize: 14,
        fontFamily: "Montserrat-Regular"
    }
})

export default InputError