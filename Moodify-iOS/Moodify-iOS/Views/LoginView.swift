//
//  LoginView.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import SwiftUI

struct LoginView: View {
    @StateObject private var viewModel = AuthViewModel()
    @Environment(\.layoutMetrics) private var layout
    @FocusState private var focused: Bool

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: layout.spacingL) {
                Text("Sign in")
                    .font(.title2.bold())
                    .foregroundColor(Color("TextPrimary"))
                if let msg = viewModel.errorMessage {
                    Text(msg)
                        .font(.subheadline)
                        .foregroundColor(.red)
                        .onTapGesture { viewModel.clearError() }
                }
                VStack(alignment: .leading, spacing: layout.spacingS) {
                    Text("Email or username")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(Color("TextSecondary"))
                    TextField("you@example.com or username", text: $viewModel.email)
                        .textContentType(.username)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .focused($focused)
                        .padding(layout.spacingM)
                        .background(Color("Surface"))
                        .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                }
                VStack(alignment: .leading, spacing: layout.spacingS) {
                    Text("Password")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(Color("TextSecondary"))
                    SecureField("••••••••", text: $viewModel.password)
                        .textContentType(.password)
                        .focused($focused)
                        .padding(layout.spacingM)
                        .background(Color("Surface"))
                        .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                }
                Button {
                    focused = false
                    Task { await viewModel.login() }
                } label: {
                    Group {
                        if viewModel.isLoading {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Text("Sign in")
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, layout.spacingM)
                }
                .buttonStyle(.borderedProminent)
                .tint(Color("Primary"))
                .disabled(viewModel.isLoading)
                NavigationLink("Create account") {
                    RegisterView()
                }
                .foregroundColor(Color("Primary"))
                .buttonStyle(.plain)
            }
            .padding(layout.spacingM)
        }
        .scrollContentBackground(.hidden)
        .background(Color("Background"))
        .navigationTitle("Moodify")
        .navigationBarTitleDisplayMode(.inline)
    }
}
