import SwiftUI

/// Déclenche une action. Un seul bouton principal par écran ; `.danger` sert à
/// supprimer, jamais à signaler un écart. Figma : Bouton (Variante × État).
public struct DesysButton: View {
    public enum Variant { case primary, secondary, danger }

    private let title: String
    private let variant: Variant
    private let action: () -> Void
    @Environment(\.isEnabled) private var isEnabled

    public init(_ title: String, variant: Variant = .primary, action: @escaping () -> Void) {
        self.title = title
        self.variant = variant
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            Text(title)
                .font(DesysFont.make(DesysFontSize.body))
                .foregroundStyle(variant == .secondary ? DesysColor.brand : DesysColor.onBrand)
                .padding(.vertical, DesysSpace.sm)
                .padding(.horizontal, DesysSpace.md)
                .frame(minHeight: 44)
                .background(background, in: RoundedRectangle(cornerRadius: DesysRadius.control))
                .overlay {
                    if variant == .secondary {
                        RoundedRectangle(cornerRadius: DesysRadius.control)
                            .strokeBorder(DesysColor.brand, lineWidth: 1)
                    }
                }
        }
        .buttonStyle(.plain)
        .opacity(isEnabled ? 1 : 0.45)
    }

    private var background: Color {
        switch variant {
        case .primary: DesysColor.brand
        case .secondary: DesysColor.surface
        case .danger: DesysColor.danger
        }
    }
}
