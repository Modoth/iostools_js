//
//  AppView.swift
//  WebTools
//
//  Created by 周雪芹 on 2022/7/26.
//

import SwiftUI

struct AppInfoView: View {
    let app: AppInfo
    let action: () -> Void
    var body: some View {
        VStack(alignment: .leading) {
            Text(app.name)
                .font(.headline)
                .accessibilityAddTraits(.isHeader)
                .padding(EdgeInsets(top: 0, leading: 0, bottom: 5, trailing: 0))
            HStack {
                Label(app.description, systemImage: "clock")
                Spacer()
            }
            .font(.caption)
        }
        .onTapGesture(perform: {
            self.action()
        })
        .padding(10)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}
