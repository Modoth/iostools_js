//
//  FullScreenWKWebView.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/28.
//

import SwiftUI
import WebKit

class FullScreenWKWebView : WKWebView{
    override open var safeAreaInsets: UIEdgeInsets {
        return UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0)
    }
}
