//
//  JsApiLocalStorage.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/28.
//

import Foundation
import CoreData

struct JsApiLocalStorage: PjsApi {
    private func getItemByKey(_ context:NSManagedObjectContext, _ appId: String, _ key: String)
    throws ->  AppStorageItem?  {
        let req = AppStorageItem.fetchRequest()
        req.fetchLimit = 1
        req.predicate = NSCompoundPredicate(
            andPredicateWithSubpredicates: [
                NSPredicate(
                    format: "appId = %@", appId
                ),
                NSPredicate(
                    format: "key = %@", key
                )
            ]
        )
        let item = try context.fetch(req).first
        return item
    }
    
    func invoke(info: JsApiParameter, appId: String, context: NSManagedObjectContext) -> JsApiResult{
        switch info.method {
        case JS_API_LOCAL_STORAGE_SETITEM:
            do {
                var item = try getItemByKey(context, appId, info.parameters[0] as!   String)
                if item == nil {
                    item = AppStorageItem(context: context)
                    item!.appId = appId
                    item!.key = info.parameters[0] as? String
                }
                item!.value = info.parameters[1] as? String
                try context.save()
                return .Successed
            }catch{
                return .Failed
            }
            
        case JS_API_LOCAL_STORAGE_REMOVEITEM:
            do {
                guard let item = try getItemByKey(context, appId, info.parameters[0] as!   String) else {
                    return .Successed
                }
                context.delete(item)
                try context.save()
                return .Successed
            }catch{
                return .Failed
            }
            
        case JS_API_LOCAL_STORAGE_GETITEM:
            do {
                let item = try getItemByKey(context, appId, info.parameters[0] as!   String)
                if item == nil {
                    return .Successed
                }else{
                    return JsApiResult(success: true, value: item!.value)
                }
            } catch {
                return .Failed
            }
        case JS_API_LOCAL_STORAGE_CLEAR:
            let req = AppStorageItem.fetchRequest()
            req.predicate = NSPredicate(
                format: "appId = %@", appId
            )
            do {
                let items = try context.fetch(req)
                for item in items{
                    context.delete(item)
                }
                try context.save()
                return .Successed
            } catch {
                return .Failed
            }
        case JS_API_LOCAL_STORAGE_CLEAR_ALL:
            let req = AppStorageItem.fetchRequest()
            do {
                let items = try context.fetch(req)
                for item in items{
                    context.delete(item)
                }
                try context.save()
                return .Successed
            } catch {
                return .Failed
            }
        default:
            return .Failed
        }
    }
}
