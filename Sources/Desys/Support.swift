import SwiftUI

extension Color {
    /// Couleur sRGB depuis un hexadécimal 0xRRGGBB (tokens générés).
    init(desysHex hex: UInt32) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: 1
        )
    }
}
