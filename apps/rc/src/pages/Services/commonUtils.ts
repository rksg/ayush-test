import { PortalLanguageEnum } from '@acx-ui/rc/utils'
import { getDisplayLanguage } from '@acx-ui/utils'

export const PortalDemoDefaultSize={
  welcomeSize: 16,
  photoRatio: 170,
  logoRatio: 105,
  secondarySize: 12,
  poweredSize: 14,
  poweredImgRatio: 50
}
export function getLanguage (key: keyof typeof PortalLanguageEnum) {
  const locale = PortalLanguageEnum[key]
  return getDisplayLanguage(locale)
}
export const hoverOutline = 'solid 1px var(--acx-accents-orange-50)'
