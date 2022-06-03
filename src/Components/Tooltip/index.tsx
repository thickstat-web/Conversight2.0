import { View, Text, Button } from 'react-native-ui-lib'
import React from 'react'
import { athena } from '../Images'
import { StyleSheet, Image } from 'react-native'
import { useTheme } from '@/Hooks'
import ButtonCustom from '../ButtonCustom'

interface Props {
    total: number | string
    currentIndex: number | string
    title: string,
    text: string,
    btnText:string
}

const Tooltip = ({ total, currentIndex, title, text,btnText }: Props) => {
    const { Layout, Colors, Fonts } = useTheme()
    return (
        <View style={[Layout.colCenter, styles.root, { backgroundColor: Colors.GREEN_MAIN }]}>
            <Text style={[Fonts.text15Bold, styles.current]}>{currentIndex + "/" + total}</Text>
            <Text style={Fonts.text18BoldContrast}>{title}</Text>
            <Image style={styles.image} source={athena} />
            <Text center style={Fonts.text18Contrast} >{text}</Text>
            <Button labelStyle={{ fontFamily: "Montserrat-Regular", fontSize: 14 }} label={btnText} style={styles.btn} />
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        padding: 25,
        width: 300,
        height: 330,
        borderRadius: 16,
        justifyContent: "space-between"
    },
    current: {
        position: "absolute",
        left: 20,
        top: 25,
        color: "#FFF"
    },
    image: {
        width: 190,
        height: 100
    },
    btn: {
        backgroundColor: "#009833",
        borderRadius: 4,
        width: 220
    }
})

export default Tooltip



