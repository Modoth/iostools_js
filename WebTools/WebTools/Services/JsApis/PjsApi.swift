//
//  PjsApi.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/28.
//

import Foundation
import CoreData

protocol PjsApi{
    func invoke(info: JsApiParameter, appId: String, context: NSManagedObjectContext) -> JsApiResult;
}
