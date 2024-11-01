import { RcFile } from 'antd/lib/upload'

import { showToast } from '@acx-ui/components'
import { getIntl }   from '@acx-ui/utils'

export function loadFile (file: RcFile, callback: (url:string)=>void) {
  const { $t } = getIntl()
  const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg']
  const validImage = acceptedImageTypes.includes(file.type)
  if (!validImage) {
    const content = $t({ defaultMessage: 'Invalid Image type!' })
    showToast({
      type: 'error',
      content
    })
    return
  }
  const isGt8M = file.size / 1024 / 1024 > 8
  if (isGt8M) {
    const content = $t({ defaultMessage: 'Image must smaller than 8MB!' })
    showToast({
      type: 'error',
      content
    })
    return
  }
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(file)
}