import SwiftUI

/// Les 4 onglets de l’app. Figma : Barre d’onglets (Onglet actif).
public enum DesysTab: String, CaseIterable, Identifiable {
    case preparer = "Préparer"
    case debriefer = "Débriefer"
    case progresser = "Progresser"
    case profil = "Profil"

    public var id: String { rawValue }
    public var icon: DesysIcon {
        switch self {
        case .preparer: .preparer
        case .debriefer: .debriefer
        case .progresser: .progresser
        case .profil: .profil
        }
    }
}

/// Barre d’onglets fixée en bas de l’écran ; l’onglet actif prend color.brand.
public struct DesysTabBar: View {
    @Binding private var selection: DesysTab

    public init(selection: Binding<DesysTab>) { self._selection = selection }

    public var body: some View {
        HStack(spacing: 0) {
            ForEach(DesysTab.allCases) { tab in
                Button { selection = tab } label: {
                    VStack(spacing: 2) {
                        tab.icon.image.resizable().frame(width: 24, height: 24)
                        Text(tab.rawValue).font(DesysFont.make(DesysFontSize.body * 0.6875))
                    }
                    .frame(maxWidth: .infinity, minHeight: 44)
                    .foregroundStyle(selection == tab ? DesysColor.brand : DesysColor.muted)
                }
                .buttonStyle(.plain)
                .accessibilityAddTraits(selection == tab ? .isSelected : [])
            }
        }
        .padding(.top, DesysSpace.sm)
        .padding(.bottom, DesysSpace.md)
        .background(DesysColor.surface)
        .overlay(alignment: .top) {
            Rectangle().fill(DesysColor.border).frame(height: 1)
        }
    }
}
