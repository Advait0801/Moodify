//
//  RegisterView.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import SwiftUI

struct RegisterView: View {
    @StateObject private var viewModel = AuthViewModel()
    @Environment(\.layoutMetrics) private var layout
    @FocusState private var focused: Bool

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: layout.spacingL) {
                Text("Create account")
                    .font(.title2.bold())
                    .foregroundColor(Color("TextPrimary"))
                if let msg = viewModel.errorMessage {
                    Text(msg)
                        .font(.subheadline)
                        .foregroundColor(.red)
                        .onTapGesture { viewModel.clearError() }
                }
                VStack(alignment: .leading, spacing: layout.spacingS) {
                    Text("Email")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(Color("TextSecondary"))
                    TextField("you@example.com", text: $viewModel.email)
                        .textContentType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .autocorrectionDisabled()
                        .focused($focused)
                        .padding(layout.spacingM)
                        .background(Color("Surface"))
                        .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                }
                VStack(alignment: .leading, spacing: layout.spacingS) {
                    Text("Username")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(Color("TextSecondary"))
                    TextField("johndoe", text: $viewModel.username)
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
                        .textContentType(.newPassword)
                        .focused($focused)
                        .padding(layout.spacingM)
                        .background(Color("Surface"))
                        .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                }
                VStack(alignment: .leading, spacing: layout.spacingS) {
                    Text("Confirm password")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(Color("TextSecondary"))
                    SecureField("••••••••", text: $viewModel.confirmPassword)
                        .textContentType(.newPassword)
                        .focused($focused)
                        .padding(layout.spacingM)
                        .background(Color("Surface"))
                        .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                }
                Button {
                    focused = false
                    Task { await viewModel.register() }
                } label: {
                    Group {
                        if viewModel.isLoading {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Text("Create account")
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, layout.spacingM)
                }
                .buttonStyle(.borderedProminent)
                .tint(Color("Primary"))
                .disabled(viewModel.isLoading)
            }
            .padding(layout.spacingM)
        }
        .scrollContentBackground(.hidden)
        .background(Color("Background"))
        .navigationTitle("Moodify")
        .navigationBarTitleDisplayMode(.inline)
    }
}
