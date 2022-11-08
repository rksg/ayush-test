import { useContext, useEffect, useState } from 'react'

import {
  Upload,
  Typography,
  Space
} from 'antd'

import { showToast }          from '@acx-ui/components'
import { PlusCircleOutlined } from '@acx-ui/icons'
import { FileValidation }     from '@acx-ui/rc/utils'
import { getIntl }            from '@acx-ui/utils'

import { ModalContext } from '../FloorPlanModal'


export default function FloorplanUpload ({ validateFile, imageFile } : {
  validateFile: Function, imageFile?: string }) {

  const [imageUrl, setImageUrl] = useState(imageFile)
  const [tempUrl, setTempUrl] = useState('')
  const { clearOldFile } = useContext(ModalContext)

  const [fileValidation, setFileValidation] = useState<FileValidation>({
    file: {} as File,
    isValidfileType: true,
    isValidFileSize: true
  })

  useEffect(() => {
    if (clearOldFile)
      validateFile({
        file: {} as File,
        isValidfileType: true,
        isValidFileSize: true
      })
  }, [clearOldFile])

  const { $t } = getIntl()

  const beforeUpload = function (file: File) {
    setFileValidation({
      file: {} as File,
      isValidfileType: true,
      isValidFileSize: true
    })
    const acceptedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg']
    const validImage = acceptedImageTypes.includes(file.type)
    if (!validImage) {
      const content = $t({ defaultMessage: 'Invalid Image type!' })
      openToastAndResetFile({ ...fileValidation, isValidfileType: false }, content)
      return
    }
    const isLt20M = file.size / 1024 / 1024 < 20
    if (!isLt20M) {
      const content = $t({ defaultMessage: 'Image must smaller than 20MB!' })
      openToastAndResetFile({ ...fileValidation, isValidFileSize: false }, content)
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

  const openToastAndResetFile = function (validationAttributes: FileValidation, content: string) {
    showToast({
      type: 'error',
      content
    })
    setFileValidation(validationAttributes)
    validateFile(fileValidation)
    setImageUrl('')
    setTempUrl('')
  }

  return (
    <>
      <Space size={24} style={{ marginBottom: '12px' }} direction='vertical'>
        <Typography.Text type='success' style={{ marginBottom: '8px' }}>
          { fileValidation?.file.name }
        </Typography.Text>
      </Space>
      <Upload
        name='floorplan'
        listType='picture-card'
        className='avatar-uploader'
        showUploadList={false}
        action={tempUrl}
        beforeUpload={beforeUpload}
        accept='image/*'
        style={{
          height: '180px'
        }}
      >
        {(imageUrl)
          ? <img src={imageUrl}
            alt='floorplan'
            style={{ width: 'auto',
              height: 'auto',
              maxHeight: '100%',
              maxWidth: '100%'
            }} /> : <div>
            <PlusCircleOutlined />
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