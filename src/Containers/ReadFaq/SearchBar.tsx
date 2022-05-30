import React, { useEffect, useRef } from 'react'
import { Keyboard, StyleSheet, TextInput } from 'react-native'
import { Text, View } from 'react-native-ui-lib'
import { useTheme } from '@/Hooks'

function SearchBarFaq(): JSX.Element {
    const { Colors, Common, Fonts } = useTheme()
    const searchRef = useRef<TextInput>(null)

    const [keyWord, setKeyWord] = React.useState<string>("")

    useEffect(() => {
        if (searchRef?.current) {
            searchRef?.current?.focus()
        }
    }, [searchRef])

    return (
        <View
            style={[
                styles.searchBarWrapper,
            ]}
        >
            <View flexG style={styles.searchInputWrapper}>
                <TextInput
                    ref={searchRef}
                    placeholder="Search chat..."
                    focusable={true}
                    style={[Common.textInput, styles.searchInput]}
                    onChangeText={(t) => setKeyWord(t)}
                />
            </View>

            {keyWord?.length > 1 && <Text style={[Fonts.textSmall, { padding: 15 }]}>
                Results for:{" "}
                <Text style={{ color: Colors.GREEN_MAIN }}>{keyWord}</Text>
            </Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    searchBarWrapper: {
        flexDirection: 'column',
    },
    searchInputWrapper: {
     
        paddingTop: 5,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity:  0.4,
        shadowRadius: 3,
        elevation: 5,
        height:60
        
    },
    searchInput: {
        top: 4,
        borderRadius: 8,
        paddingHorizontal: 10,
        textAlign: "left",
        backgroundColor: '#F8F8F8',
        borderWidth: 0,
        fontSize: 14,
        minHeight:40,
        maxHeight:40
    },

})

export default SearchBarFaq
