// Généré par scripts/generate.ts depuis les sources desys. Ne pas modifier à la main.
import SwiftUI

public enum DesysColor {
    public static let brand = Color(desysHex: 0x3154C4)
    public static let brandHover = Color(desysHex: 0x243F99)
    public static let onBrand = Color(desysHex: 0xFFFFFF)
    public static let surface = Color(desysHex: 0xFFFFFF)
    public static let canvas = Color(desysHex: 0xF3F5FA)
    public static let text = Color(desysHex: 0x19243D)
    public static let muted = Color(desysHex: 0x536078)
    public static let border = Color(desysHex: 0xBCC5D6)
    public static let danger = Color(desysHex: 0xB4233E)
    public static let success = Color(desysHex: 0x18734B)
    public static let focus = Color(desysHex: 0x7856C8)
}

public enum DesysSpace {
    public static let sm: CGFloat = 8
    public static let md: CGFloat = 16
    public static let lg: CGFloat = 24
}

public enum DesysRadius {
    public static let control: CGFloat = 10
}

public enum DesysFontSize {
    public static let body: CGFloat = 16
    public static let heading: CGFloat = 28
}

public enum DesysFont {
    /// Police du token font.family (system-ui).
    public static func make(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        Font.system(size: size, weight: weight)
    }
}
