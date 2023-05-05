import { useContext, useEffect, useState } from 'react'

import { Upload, Space, FormItemProps, Form, Card, Button, Typography } from 'antd'

import { showToast }          from '@acx-ui/components'
import { PlusCircleOutlined } from '@acx-ui/icons'
import { FileValidation }     from '@acx-ui/rc/utils'
import { getIntl }            from '@acx-ui/utils'
import styled from 'styled-components'
import { useGetEnhancedL3AclProfileListQuery } from '@acx-ui/rc/services'

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
  // TODO: need existing image filename -- or make the source image an object with the filename included
  existingImage: ExistingImage
  // imageType: "LOGO" | "FAVICON"
}

export const HelpText = styled(Typography.Paragraph)`
  font-size: var(--acx-body-4-font-size);
`
export const HelpTextButton = styled(Button)`
  font-size: var(--acx-body-4-font-size);
  padding: 0px;
  margin: 0px;
`

// TODO: rename? ResidentPortalImaeUpload
// export default function FloorplanUpload ({ validateFile, imageFile } : {
//   validateFile: Function, imageFile?: string }) {
export default function ResidentPortalImageUpload (props: SimpleImageUploadProps) {

  const {
    value,
    onChange,
    existingImage
  } = props

  // imageName can be an empty string, so undefined means it is unset
  const [imageName, setImageName] = useState<string | undefined>(undefined)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    if(!imageUrl && !imageName) {
      setImageName(existingImage.filename !== undefined ? existingImage.filename : undefined)
      setImageUrl(existingImage.fileSrc)
    }
  }, [existingImage])

  // const [existingImageSrc, setExistingImageSrc] = useState(props.initialImageSrc)

  // TODO: think through wether this will work or not
  // useEffect(() => {setExistingImageSrc(props.initialImageSrc)}, [props.initialImageSrc])

  // const [fileValidation, setFileValidation] = useState<FileValidation>({
  //   file: {} as File,
  //   isValidfileType: true,
  //   isValidFileSize: true
  // })

  // useEffect(() => {
  //   if (clearOldFile)
  //     validateFile({
  //       file: {} as File,
  //       isValidfileType: true,
  //       isValidFileSize: true
  //     })
  // }, [clearOldFile])

  const { $t } = getIntl()


  const beforeUpload = function (file: File) {
    // setFileValidation({
    //   file: {} as File,
    //   isValidfileType: true,
    //   isValidFileSize: true
    // })
    // const acceptedImageTypes = [
    //   'image/png',
    //   'image/jpeg',
    //   'image/jpg',
    //   'image/gif',
    //   'image/svg',
    //   'image/svg+xml']
    // const validImage = acceptedImageTypes.includes(file.type)
    // if (!validImage) {
    //   const content = $t({ defaultMessage: 'Invalid Image type!' })
    //   openToastAndResetFile({ ...fileValidation, isValidfileType: false }, content)
    //   return
    // }
    // const isLt20M = file.size / 1024 / 1024 < 20
    // if (!isLt20M) {
    //   const content = $t({ defaultMessage: 'Image must smaller than 20MB!' })
    //   openToastAndResetFile({ ...fileValidation, isValidFileSize: false }, content)
    //   return
    // }

    // setFileValidation({ ...fileValidation, file: file })
    // validateFile({ ...fileValidation, file: file })
    
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
    // TODO: only set 'isRemoved: true' on edit, otherwise just set onCHange to empty object basically and nothing will be set.
    onChange({file: undefined, isRemoved: true})

    setImageUrl('')
    setImageName(undefined)
  }

  // TODO: how do I communicate deleting a file to the formParsing??? so the file is actually removed
  // const openToastAndResetFile = function (validationAttributes: FileValidation, content: string) {
  //   showToast({
  //     type: 'error',
  //     content
  //   })
  //   setFileValidation(validationAttributes)
  //   validateFile(fileValidation)
  //   setImageUrl('')
  //   setTempUrl('')
  // }

  return (
    // TODO: fix all the naming/labels and variable names etc.


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
            alt='floorplan'
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
        {(imageName !== undefined) ? imageName : $t({defaultMessage: 'No File Selected'})}<br />
        {(imageName !== undefined) ? 
          <HelpTextButton type="link" size='small' onClick={removeImage}>
            {$t({defaultMessage: 'Remove'})}
          </HelpTextButton> 
          : ''}<br />
        {$t({ defaultMessage: 'Max. image size: 20 MB' })}<br />
        {$t({ defaultMessage: 'Supported formats: PNG, JPEG, GIF, SVG' })}
        
      </HelpText>
    </Space>
  )

}
