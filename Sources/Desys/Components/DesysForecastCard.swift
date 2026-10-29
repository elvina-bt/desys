import SwiftUI

/// Prévision en plage (jamais une valeur unique) avec un badge de confiance neutre ;
/// aucun verdict « vole / ne vole pas ». Figma : Carte de prévision (Note=Oui/Non).
public struct DesysForecastCard: View {
    private let place: String
    private let slot: String
    private let wind: String
    private let summary: String
    private let gusts: String
    private let ceiling: String
    private let confidence: String
    private let note: String?

    public init(
        place: String,
        slot: String,
        wind: String,
        summary: String,
        gusts: String,
        ceiling: String,
        confidence: String,
        note: String? = nil
    ) {
        self.place = place
        self.slot = slot
        self.wind = wind
        self.summary = summary
        self.gusts = gusts
        self.ceiling = ceiling
        self.confidence = confidence
        self.note = note
    }

    public var body: some View {
        DesysCard {
            Text("\(place.uppercased()) · \(slot.uppercased())")
                .font(DesysFont.make(DesysFontSize.body * 0.75, weight: .semibold))
                .tracking(0.5)
                .foregroundStyle(DesysColor.brand)
            Text("Vent prévu \(wind)")
                .font(DesysFont.make(DesysFontSize.body * 1.25, weight: .bold))
                .foregroundStyle(DesysColor.text)
            Text(summary)
                .font(DesysFont.make(DesysFontSize.body))
                .foregroundStyle(DesysColor.muted)
            VStack(spacing: 0) {
                DesysListRow("Rafales", value: gusts)
                DesysListRow("Plafond", value: ceiling)
                DesysListRow("Confiance") { DesysBadge(confidence) }
            }
            if let note {
                Text(note)
                    .font(DesysFont.make(DesysFontSize.body * 0.8125))
                    .foregroundStyle(DesysColor.muted)
            }
        }
    }
}
