import SwiftUI

/// Grand titre d’écran (font.heading × 1,2). Figma : Titre, Type=Grand titre.
public struct DesysLargeTitle: View {
    private let text: String
    public init(_ text: String) { self.text = text }

    public var body: some View {
        Text(text)
            .font(DesysFont.make(DesysFontSize.heading * 1.2, weight: .bold))
            .tracking(-0.7)
            .foregroundStyle(DesysColor.text)
            .accessibilityAddTraits(.isHeader)
    }
}

/// En-tête de section en majuscules (font.body × 0,8125). Figma : Titre, Type=En-tête de section.
public struct DesysSectionHeader: View {
    private let text: String
    public init(_ text: String) { self.text = text }

    public var body: some View {
        Text(text.uppercased())
            .font(DesysFont.make(DesysFontSize.body * 0.8125, weight: .medium))
            .tracking(0.5)
            .foregroundStyle(DesysColor.muted)
            .accessibilityAddTraits(.isHeader)
    }
}

/// Niveau de confiance ou écart, toujours neutre (jamais color.danger). Figma : Badge.
public struct DesysBadge: View {
    private let text: String
    public init(_ text: String) { self.text = text }

    public var body: some View {
        Text(text)
            .font(DesysFont.make(10))
            .foregroundStyle(DesysColor.brand)
            .padding(.vertical, 4)
            .padding(.horizontal, 8)
            .overlay(Capsule().strokeBorder(DesysColor.border, lineWidth: 1))
    }
}

/// Champ de recherche, 44 pt minimum. Figma : Champ de recherche.
public struct DesysSearchField: View {
    private let placeholder: String
    @Binding private var text: String

    public init(_ placeholder: String, text: Binding<String>) {
        self.placeholder = placeholder
        self._text = text
    }

    public var body: some View {
        TextField(placeholder, text: $text)
            .font(DesysFont.make(DesysFontSize.body))
            .foregroundStyle(DesysColor.text)
            .padding(.vertical, DesysSpace.sm)
            .padding(.horizontal, DesysSpace.md)
            .frame(minHeight: 44)
            .background(DesysColor.surface, in: RoundedRectangle(cornerRadius: DesysRadius.control))
            .overlay(
                RoundedRectangle(cornerRadius: DesysRadius.control)
                    .strokeBorder(DesysColor.border, lineWidth: 1)
            )
    }
}
