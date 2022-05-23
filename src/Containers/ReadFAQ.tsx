import { View, Text } from 'react-native-ui-lib'
import React from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native'
import { useTheme } from '@/Hooks'
import RecentlyViewed from '@/Components/FAQ/RecentlyViewed'
import Summary from '@/Components/FAQ/Summary'

const ReadFAQ = () => {
    const { Fonts, Layout, Colors } = useTheme()
    return (
        <ScrollView style={{ backgroundColor: "#FFF" }}>
            <View style={styles.root}>
                <View style={Layout.row}>
                    <Text style={{ ...Fonts.textSmall, fontSize: 14 }}>
                        Recently Viewed
                    </Text>
                    <Text marginL-2 style={{ ...Fonts.textSmall, color: Colors.GREEN_MAIN }}>
                        (2)
                    </Text>
                </View>
                {[1, 2].map((x, i) => (
                    <RecentlyViewed key={i} />
                ))}
                <View style={Layout.row}>
                    <Text style={{ ...Fonts.textSmall, fontSize: 14 }}>
                        Summary
                    </Text>
                    <Text marginL-2 style={{ ...Fonts.textSmall, color: Colors.GREEN_MAIN }}>
                        (2)
                    </Text>
                </View>
                {[1, 2, 3, 4, 4].map((x, i) => (
                    <Summary key={i} />
                ))}
            </View>


        </ScrollView>
    )
}

const styles = StyleSheet.create({
    root: {
        margin: 20,
        backgroundColor: "#FFF"
    },
    title: {
        display: "flex"
    }
})

export default ReadFAQ