//
//  WebViewCacheManager.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/28.
//

import Foundation
import WebKit

enum WebViewCacheType {
    case none
    case always(String)
    case auto(String)
}

class WebViewCacheManager{
    static let shared = WebViewCacheManager()
    let maxAutoCacheCount = 10
    var caches = Dictionary<String, WKWebView>()
    var autoList = [String]()
    func getOrCreate(_ cacheType: WebViewCacheType, create: () -> WKWebView) -> WKWebView {
        defer{
            if case .auto(let id) = cacheType {
                autoList = autoList.filter {$0 != id }
                autoList.append(id)
                if autoList.count > maxAutoCacheCount {
                    let removeId = autoList.remove(at: 0)
                    caches.removeValue(forKey: removeId)
                }
            }
        }
        switch cacheType{
        case .always(let id), .auto(let id):
            if let webView = caches[id] {
                return webView
            }
            let webView = create()
            caches[id] = webView
            return webView
        default:
            return create()
        }
    }
}
