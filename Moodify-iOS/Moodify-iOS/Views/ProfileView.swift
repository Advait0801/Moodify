//
//  ProfileView.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import SwiftUI

struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    @ObservedObject private var auth = AuthStorage.shared
    @Environment(\.layoutMetrics) private var layout
    @State private var showImagePicker = false
    @State private var selectedImage: UIImage?
    @FocusState private var passwordFocused: Bool

    private func initials(for user: User) -> String {
        let base = user.username?.trimmingCharacters(in: .whitespaces) ?? String(user.email.split(separator: "@").first ?? "")
        if base.isEmpty { return "?" }
        if base.count >= 2 { return String(base.prefix(2)).uppercased() }
        return String(base.first ?? "?").uppercased()
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: layout.spacingL) {
                if let user = viewModel.user {
                    VStack(alignment: .leading, spacing: layout.spacingM) {
                        HStack(spacing: layout.spacingM) {
                            ZStack {
                                Circle()
                                    .fill(
                                        LinearGradient(colors: [Color("Primary"), Color("Accent")], startPoint: .topLeading, endPoint: .bottomTrailing)
                                    )
                                    .frame(width: layout.scaled(80), height: layout.scaled(80))
                                if let urlString = user.profilePicture, urlString.hasPrefix("data:"), let comma = urlString.firstIndex(of: ",") {
                                    let base64 = String(urlString[urlString.index(after: comma)...])
                                    if let data = Data(base64Encoded: base64), let img = UIImage(data: data) {
                                        Image(uiImage: img)
                                            .resizable()
                                            .scaledToFill()
                                            .frame(width: layout.scaled(80), height: layout.scaled(80))
                                            .clipShape(Circle())
                                    } else {
                                        Text(initials(for: user))
                                            .font(.title.bold())
                                            .foregroundColor(.white)
                                    }
                                } else {
                                    Text(initials(for: user))
                                        .font(.title.bold())
                                        .foregroundColor(.white)
                                }
                            }
                            VStack(alignment: .leading, spacing: layout.spacingS) {
                                Text("Profile")
                                    .font(.title2.bold())
                                    .foregroundColor(Color("TextPrimary"))
                                if let username = user.username, !username.isEmpty {
                                    Text(username)
                                        .font(.subheadline)
                                        .foregroundColor(Color("TextPrimary"))
                                }
                                Text(user.email)
                                    .font(.subheadline)
                                    .foregroundColor(Color("TextSecondary"))
                            }
                            Spacer()
                        }
                        Button {
                            showImagePicker = true
                        } label: {
                            Text(viewModel.user?.profilePicture != nil ? "Update photo" : "Add photo")
                                .font(.subheadline.weight(.medium))
                                .foregroundColor(Color("Primary"))
                        }
                        .disabled(viewModel.pictureLoading)
                    }
                    .padding(layout.cardPadding)
                    .background(Color("Surface"))
                    .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                }

                VStack(alignment: .leading, spacing: layout.spacingM) {
                    Text("Change password")
                        .font(.headline)
                        .foregroundColor(Color("TextPrimary"))
                    if let msg = viewModel.errorMessage {
                        Text(msg)
                            .font(.caption)
                            .foregroundColor(.red)
                            .onTapGesture { viewModel.clearError() }
                    }
                    VStack(alignment: .leading, spacing: layout.spacingS) {
                        Text("Current password")
                            .font(.caption.weight(.medium))
                            .foregroundColor(Color("TextSecondary"))
                        SecureField("••••••••", text: $viewModel.currentPassword)
                            .textContentType(.password)
                            .focused($passwordFocused)
                            .padding(layout.spacingM)
                            .background(Color("Surface"))
                            .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                    }
                    VStack(alignment: .leading, spacing: layout.spacingS) {
                        Text("New password")
                            .font(.caption.weight(.medium))
                            .foregroundColor(Color("TextSecondary"))
                        SecureField("••••••••", text: $viewModel.newPassword)
                            .textContentType(.newPassword)
                            .focused($passwordFocused)
                            .padding(layout.spacingM)
                            .background(Color("Surface"))
                            .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                    }
                    VStack(alignment: .leading, spacing: layout.spacingS) {
                        Text("Confirm new password")
                            .font(.caption.weight(.medium))
                            .foregroundColor(Color("TextSecondary"))
                        SecureField("••••••••", text: $viewModel.confirmPassword)
                            .textContentType(.newPassword)
                            .focused($passwordFocused)
                            .padding(layout.spacingM)
                            .background(Color("Surface"))
                            .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                    }
                    Button {
                        passwordFocused = false
                        Task { await viewModel.changePassword() }
                    } label: {
                        Group {
                            if viewModel.passwordLoading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text("Update password")
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, layout.spacingM)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(Color("Primary"))
                    .disabled(viewModel.passwordLoading)
                }
                .padding(layout.cardPadding)
                .background(Color("Surface"))
                .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))

                VStack(alignment: .leading, spacing: layout.spacingM) {
                    Text("Past recommendations")
                        .font(.headline)
                        .foregroundColor(Color("TextPrimary"))
                    if viewModel.history.isEmpty {
                        Text("No past analyses yet.")
                            .font(.subheadline)
                            .foregroundColor(Color("TextSecondary"))
                            .padding(layout.spacingM)
                    } else {
                        ForEach(viewModel.history) { entry in
                            HStack {
                                Text(entry.emotion)
                                    .font(.subheadline.weight(.medium))
                                    .padding(.horizontal, layout.spacingM)
                                    .padding(.vertical, layout.spacingS)
                                    .background(Color.moodifyMood(for: entry.emotion).opacity(0.2))
                                    .clipShape(Capsule())
                                Text(entry.inputType == "photo" ? "Photo" : "Text")
                                    .font(.caption)
                                    .foregroundColor(Color("TextSecondary"))
                                Spacer()
                                Text(entry.date.formatted(date: .abbreviated, time: .shortened))
                                    .font(.caption)
                                    .foregroundColor(Color("TextSecondary"))
                            }
                            .padding(.vertical, layout.spacingS)
                            .padding(.horizontal, layout.spacingM)
                            .background(Color("Surface"))
                            .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                        }
                    }
                }
            }
            .padding(layout.spacingM)
        }
        .scrollContentBackground(.hidden)
        .background(Color("Background"))
        .navigationTitle("Profile")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Sign out") {
                    auth.clear()
                }
                .foregroundColor(.red)
            }
        }
        .onAppear {
            viewModel.loadHistory()
        }
        .sheet(isPresented: $showImagePicker) {
            ImagePicker(source: .library, onPick: { img in
                selectedImage = img
                showImagePicker = false
                Task { await viewModel.updateProfilePicture(img) }
            }, onCancel: { showImagePicker = false })
        }
    }
}
