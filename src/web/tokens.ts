// Format des tokens desys : clés plates (`color.brand`), valeurs `{ $type, $value }`
// (proche du format W3C DTCG). Source : tokens/tokens.json, iso PFE – Tokens.
export type TokenType = 'color' | 'dimension' | 'fontFamily';
export type Token = { $type: TokenType; $value: string | number };
export type TokenSet = Record<string, Token>;

// `color.brand` → `--color-brand` ; les dimensions sont en px.
export const cssVar = (key: string) => `--${key.replaceAll('.', '-')}`;
export function tokenCss(tokens: TokenSet): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tokens).map(([key, t]) => [
      cssVar(key),
      `${t.$value}${t.$type === 'dimension' ? 'px' : ''}`,
    ]),
  );
}
