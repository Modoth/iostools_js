//
//  JsApiResult.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/28.
//

import Foundation

struct JsApiResult{
    static let Successed = JsApiResult(success: true, value: nil)
    static let Failed = JsApiResult(success: false, value: nil)
    let success: Bool
    let value: Encodable?
}
