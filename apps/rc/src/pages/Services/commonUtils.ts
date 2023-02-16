import { RcFile } from 'antd/lib/upload'


import { showToast }          from '@acx-ui/components'
import { PortalLanguageEnum } from '@acx-ui/rc/utils'
import { getDisplayLanguage } from '@acx-ui/utils'
import { getIntl }            from '@acx-ui/utils'


export const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const { $t } = getIntl()
  const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml']
  const validImage = acceptedImageTypes.includes(img.type)
  if (!validImage) {
    const content = $t({ defaultMessage: 'Invalid Image type!' })
    showToast({
      type: 'error',
      content
    })
    return
  }
  const isLt20M = img.size / 1024 / 1024 < 20
  if (!isLt20M) {
    const content = $t({ defaultMessage: 'Image must smaller than 20MB!' })
    showToast({
      type: 'error',
      content
    })
    return
  }
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}
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
