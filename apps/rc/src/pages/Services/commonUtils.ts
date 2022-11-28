import { RcFile } from 'antd/lib/upload'

import { PortalLanguageEnum } from '@acx-ui/rc/utils'
import { getDisplayLanguage } from '@acx-ui/utils'

export const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}
export const PortalDemoDefaultSize={
  welcomeSize: 16,
  photoSize: 170,
  logoSize: 105,
  secondarySize: 12,
  poweredSize: 14,
  poweredImgSize: 50
}
export function getLanguage (key: keyof typeof PortalLanguageEnum) {
  const locale = PortalLanguageEnum[key]
  return getDisplayLanguage(locale)
}
