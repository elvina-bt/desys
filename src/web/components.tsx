import type { CSSProperties, ReactNode } from 'react';
import { icons, type IconName } from './generated/icons.js';
import { tokens as defaultTokens } from './generated/tokens.js';
import { tokenCss, type TokenSet } from './tokens.js';

// Composants web du design system desys. Valeurs issues des tokens uniquement
// (variables CSS posées par DesysProvider). Garde-fou : aucun composant
// n'exprime un verdict « vole / ne vole pas » ; un écart reste neutre, jamais
// color.danger. Équivalents SwiftUI : Sources/Desys/Components.

export function DesysProvider({
  tokens = defaultTokens,
  children,
}: {
  tokens?: TokenSet;
  children: ReactNode;
}) {
  return (
    <div className="ds" style={tokenCss(tokens) as CSSProperties}>
      {children}
    </div>
  );
}

export function Icon({
  name,
  size = 24,
  title,
}: {
  name: IconName;
  size?: number;
  title?: string;
}) {
  const icon = icons[name];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={icon.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {icon.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function Button({
  variant = 'primary',
  children,
  disabled = false,
  onClick,
  type = 'button',
}: {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      className={`ds-button ${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export const appTabs = [
  'Préparer',
  'Débriefer',
  'Progresser',
  'Profil',
] as const;
export type AppTab = (typeof appTabs)[number];
const tabIcons: Record<AppTab, IconName> = {
  Préparer: 'preparer',
  Débriefer: 'debriefer',
  Progresser: 'progresser',
  Profil: 'profil',
};

export function LargeTitle({ children }: { children: ReactNode }) {
  return <h1 className="pp-title">{children}</h1>;
}

export function SectionHeader({ children }: { children: ReactNode }) {
  return <h2 className="pp-section">{children}</h2>;
}

export function SearchField({ label }: { label: string }) {
  return (
    <label className="pp-search">
      <span className="pp-sr">{label}</span>
      <input type="search" placeholder={label} />
    </label>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="ds-badge">{children}</span>;
}

export function Card({
  children,
  list = false,
}: {
  children: ReactNode;
  list?: boolean;
}) {
  return (
    <article className={list ? 'pp-card pp-list' : 'pp-card'}>
      {children}
    </article>
  );
}

export function ListRow({
  label,
  value,
  chevron = false,
}: {
  label: string;
  value?: ReactNode;
  chevron?: boolean;
}) {
  return (
    <div className="pp-row">
      <span>{label}</span>
      <span className="pp-row-value">
        {value}
        {chevron && <Icon name="chevron" size={16} />}
      </span>
    </div>
  );
}

export function ListToggle({
  label,
  defaultChecked = false,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="pp-row ds-check">
      <span>{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} />
    </label>
  );
}

export function ForecastCard({
  place,
  slot,
  wind,
  summary,
  gusts,
  ceiling,
  confidence,
  note,
}: {
  place: string;
  slot: string;
  wind: string;
  summary: string;
  gusts: string;
  ceiling: string;
  confidence: string;
  note?: string;
}) {
  return (
    <Card>
      <div className="pp-kicker">
        {place.toUpperCase()} · {slot.toUpperCase()}
      </div>
      <h3>Vent prévu {wind}</h3>
      <p>{summary}</p>
      <ListRow label="Rafales" value={gusts} />
      <ListRow label="Plafond" value={ceiling} />
      <ListRow label="Confiance" value={<Badge>{confidence}</Badge>} />
      {note && <p className="pp-note">{note}</p>}
    </Card>
  );
}

export function TabBar({
  current,
  onChange,
  inline = false,
}: {
  current: AppTab;
  onChange: (tab: AppTab) => void;
  inline?: boolean;
}) {
  return (
    <nav
      className={inline ? 'pp-tabbar pp-tabbar-inline' : 'pp-tabbar'}
      aria-label="Onglets de l’app"
    >
      {appTabs.map((t) => (
        <button
          key={t}
          aria-current={current === t ? 'page' : undefined}
          onClick={() => onChange(t)}
        >
          <Icon name={tabIcons[t]} />
          {t}
        </button>
      ))}
    </nav>
  );
}
