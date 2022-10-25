import { useState } from 'react'

import {
  Upload,
  Typography
} from 'antd'

import { showToast }      from '@acx-ui/components'
import { FileValidation } from '@acx-ui/rc/utils'
import { getIntl }        from '@acx-ui/utils'


export default function FloorplanUpload ({ validateFile, imageFile } : {
  validateFile: Function, imageFile?: string }) {

  const [imageUrl, setImageUrl] = useState('')
  const [tempUrl, setTempUrl] = useState('')
  const [fileValidation, setFileValidation] = useState<FileValidation>({
    file: {} as File,
    isValidfileType: true,
    isValidFileSize: true
  })

  const { $t } = getIntl()

  const beforeUpload = function (file: File) {
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg']
    const validImage = acceptedImageTypes.includes(file.type)
    if (!validImage) {
      showToast({
        type: 'error',
        content: 'Invalid Image type!'
      })
      setFileValidation({ ...fileValidation, isValidfileType: false })
      validateFile(fileValidation)
      return
    }
    const isLt20M = file.size / 1024 / 1024 < 20
    if (!isLt20M) {
      showToast({
        type: 'error',
        content: 'Image must smaller than 20MB!'
      })
      setFileValidation({ ...fileValidation, isValidFileSize: false })
      validateFile(fileValidation)
      return
    }

    setFileValidation({ ...fileValidation, file: file })

    validateFile({ ...fileValidation, file: file })

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setTempUrl(URL.createObjectURL(file))
      setImageUrl(reader.result as string)
    }
    return validImage && isLt20M
  }

  return (
    <>
      <Upload
        name='avatar'
        listType='picture-card'
        className='avatar-uploader'
        showUploadList={false}
        action={tempUrl}
        beforeUpload={beforeUpload}
        accept='image/*'
      >
        {(imageUrl || imageFile)
          ? <img src={imageUrl || imageFile} alt='avatar' style={{ width: '100%' }} /> : <div>
            <div className='ant-upload-text'>Upload</div>
          </div>}
      </Upload>
      <Typography.Text type='secondary'>
        { $t({
          defaultMessage: 'Max. image weight 20 Mb Supported formats: PNG, JPEG, GIF, SVG' }) }
      </Typography.Text>
    </>
  )

}