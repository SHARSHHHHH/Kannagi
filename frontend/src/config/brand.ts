/**
 * The product name lives here and nowhere else in the frontend.
 *
 * Renaming is a build-time environment change (VITE_APP_NAME) with an optional
 * runtime override from GET /api/config/brand, so a deployment can be rebranded
 * without a rebuild. See README, "Renaming the product".
 */
export interface Brand {
  name: string
  displayName: string
  tagline: string
}

export const BRAND: Brand = {
  name: import.meta.env.VITE_APP_NAME ?? 'Kannagi',
  displayName: import.meta.env.VITE_APP_NAME ?? 'Kannagi',
  tagline:
    import.meta.env.VITE_APP_TAGLINE ??
    "Speak safely. Know what's possible. Decide what happens next.",
}
