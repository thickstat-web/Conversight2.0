import React, { useState } from 'react'
import {
  webViewRender,
  emit,
  useNativeMessage,
} from 'react-native-react-bridge/lib/web'
// import './example.css'
// Images are loaded as base64 encoded string
// import image from '../Assets/Images/logo.png'

const Root = () => {
  const [data, setData] = useState('')
  console.log('[WebApp] Root....')
  // useNativeMessage hook receives message from React Native
  useNativeMessage(message => {
    if (message.type === 'success') {
      setData(message.data)
    }
  })
  return (
    <div style={{ backgroundColor: 'green' }}>
      {/* <img src={Images.logo} /> */}
      <div>{data}</div>
      <p style={{ color: 'blue' }}>{'Hai, How are you?'}</p>
      <button
        type={'button'}
        onClick={() => {
          // emit sends message to React Native
          //   type: event name
          //   data: some data which will be serialized by JSON.stringify
          // emit({ type: 'hello', data: jq })
          // console.dir(jq)
        }}
      >
        Send Message
      </button>
    </div>
  )
}

// This statement is detected by babelTransformer as an entry point
// All dependencies are resolved, compressed and stringified into one file
export default webViewRender(<Root />)
