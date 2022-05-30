import React, { useRef } from 'react'
import { StyleSheet } from 'react-native'
import { useAppDispatch, useAppSelector, useTheme } from '@/Hooks'
import { selectModalSearchOpen, setModalSearchOpen } from '@/Store/Faq'
import { Modal, Text, View } from 'react-native-ui-lib'
import SearchBar from './SearchBar'
import BackIconWhite from '@/Assets/Images/iconsSVG/back-white.svg'
import CloseIcon from '@/Assets/Images/iconsSVG/close.svg'
import SearchResultBox from './SearchResultBox'

function SearchContainerFaq() {
    const { Colors, Fonts } = useTheme()
    const visible = useAppSelector(selectModalSearchOpen)
    const dispatch = useAppDispatch()

    const handleClose = () => {
        dispatch(setModalSearchOpen(false))
    }

    return <View flex >
        <Modal transparent={false} animationType={'fade'} visible={visible}>
            <Modal.TopBar title='Search in FAQ'
                doneButtonProps={{
                    label: '',
                }}
                onCancel={handleClose}
                onDone={handleClose}
                cancelIcon={BackIconWhite}
                doneIcon={CloseIcon}
                titleStyle={[Fonts.text20Bold, { color: Colors.WHITE }]}
                containerStyle={{ backgroundColor: Colors.GREEN_MAIN }} />
            <View>
                <SearchBar />
            </View>
            <View>
                <SearchResultBox />
            </View>
        </Modal>
    </View>
}

const styles = StyleSheet.create({
    searchContainer: {
        zIndex: 1,
    },

})

export default SearchContainerFaq