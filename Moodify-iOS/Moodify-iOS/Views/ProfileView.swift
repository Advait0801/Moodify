import SwiftUI
import Combine

struct ProfileView: View {
    private static func parseUploadDate(_ s: String) -> Date? {
        let withFrac = ISO8601DateFormatter()
        withFrac.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return withFrac.date(from: s) ?? ISO8601DateFormatter().date(from: s)
    }

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
                                    .shadow(color: Color("Primary").opacity(0.35), radius: 10, x: 0, y: 4)
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
                    .background(
                        RoundedRectangle(cornerRadius: layout.cardCorner)
                            .fill(Color("Surface"))
                            .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
                    )
                }

                VStack(alignment: .leading, spacing: layout.spacingM) {
                    Text("Spotify")
                        .font(.headline)
                        .foregroundColor(Color("TextPrimary"))
                    Text("Link your Spotify account for personalized playlists.")
                        .font(.caption)
                        .foregroundColor(Color("TextSecondary"))
                    if viewModel.spotifyConnected == true {
                        HStack(spacing: layout.spacingS) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(Color(red: 29/255, green: 185/255, blue: 84/255))
                            Text("Connected")
                                .font(.subheadline.weight(.medium))
                                .foregroundColor(Color(red: 29/255, green: 185/255, blue: 84/255))
                        }
                        .padding(.vertical, layout.spacingS)
                    } else if viewModel.spotifyConnected == false {
                        Button {
                            Task { await viewModel.connectSpotify() }
                        } label: {
                            HStack(spacing: layout.spacingS) {
                                if viewModel.spotifyConnectLoading {
                                    ProgressView()
                                        .scaleEffect(0.8)
                                        .tint(Color(red: 29/255, green: 185/255, blue: 84/255))
                                } else {
                                    Image(systemName: "music.note")
                                        .font(.subheadline.weight(.medium))
                                }
                                Text(viewModel.spotifyConnectLoading ? "Opening…" : "Connect Spotify")
                                    .font(.subheadline.weight(.medium))
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, layout.spacingM)
                            .background(Color(red: 29/255, green: 185/255, blue: 84/255).opacity(0.15))
                            .foregroundColor(Color(red: 29/255, green: 185/255, blue: 84/255))
                        }
                        .buttonStyle(.plain)
                        .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                        .overlay(
                            RoundedRectangle(cornerRadius: layout.cardCorner)
                                .stroke(Color(red: 29/255, green: 185/255, blue: 84/255).opacity(0.4), lineWidth: 1)
                        )
                        .disabled(viewModel.spotifyConnectLoading)
                    } else {
                        Text("Loading…")
                            .font(.subheadline)
                            .foregroundColor(Color("TextSecondary"))
                    }
                }
                .padding(layout.cardPadding)
                .background(
                    RoundedRectangle(cornerRadius: layout.cardCorner)
                        .fill(Color("Surface"))
                        .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
                )

                VStack(alignment: .leading, spacing: layout.spacingM) {
                    Text("Change password")
                        .font(.headline)
                        .foregroundColor(Color("TextPrimary"))
                    if let msg = viewModel.errorMessage {
                        Text(msg)
                            .font(.caption)
                            .foregroundColor(.red)
                            .padding(layout.spacingS)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.red.opacity(0.1))
                            .clipShape(RoundedRectangle(cornerRadius: 10))
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
                            .overlay(
                                RoundedRectangle(cornerRadius: layout.cardCorner)
                                    .stroke(Color("Divider"), lineWidth: 1)
                            )
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
                            .overlay(
                                RoundedRectangle(cornerRadius: layout.cardCorner)
                                    .stroke(Color("Divider"), lineWidth: 1)
                            )
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
                            .overlay(
                                RoundedRectangle(cornerRadius: layout.cardCorner)
                                    .stroke(Color("Divider"), lineWidth: 1)
                            )
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
                    .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                    .scaleEffect(viewModel.passwordLoading ? 0.98 : 1)
                    .animation(.easeInOut(duration: 0.2), value: viewModel.passwordLoading)
                }
                .padding(layout.cardPadding)
                .background(
                    RoundedRectangle(cornerRadius: layout.cardCorner)
                        .fill(Color("Surface"))
                        .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 4)
                )

                VStack(alignment: .leading, spacing: layout.spacingM) {
                    Text("Past recommendations")
                        .font(.headline)
                        .foregroundColor(Color("TextPrimary"))
                    if viewModel.uploadsLoading {
                        Text("Loading…")
                            .font(.subheadline)
                            .foregroundColor(Color("TextSecondary"))
                            .padding(layout.spacingM)
                    } else if viewModel.uploads.isEmpty {
                        Text("No uploads yet. Your photos and text will appear here.")
                            .font(.subheadline)
                            .foregroundColor(Color("TextSecondary"))
                            .padding(layout.spacingM)
                    } else {
                        ForEach(viewModel.uploads) { item in
                            HStack(alignment: .top, spacing: layout.spacingM) {
                                if item.isImage {
                                    if let img = viewModel.uploadImages[item.id] {
                                        Image(uiImage: img)
                                            .resizable()
                                            .scaledToFill()
                                            .frame(width: layout.scaled(56), height: layout.scaled(56))
                                            .clipShape(RoundedRectangle(cornerRadius: 8))
                                    } else {
                                        RoundedRectangle(cornerRadius: 8)
                                            .fill(Color("Surface"))
                                            .frame(width: layout.scaled(56), height: layout.scaled(56))
                                            .overlay(Text("…").font(.caption).foregroundColor(Color("TextSecondary")))
                                    }
                                } else {
                                    Text(item.text_content ?? "—")
                                        .font(.subheadline)
                                        .foregroundColor(Color("TextPrimary"))
                                        .lineLimit(2)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                                Spacer(minLength: layout.spacingS)
                                if let date = Self.parseUploadDate(item.created_at) {
                                    Text(date.formatted(date: .abbreviated, time: .shortened))
                                        .font(.caption)
                                        .foregroundColor(Color("TextSecondary"))
                                }
                            }
                            .padding(layout.spacingM)
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color("Surface"))
                                    .shadow(color: .black.opacity(0.04), radius: 4, x: 0, y: 2)
                            )
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
                .font(.subheadline.weight(.medium))
            }
        }
        .onAppear {
            viewModel.loadUploads()
            viewModel.loadSpotifyStatus()
        }
        .onReceive(NotificationCenter.default.publisher(for: .spotifyConnectCompleted)) { _ in
            viewModel.loadSpotifyStatus()
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
