// @flow

import React, { useEffect, useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { WebView } from "react-native-webview";

const heightUnits = Platform.OS === "ios" ? "vh" : "%";

const getHTML = (svgContent, style) => `
<html data-key="key-${style.height}-${style.width}">
    <head>
        <meta name='viewport' content='initial-scale=1.0, maximum-scale=3.0, minimum-scale=0.5'/>
        <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100${heightUnits};
        width: 100${heightUnits};
        overflow: hidden;
        background-color: transparent;
      }
      svg {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
  </style>
  </head>
  <body>
    ${svgContent}
</body>
</html>
`;

function SvgImage({
    source,
    onLoadStart,
    onLoadEnd,
    style,
    containerStyle,
    onError,
}) {
    const [svgContent, setSvgContent] = useState(null);

    const uri = source && source.uri;

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        async function doFetch() {
            if (uri) {
                onLoadStart && onLoadStart();
                if (uri.match(/^data:image\/svg/)) {
                    const index = uri.indexOf("<svg");
                    setSvgContent(uri.slice(index));
                } else {
                    try {
                      const res = await fetch(uri, { signal });
                      if (res.status != 200) {
                        onError();
                        return;
                      }
                        const text = await res.text();
                        setSvgContent(text);
                    } catch (err) {
                        onError();
                    }
                }
                onLoadEnd && onLoadEnd();
            }
        }

        doFetch();

        return () => {
            controller.abort();
        };
    }, [uri]);

    if (svgContent) {
        const flattenedStyle = StyleSheet.flatten(style) || {};
        const html = getHTML(svgContent, flattenedStyle);

        return (
            <View
                pointerEvents="none"
                style={[style, containerStyle]}
                renderToHardwareTextureAndroid={true}
            >
                <WebView
                    originWhitelist={["*"]}
                    scalesPageToFit={true}
                    onError={ onError }
                    style={[
                        {
                            width: 200,
                            height: 100,
                            backgroundColor: "transparent",
                        },
                        style,
                    ]}
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    source={{ html }}
                />
            </View>
        );
    } else {
        return <View pointerEvents="none" style={[containerStyle, style]} />;
    }
}

export default SvgImage;
