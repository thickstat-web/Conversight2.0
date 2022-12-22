import React from 'react'
import { WebExplorer } from '@/Components'

type WebExplorerContainerProps = {
  route: {
    params: {
      url: string
    }
  }
}

const WebExplorerContainer = ({ route }: WebExplorerContainerProps) => {
  const { url } = route.params

  return <WebExplorer url={url} loaderSize={'large'} />
}

export default WebExplorerContainer
