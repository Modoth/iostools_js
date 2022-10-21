//
//  WebToolsApp.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/26.
//

import SwiftUI

@main
struct WebToolsApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            MainView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
