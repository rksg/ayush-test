import { useEffect, useState } from 'react'

import { Upload, Space } from 'antd'

import { showToast }          from '@acx-ui/components'
import { PlusCircleOutlined } from '@acx-ui/icons'
import { getIntl }            from '@acx-ui/utils'
import { HelpText, HelpTextButton } from './styledComponents'

interface OnChangeHandler {
  (e:any): void;
}

export interface ExistingImage {
  fileSrc: string,
  filename: string | undefined
}

export interface SimpleImageUploadProps {
  value: string,
  onChange: OnChangeHandler,
  existingImage: ExistingImage,
  imageType: "LOGO" | "FAVICON"
}

export default function ResidentPortalImageUpload (props: SimpleImageUploadProps) {

  const {
    value,
    onChange,
    existingImage,
    imageType
  } = props

  const { $t } = getIntl()

  const [imageName, setImageName] = useState<string>('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    if(!imageUrl && !imageName) {
      setImageName(existingImage.filename ? existingImage.filename : '')
      setImageUrl(existingImage.fileSrc)
    }
  }, [existingImage])

  const beforeUpload = function (file: File) {

    const acceptedImageTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/svg',
      'image/svg+xml']

    if(imageType === 'FAVICON') {
      acceptedImageTypes.push('image/vnd.microsoft.icon')
    }

    const validImage = acceptedImageTypes.includes(file.type)
    if (!validImage) {
      const content = $t({ defaultMessage: 'Invalid Image type!' })
      showInvalidToast(content)
      return false
    }

    const isLt20M = file.size / 1024 / 1024 < 20
    if (!isLt20M) {
      const content = $t({ defaultMessage: 'Image must smaller than 20MB!' })
      showInvalidToast(content)
      return false
    }

    // validation successful -- set image
    onChange({file: file})

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setImageUrl(reader.result as string)
      setImageName(file.name)
    }
    return false
  }

  const removeImage = function() {
    // TODO: verify this is working correctly when saving/removing the file
    if(existingImage?.fileSrc) {
      onChange({file: undefined, isRemoved: true})
    } else {
      onChange({file: undefined})
    }

    setImageUrl('')
    setImageName('')
  }

  const showInvalidToast = function (content: string) {
    showToast({ type: 'error', content })
  }

  return (
    <Space align='start'>
      <Upload
        name='imageUpload'
        listType='picture-card'
        className='avatar-uploader'
        showUploadList={false}
        beforeUpload={beforeUpload}
        accept='image/*'
        style={{ height: '180px' }}>
        {(imageUrl)
          ? <img src={imageUrl}
            alt={imageType === "FAVICON" ? 'favicon' : 'logo'}
            style={{ width: 'auto',
              height: 'auto',
              maxHeight: '100%',
              maxWidth: '100%'
            }} /> 
          : <div>
              <PlusCircleOutlined />
              <div className='ant-upload-text'>{ $t({ defaultMessage: 'Upload' }) }</div>
          </div>}
      </Upload>
      <HelpText type='secondary'>
        {(imageUrl) ? imageName : $t({defaultMessage: 'No File Selected'})}<br />
        {(imageUrl) ? 
          <HelpTextButton type="link" size='small' onClick={removeImage}>
            {$t({defaultMessage: 'Remove'})}
          </HelpTextButton>
          : ''}<br />
        {$t({ defaultMessage: 'Max. image size: 20 MB' })}<br />
        {imageType === 'FAVICON' ? 
          $t({ defaultMessage: 'Supported formats: PNG, JPEG, GIF, SVG, ICO' })
          : $t({ defaultMessage: 'Supported formats: PNG, JPEG, GIF, SVG' })}
        
      </HelpText>
    </Space>
  )

}
