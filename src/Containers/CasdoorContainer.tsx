import { View, Dimensions } from 'react-native';
import React, { useState, useRef } from 'react';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '@/Hooks';
import { DRAWER_NAVIGATOR } from '@/Constants/screens';
import { setAuthData, setPassword } from '@/Store/Auth';
import { navigateAndSimpleReset } from '@/Navigators/utils';
import { setCustomHosts } from '@/Config';
import { ConfigResponse } from '@/Types/SignInResponse'
import { setCustomHost } from '@/Store/HostURL';


type RouteParams = {
  redirectURL: string;
};

export default function CasdoorContainer({ route }: any) {
  const { redirectURL } = route.params as RouteParams;
  const buildRedirectUrl = `https://${redirectURL}`;
  const { height } = Dimensions.get('screen');
  const [webviewVisible, setWebviewVisible] = useState(true);
  const dispatch = useAppDispatch();
  const webViewRef = useRef(null);

  // Inject JS to capture fetch & XHR responses
  const injectedJS = `
    (function() {
      const originalFetch = window.fetch;
      window.fetch = function() {
        return originalFetch.apply(this, arguments).then(response => {
          response.clone().json().then(data => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              url: response.url,
              status: response.status,
              data: data
            }));
          }).catch(() => {});
          return response;
        });
      };

      const originalXHR = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              url: this.responseURL,
              status: this.status,
              data: this.responseText
            }));
          } catch (e) {}
        });
        originalXHR.apply(this, arguments);
      };
    })();
  `;

  const handleUrlChange = async (syntheticEvent: { nativeEvent: any }) => {
    const { nativeEvent } = syntheticEvent;
    const currentUrl = nativeEvent.url;
    if (currentUrl.includes('/redirect?token=')) {
      setWebviewVisible(false);
      try {
        const match = currentUrl?.match(/token=([^&]+)/);
        const token = match ? match[1] : null;

        if (token) {
          console.log('Extracted Token:', token);
          await AsyncStorage.setItem('authToken', token);
          const authData = {
            authentication: 'success',
            token: token,
            isCasdoorOrg: true
          }
          dispatch(setAuthData(authData));
          dispatch(setPassword(''));
          navigateAndSimpleReset(DRAWER_NAVIGATOR);
        }
      } catch (error) {
        console.log('Error extracting token:', error);
      }
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const messageData = JSON.parse(event.nativeEvent.data);
      if (messageData.url && messageData.url.endsWith('/config')) {
        if (messageData.data) {
          let parsedResponse: ConfigResponse
          try {
            parsedResponse = JSON.parse(messageData.data);
            const { apiServerHost, botServerHost, ingressServerHost } = parsedResponse?.apiGateway?.default
            setCustomHosts(apiServerHost, botServerHost, ingressServerHost)
            const customHost = {
              apiServerHost, botServerHost, ingressServerHost
            }
            dispatch(setCustomHost(customHost))
            await AsyncStorage.setItem('customHost', JSON.stringify(customHost));
          } catch (innerErr) {
            console.log('Response is not valid JSON:', innerErr);
          }
        }
      }
    } catch (err) {
      console.log('Error parsing WebView message:', err);
    }
  };

  return (
    <View style={{ height: height }}>
      {webviewVisible && (
        <WebView
          ref={webViewRef}
          onLoadStart={handleUrlChange}
          injectedJavaScript={injectedJS}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          source={{ uri: buildRedirectUrl }}
        />
      )}
    </View>
  );
}
