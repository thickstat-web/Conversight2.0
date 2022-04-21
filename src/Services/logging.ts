import {
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/dist/query'
import { QueryReturnValue } from '@reduxjs/toolkit/dist/query/baseQueryTypes'

export const logRequestResponse = async (
  result: QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>,
) => {
  console.log(`${result.meta?.request.method} ${result.meta?.request.url}`)
  if (
    result.meta?.request.method &&
    ['POST', 'PUT'].includes(result.meta?.request.method)
  ) {
    const data = JSON.stringify(await result.meta?.request.json())
    console.log(`Req. Data: ${data}`)
  }
  if (result.data) {
    console.log(`Res. Data: ${JSON.stringify(result.data)}`)
  } else if (result.error) {
    console.error(`Res. Error: ${JSON.stringify(result.error)}`)
  }
}
