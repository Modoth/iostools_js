//
//  AppView.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/28.
//

import SwiftUI

struct AppView : View{
    @Environment(\.managedObjectContext) private var viewContext
    let app: AppInfo
    let apis : Dictionary<String,PjsApi>
    let cacheType: WebViewCacheType
    var body: some View {
        let url = AppInfosService().getAppUrl(app)
        WebView(url: url!,
                apisService: JsApisService(apis: apis, appId: app.id, context: viewContext),
                cacheType: cacheType)
        .edgesIgnoringSafeArea(.all)
    }
}
