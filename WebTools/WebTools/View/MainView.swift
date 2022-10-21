//
//  MainView.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/26.
//

import SwiftUI
import CoreData

struct MainView: View, PjsApi{
    let apps : [AppInfo]
    let homeApp : AppInfo?
    @State var openedApp: AppInfo? = nil
    
    init(){
        (self.homeApp, self.apps) = AppInfosService().get()
    }
    
    var body: some View {
        ZStack{
            if let app = homeApp {
                AppView(app: app, apis:  [JS_API_APP_NAME: self], cacheType: .always(app.id))
            }
            if let app = openedApp {
                AppView(app: app, apis:  [JS_API_APP_NAME: self], cacheType: .auto(app.id))
            }
        }
    }
    
    func invoke(info: JsApiParameter, appId: String, context: NSManagedObjectContext) -> JsApiResult{
        switch info.method {
        case JS_API_APP_CLOSE:
            openedApp = nil
            return .Successed
        case JS_API_APP_GET:
            return JsApiResult(success: true, value: apps)
        case JS_API_APP_OPEN:
            let id = info.parameters.first as? String
            let app = apps.first{$0.id == id}
            openedApp = app
            return .Successed
        default:
            return .Failed
        }
    }
}
