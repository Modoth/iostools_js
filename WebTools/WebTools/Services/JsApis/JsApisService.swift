//
//  JsApiHandler.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/28.
//

import Foundation
import CoreData

struct JsApisService {
    let apis : Dictionary<String,PjsApi>
    let appId: String
    let context: NSManagedObjectContext
    
    init(apis: Dictionary<String, PjsApi>, appId: String, context: NSManagedObjectContext) {
        var allApis : Dictionary<String, PjsApi> = [ JS_API_LOCAL_STORAGE_NAME : JsApiLocalStorage()]
        allApis.merge(apis) {(current,_) in current}
        self.apis = allApis
        self.appId = appId
        self.context = context
    }
    
    func invoke(info: JsApiParameter) -> JsApiResult{
        guard let h = apis[info.api] else  {
            return .Failed
        }
        return h.invoke(info:info, appId: appId, context: context)
    }
}
