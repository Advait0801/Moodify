import SwiftUI

struct ResultNavigationWrapper: Identifiable {
    let id = UUID()
    let value: MoodAnalyzeResponse
}

struct AnalyzeView: View {
    @StateObject private var viewModel = AnalyzeViewModel()
    @Environment(\.layoutMetrics) private var layout
    @State private var showImageSource = false
    @State private var showLibrary = false
    @State private var showCamera = false
    @State private var resultToShow: ResultNavigationWrapper?
    @FocusState private var textFocused: Bool

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: layout.spacingL) {
                Picker("Mode", selection: $viewModel.mode) {
                    Text("Photo").tag(AnalyzeMode.photo)
                    Text("Text").tag(AnalyzeMode.text)
                }
                .pickerStyle(.segmented)
                .onChange(of: viewModel.mode) { _, _ in
                    viewModel.image = nil
                    viewModel.text = ""
                }

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

                switch viewModel.mode {
                case .photo:
                    VStack(alignment: .leading, spacing: layout.spacingM) {
                        if let img = viewModel.image {
                            Image(uiImage: img)
                                .resizable()
                                .scaledToFit()
                                .frame(maxHeight: layout.scaled(280))
                                .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                                .overlay(
                                    RoundedRectangle(cornerRadius: layout.cardCorner)
                                        .stroke(Color("Divider"), lineWidth: 1)
                                )
                            Button("Remove") {
                                viewModel.image = nil
                            }
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(Color("TextSecondary"))
                        } else {
                            Button {
                                showImageSource = true
                            } label: {
                                VStack(spacing: layout.spacingM) {
                                    Image(systemName: "photo.badge.plus")
                                        .font(.system(size: 48))
                                        .foregroundStyle(
                                            LinearGradient(colors: [Color("Primary").opacity(0.8), Color("Accent").opacity(0.8)], startPoint: .topLeading, endPoint: .bottomTrailing)
                                        )
                                    Text("Tap to add photo")
                                        .font(.subheadline)
                                        .foregroundColor(Color("TextSecondary"))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(layout.spacingXL)
                                .background(
                                    RoundedRectangle(cornerRadius: layout.cardCorner)
                                        .fill(Color("Surface"))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: layout.cardCorner)
                                                .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [8]))
                                                .foregroundColor(Color("Divider"))
                                        )
                                )
                            }
                            .buttonStyle(.plain)
                        }
                    }
                case .text:
                    VStack(alignment: .leading, spacing: layout.spacingS) {
                        Text("How are you feeling?")
                            .font(.subheadline.weight(.medium))
                            .foregroundColor(Color("TextPrimary"))
                        TextEditor(text: $viewModel.text)
                            .frame(minHeight: layout.scaled(120))
                            .padding(layout.spacingS)
                            .scrollContentBackground(.hidden)
                            .background(Color("Surface"))
                            .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                            .overlay(
                                RoundedRectangle(cornerRadius: layout.cardCorner)
                                    .stroke(Color("Divider"), lineWidth: 1)
                            )
                            .focused($textFocused)
                    }
                }

                Button {
                    textFocused = false
                    UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                    Task { await viewModel.submit() }
                } label: {
                    Group {
                        if viewModel.isLoading {
                            ProgressView()
                                .tint(.white)
                        } else {
                            Text("Get recommendations")
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, layout.spacingM)
                }
                .buttonStyle(.borderedProminent)
                .tint(Color("Primary"))
                .disabled(!viewModel.canSubmit || viewModel.isLoading)
                .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
                .scaleEffect(viewModel.isLoading ? 0.98 : 1)
                .animation(.easeInOut(duration: 0.2), value: viewModel.isLoading)
            }
            .padding(layout.spacingM)
        }
        .scrollContentBackground(.hidden)
        .background(Color("Background"))
        .navigationTitle("Analyze")
        .confirmationDialog("Add photo", isPresented: $showImageSource) {
            Button("Photo Library") { showLibrary = true }
            Button("Camera") { showCamera = true }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Choose a source")
        }
        .fullScreenCover(isPresented: $showLibrary) {
            ImagePicker(source: .library, onPick: { viewModel.image = $0; showLibrary = false }, onCancel: { showLibrary = false })
        }
        .fullScreenCover(isPresented: $showCamera) {
            ImagePicker(source: .camera, onPick: { viewModel.image = $0; showCamera = false }, onCancel: { showCamera = false })
        }
        .onChange(of: viewModel.result) { _, new in
            if let r = new { resultToShow = ResultNavigationWrapper(value: r) }
        }
        .navigationDestination(item: $resultToShow) { wrapper in
            ResultsView(result: wrapper.value)
                .onDisappear {
                    viewModel.clearResult()
                    resultToShow = nil
                }
        }
    }
}
