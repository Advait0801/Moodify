//
//  ContentView.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import SwiftUI

struct ContentView: View {
    @ObservedObject private var auth = AuthStorage.shared

    var body: some View {
        Group {
            if auth.isLoggedIn {
                MainTabView()
            } else {
                NavigationStack {
                    LoginView()
                }
            }
        }
        .animation(.easeInOut(duration: 0.25), value: auth.isLoggedIn)
        .tint(Color("Primary"))
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            NavigationStack {
                DashboardView()
            }
            .tabItem {
                Label("Home", systemImage: "house.fill")
            }
            NavigationStack {
                AnalyzeView()
            }
            .tabItem {
                Label("Analyze", systemImage: "waveform.path.ecg")
            }
            NavigationStack {
                ProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person.fill")
            }
        }
        .tint(Color("Primary"))
    }
}
