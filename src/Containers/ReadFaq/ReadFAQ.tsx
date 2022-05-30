import { View, Text } from 'react-native-ui-lib'
import React, { useEffect } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { StyleSheet } from 'react-native'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
// import RecentlyViewed from '@/Components/FAQ/RecentlyViewed'
import Summary from '@/Components/FAQ/Summary'
import { useGetFaqMutation } from '@/Services/modules/FAQ'
import { store } from '@/Store'
import { FAQ_DATASET } from '@/Constants/api'
import { selectFAQ, setQuestions } from '@/Store/Faq'
import SearchContainerFaq from './SearchContainer'

const ReadFAQ = () => {
    const { Fonts, Layout, Colors } = useTheme()
    const [getFaq, { data, isSuccess, error, status }] = useGetFaqMutation()
    const token = store.getState().authReducer.authData?.token
    const dispatch = useAppDispatch()
    const currentQuestions = useAppSelector(selectFAQ) as any[];

    useEffect(() => {
        getFaq({ token, ...FAQ_DATASET })
    }, [])

    useEffect(() => {
        if (isSuccess) {
            dispatch(setQuestions(data?.data))
        } else {
            // set some error here
        }
    }, [data, isSuccess, error])
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
            
                <View style={Layout.row}>
                    <Text style={{ ...Fonts.textSmall, fontSize: 14 }}>
                        Summary
                    </Text>
                    <Text marginL-2 style={{ ...Fonts.textSmall, color: Colors.GREEN_MAIN }}>
                        ({currentQuestions?.length})
                    </Text>
                </View>
                {currentQuestions?.map((q, i) => (
                    <Summary title={q} key={i} content={''} />
                ))}
            </View>
            <SearchContainerFaq/>
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