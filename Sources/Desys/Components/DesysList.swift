import SwiftUI

/// Carte (radius.control × 1,4). `list: true` : lignes bord à bord, sans marge verticale.
public struct DesysCard<Content: View>: View {
    private let list: Bool
    private let content: Content

    public init(list: Bool = false, @ViewBuilder content: () -> Content) {
        self.list = list
        self.content = content()
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: list ? 0 : DesysSpace.sm) { content }
            .padding(.horizontal, DesysSpace.md)
            .padding(.vertical, list ? 0 : DesysSpace.md)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(DesysColor.surface, in: RoundedRectangle(cornerRadius: DesysRadius.control * 1.4))
            .overlay(
                RoundedRectangle(cornerRadius: DesysRadius.control * 1.4)
                    .strokeBorder(DesysColor.border, lineWidth: 1)
            )
    }
}

/// Ligne de 44 pt minimum : libellé, valeur ou badge, chevron. Séparateur en haut,
/// à retirer sur la première ligne d’une carte. Figma : Ligne de liste.
public struct DesysListRow<Trailing: View>: View {
    private let label: String
    private let chevron: Bool
    private let showsDivider: Bool
    private let trailing: Trailing

    public init(
        _ label: String,
        chevron: Bool = false,
        showsDivider: Bool = true,
        @ViewBuilder trailing: () -> Trailing
    ) {
        self.label = label
        self.chevron = chevron
        self.showsDivider = showsDivider
        self.trailing = trailing()
    }

    public var body: some View {
        VStack(spacing: 0) {
            if showsDivider {
                Rectangle().fill(DesysColor.border).frame(height: 1)
            }
            HStack(spacing: DesysSpace.md) {
                Text(label).foregroundStyle(DesysColor.text)
                Spacer(minLength: DesysSpace.md)
                HStack(spacing: DesysSpace.sm) {
                    trailing
                    if chevron {
                        DesysIcon.chevron.image
                            .resizable()
                            .frame(width: 16, height: 16)
                            .accessibilityHidden(true)
                    }
                }
                .foregroundStyle(DesysColor.muted)
            }
            .font(DesysFont.make(DesysFontSize.body))
            .frame(minHeight: 44)
        }
    }
}

extension DesysListRow where Trailing == Text {
    public init(_ label: String, value: String, chevron: Bool = false, showsDivider: Bool = true) {
        self.init(label, chevron: chevron, showsDivider: showsDivider) { Text(value) }
    }
}

extension DesysListRow where Trailing == EmptyView {
    public init(_ label: String, chevron: Bool = false, showsDivider: Bool = true) {
        self.init(label, chevron: chevron, showsDivider: showsDivider) { EmptyView() }
    }
}

/// Réglage activable. Sur iOS, interrupteur natif (Toggle) teinté color.brand ;
/// sur le web, case à cocher. Figma : Ligne de liste, Type=Interrupteur.
public struct DesysListToggle: View {
    private let label: String
    private let showsDivider: Bool
    @Binding private var isOn: Bool

    public init(_ label: String, isOn: Binding<Bool>, showsDivider: Bool = true) {
        self.label = label
        self._isOn = isOn
        self.showsDivider = showsDivider
    }

    public var body: some View {
        VStack(spacing: 0) {
            if showsDivider {
                Rectangle().fill(DesysColor.border).frame(height: 1)
            }
            Toggle(label, isOn: $isOn)
                .tint(DesysColor.brand)
                .font(DesysFont.make(DesysFontSize.body))
                .foregroundStyle(DesysColor.text)
                .frame(minHeight: 44)
        }
    }
}
