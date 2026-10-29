#if DEBUG
import SwiftUI

// Aperçus Xcode des composants desys (Canvas d’Xcode, fichier ouvert dans Desys).
private struct DesysCatalogue: View {
    @State private var tab: DesysTab = .preparer
    @State private var search = ""
    @State private var contrast = true

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: DesysSpace.md) {
                DesysLargeTitle("Préparer")
                DesysSectionHeader("Prochaine sortie")
                DesysSearchField("Rechercher un site", text: $search)
                HStack {
                    DesysButton("Nouvelle sortie") {}
                    DesysButton("Voir les sites", variant: .secondary) {}
                }
                DesysForecastCard(
                    place: "Saint-Hilaire",
                    slot: "sam. 14 h–16 h",
                    wind: "12–18 km/h",
                    summary: "Ouest, rafales possibles l’après-midi.",
                    gusts: "jusqu’à 25 km/h",
                    ceiling: "2 400 m",
                    confidence: "Moyenne · maille 1,3 km",
                    note: "Prévision enregistrée à 9 h 12, pour la comparer après le vol."
                )
                DesysCard(list: true) {
                    DesysListRow("Comprendre les rafales", chevron: true, showsDivider: false)
                    DesysListRow("Niveau", value: "Brevet initial", chevron: true)
                    DesysListToggle("Contraste renforcé", isOn: $contrast)
                }
            }
            .padding(DesysSpace.md)
        }
        .background(DesysColor.canvas)
        .safeAreaInset(edge: .bottom) { DesysTabBar(selection: $tab) }
    }
}

#Preview("Composants") {
    DesysCatalogue()
}
#endif
