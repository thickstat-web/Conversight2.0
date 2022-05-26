import { View, Text } from 'react-native-ui-lib'
import React from 'react'
import ReqIcon from "@/Assets/Images/iconsSVG/req-demo.svg"
import { useTheme } from '@/Hooks'
import { Dimensions, ScrollView } from 'react-native'

const RequestDemoContainer = () => {
    const { height: screenHeight } = Dimensions.get("screen")
    const { Layout, Fonts } = useTheme()
    return (
        <ScrollView contentContainerStyle={{ ...Layout.colCenter, flex: 1 ,marginTop:70}} >
            <View flex-2>
                <ReqIcon />
            </View>
            <View flex-3>
                <Text center marginV-10 style={{...Fonts.titleSmall,fontSize:24}}>Request a Demo</Text>
                <Text center marginH-40 style={Fonts.textSmall}>If you would like a demo of ConverSight, please fill in this form and one of our representatives will be in touch with you soon.</Text>
            </View>
            <View flex-4>
                
                
            </View>
        </ScrollView>
        
    )
}

export default RequestDemoContainer