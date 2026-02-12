import Foundation

struct UserUploadsResponse: Decodable {
    let uploads: [UserUploadItem]
}

struct UserUploadItem: Identifiable, Decodable {
    let id: String
    let type: String
    let content_type: String?
    let created_at: String
    let text_content: String?

    var isImage: Bool { type == "image" }
}
