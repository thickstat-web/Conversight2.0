import { View, Text } from 'react-native-ui-lib'
import React from 'react'
import { StyleSheet } from 'react-native'
import Summary from '@/Components/FAQ/Summary'

const SearchResultBox = () => {
    return (
        <View style={styles.root}>
           {[0,1].map((x,i)=>(
               <Summary title='test' content='some content'/>
           ))}
        </View>
    )
}

const styles = StyleSheet.create({
    root: {
        padding:15
    }
})

export default SearchResultBox