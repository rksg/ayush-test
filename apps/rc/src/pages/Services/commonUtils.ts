import { RcFile } from 'antd/lib/upload'

export const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}
export const PortalDemoDefaultSize={
  welcomeSize: 14,
  photoSize: 170,
  logoSize: 105,
  secondarySize: 14,
  poweredSize: 14,
  poweredImgSize: 50
}
