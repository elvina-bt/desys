// swift-tools-version:5.9
// Package Swift du design system desys : tokens, icônes (PFE – Assets) et
// composants SwiftUI. Tokens.swift, Icons.swift et Assets.xcassets sont générés
// par `npm run generate` depuis tokens/ et assets/.
import PackageDescription

let package = Package(
    name: "Desys",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "Desys", targets: ["Desys"]),
    ],
    targets: [
        .target(name: "Desys", resources: [.process("Resources")]),
        .testTarget(name: "DesysTests", dependencies: ["Desys"]),
    ]
)
