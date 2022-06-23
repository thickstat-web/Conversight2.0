import React from 'react'
import { View } from 'react-native-ui-lib'
import { StyleSheet } from 'react-native'
import Summary from '@/Components/FAQ/Summary'
import { useAppSelector } from '@/Hooks'
import { selectFAQ, selectKeyword } from '@/Store/Faq'
import { searchInFaq } from '@/Utils/array'
import { ScrollView } from 'react-native-gesture-handler'

const SearchResultBox = () => {
  const allFaq = useAppSelector(selectFAQ)
  const keyword = useAppSelector(selectKeyword)
  const [currentResults, setCurrentResults] = React.useState<string[]>([])
  const scrollRef = React.useRef<any>(null)

  React.useEffect(() => {
    if (keyword.length) {
      setCurrentResults(searchInFaq(allFaq, keyword))
    } else {
      setCurrentResults([...allFaq])
    }
    scrollRef.current.scrollTo({ y: 0, animated: true, behavior: 'smooth' })
  }, [keyword])

  console.log(allFaq)
  return (
    <View>
      <ScrollView ref={scrollRef}>
        <View style={styles.root}>
          {currentResults.map((x, i) => (
            <Summary key={i} title={x} content="some content" />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    padding: 15,
    paddingBottom: 20,
  },
})

export default SearchResultBox
