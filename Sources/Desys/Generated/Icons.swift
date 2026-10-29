// Généré par scripts/generate.ts depuis les sources desys. Ne pas modifier à la main.
import SwiftUI

/// Icônes de PFE – Assets, rendues en mode modèle : elles prennent la couleur du texte.
public enum DesysIcon: String, CaseIterable {
    case preparer = "desys-preparer"
    case debriefer = "desys-debriefer"
    case progresser = "desys-progresser"
    case profil = "desys-profil"
    case chevron = "desys-chevron"
    case check = "desys-check"

    public var image: Image {
        Image(rawValue, bundle: .module).renderingMode(.template)
    }
}
