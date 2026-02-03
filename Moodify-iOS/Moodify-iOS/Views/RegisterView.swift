import SwiftUI

struct RegisterView: View {
    @StateObject private var viewModel = AuthViewModel()
    @Environment(\.layoutMetrics) private var layout
    @FocusState private var focused: Bool

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: layout.spacingL) {
                Text("Create account")
                    .font(.title.bold())
                    .foregroundColor(Color("TextPrimary"))
                if let msg = viewModel.errorMessage {
                    Text(msg)
                        .font(.subheadline)
                        .foregroundColor(.red)
                        .padding(layout.spacingS)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.red.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
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
                        .overlay(
                            RoundedRectangle(cornerRadius: layout.cardCorner)
                                .stroke(Color("Divider"), lineWidth: 1)
                        )
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
                        .overlay(
                            RoundedRectangle(cornerRadius: layout.cardCorner)
                                .stroke(Color("Divider"), lineWidth: 1)
                        )
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
                        .overlay(
                            RoundedRectangle(cornerRadius: layout.cardCorner)
                                .stroke(Color("Divider"), lineWidth: 1)
                        )
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
                        .overlay(
                            RoundedRectangle(cornerRadius: layout.cardCorner)
                                .stroke(Color("Divider"), lineWidth: 1)
                        )
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
                .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                .scaleEffect(viewModel.isLoading ? 0.98 : 1)
                .animation(.easeInOut(duration: 0.2), value: viewModel.isLoading)
            }
            .padding(layout.spacingM)
        }
        .scrollContentBackground(.hidden)
        .background(
            LinearGradient(colors: [Color("Background"), Color("Background").opacity(0.95)], startPoint: .top, endPoint: .bottom)
        )
        .navigationTitle("Moodify")
        .navigationBarTitleDisplayMode(.inline)
    }
}
