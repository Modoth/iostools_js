//
//  WebView.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/26.
//

import SwiftUI
import WebKit

struct WebView : UIViewRepresentable {
    let url: URL
    let apisService: JsApisService
    let cacheType: WebViewCacheType
    func makeUIView(context: Context) -> WKWebView  {
        return WebViewCacheManager.shared.getOrCreate(cacheType, create: { ()  in createWebView(apisService)})
    }
    
    func updateUIView(_ webView: WKWebView, context: Context) {
        if webView.url?.relativePath == url.relativePath {
            return
        }
        webView.loadFileURL(url, allowingReadAccessTo: url)
    }
}

private func createWebView(_ apisService: JsApisService) -> WKWebView {
    let userContent = WKUserContentController.init()
    let script = WKUserScript.init(source: apisService.getInjectedCode(maxTid: 1000, jsTaskHandlerName: JS_API_MESSAGE_NAME), injectionTime: .atDocumentStart, forMainFrameOnly: true)
    userContent.addUserScript(script)
    let config = WKWebViewConfiguration.init()
    config.userContentController = userContent
    let webView = FullScreenWKWebView(frame: UIScreen.main.bounds, configuration: config)
    webView.scrollView.bounces = false
    let contentController = WebViewController(parent: webView, jsApiHandler: apisService)
    webView.configuration.userContentController.add(contentController, name: JS_API_MESSAGE_NAME)
    webView.configuration.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
    return webView
}
