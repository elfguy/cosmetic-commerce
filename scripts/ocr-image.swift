import AppKit
import Foundation
import Vision

if CommandLine.arguments.count < 2 {
    fputs("Usage: swift scripts/ocr-image.swift <image-path>\n", stderr)
    exit(2)
}

let path = CommandLine.arguments[1]
let imageURL = URL(fileURLWithPath: path)

guard let nsImage = NSImage(contentsOf: imageURL) else {
    fputs("Cannot open image: \(path)\n", stderr)
    exit(1)
}

guard let cgImage = nsImage.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fputs("Cannot create CGImage: \(path)\n", stderr)
    exit(1)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .accurate
request.recognitionLanguages = ["ko-KR", "en-US"]
request.usesLanguageCorrection = true

let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])

do {
    try handler.perform([request])
} catch {
    fputs("OCR failed: \(error)\n", stderr)
    exit(1)
}

let observations = (request.results ?? []).sorted {
    let yDelta = abs($0.boundingBox.midY - $1.boundingBox.midY)
    if yDelta > 0.012 {
        return $0.boundingBox.midY > $1.boundingBox.midY
    }
    return $0.boundingBox.minX < $1.boundingBox.minX
}

for observation in observations {
    guard let text = observation.topCandidates(1).first?.string else {
        continue
    }
    print(text)
}
