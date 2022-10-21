//
//  AppsService.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/28.
//

import Foundation

private let webInfoPath = "infos.json"
private let webDir = "Web"
private let webHomePath = "home/index.html"

struct AppInfosService{
    func get() -> (AppInfo?, [AppInfo]){
        guard let url = Bundle.main.url(forResource: webInfoPath, withExtension: nil, subdirectory: webDir),
              let data = try? Data(contentsOf: url),
              let apps = try? JSONDecoder().decode([AppInfo].self, from: data)
        else{
            return (nil, [])
        }
        return (apps.first{$0.id == webHomePath }, apps.filter{$0.id != webHomePath})
    }
    
    func getAppUrl(_ app : AppInfo) -> URL? {
        return Bundle.main.url(forResource: app.id, withExtension: nil, subdirectory: webDir)
    }
}
