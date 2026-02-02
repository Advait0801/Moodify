//
//  AnalyzeView.swift
//  Moodify-iOS
//
//  Created by Advait Naik on 2/2/26.
//

import SwiftUI

struct ResultNavigationWrapper: Identifiable, Hashable {
    let id = UUID()
    let value: MoodAnalyzeResponse

    static func == (lhs: ResultNavigationWrapper, rhs: ResultNavigationWrapper) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
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
                            Button("Remove") {
                                viewModel.image = nil
                            }
                            .foregroundColor(Color("TextSecondary"))
                        } else {
                            Button {
                                showImageSource = true
                            } label: {
                                VStack(spacing: layout.spacingM) {
                                    Image(systemName: "photo.badge.plus")
                                        .font(.largeTitle)
                                        .foregroundColor(Color("TextSecondary"))
                                    Text("Tap to add photo")
                                        .font(.subheadline)
                                        .foregroundColor(Color("TextSecondary"))
                                }
                                .frame(maxWidth: .infinity)
                                .padding(layout.spacingXL)
                                .background(Color("Surface"))
                                .clipShape(RoundedRectangle(cornerRadius: layout.cardCorner))
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
        .onChange(of: viewModel.result != nil) { _, isPresent in
            if isPresent, let r = viewModel.result {
                resultToShow = ResultNavigationWrapper(value: r)
            }
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

