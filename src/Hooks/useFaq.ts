import { useCallback, useEffect, useState } from 'react'
import { useLazyGetHelpQuestionsQuery } from '@/Services/modules/chat'
import { useGetFaqMutation } from '@/Services/modules/FAQ'
import { selectDatasetId } from '@/Store/Auth'
import { FaqRequestData } from '@/Types/Faq'
import { useAppSelector } from '.'

type TagQuestions = {
  [key: string]: string[]
}

export default function () {
  const selectedDatasetId = useAppSelector(selectDatasetId)
  const [getFaqs] = useGetFaqMutation()
  const [getHelpQuestions] = useLazyGetHelpQuestionsQuery()
  const [tagQuestionsMap, setTagQuestionsMap] = useState<TagQuestions>()
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchFaqAndHelpQuestions = useCallback(async () => {
    if (selectedDatasetId) {
      setIsLoading(true)
      const reqData: FaqRequestData = {
        dataset: [selectedDatasetId],
        isQuestionsOnly: true,
      }
      const [faqResp, helpQuestionResp] = await Promise.all([
        getFaqs(reqData).unwrap(),
        getHelpQuestions(selectedDatasetId).unwrap(),
      ])

      // Add both Faq and Help Questions to the <tag, questions[]> map
      const tagQuestionMap: TagQuestions = {}

      if (faqResp.data?.length) {
        tagQuestionMap.faq = faqResp.data ?? []
      }

      // ToDo: Require optimization storing tags and questions (M - M relationship)
      if (helpQuestionResp.data?.length) {
        helpQuestionResp.data.forEach(item => {
          const tags = item.tags === null ? ['default'] : item.tags
          tags.forEach(tag => {
            if (!tagQuestionMap[tag]) {
              tagQuestionMap[tag] = []
            }
            tagQuestionMap[tag].push(item.question)
          })
        })
      }
      setTagQuestionsMap(tagQuestionMap)
      setIsLoading(false)
    }
  }, [selectedDatasetId, getFaqs, getHelpQuestions])

  useEffect(() => {
    fetchFaqAndHelpQuestions()
  }, [fetchFaqAndHelpQuestions])

  const tags = tagQuestionsMap ? Object.keys(tagQuestionsMap) : []

  const getFilteredQuestions = () => {
    let questions: string[] = []
    if (filterTags.length) {
      questions = filterTags.reduce((tmpQuestions: string[], tag: string) => {
        const questionsByTag = tagQuestionsMap ? tagQuestionsMap[tag] : []
        return tmpQuestions.concat(questionsByTag)
      }, [])
    } else {
      questions = tagQuestionsMap
        ? Object.values(tagQuestionsMap).flatMap(item => item)
        : []
    }
    return [...new Set(questions)]
  }

  return {
    tagQuestionsMap,
    tags,
    questions: getFilteredQuestions(),
    isLoading,
    filterTags,
    setFilterTags,
  }
}
