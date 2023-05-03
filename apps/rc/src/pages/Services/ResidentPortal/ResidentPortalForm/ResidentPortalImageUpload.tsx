import { useContext, useEffect, useState } from 'react'

import { Upload, Space, FormItemProps, Form } from 'antd'

import { showToast }          from '@acx-ui/components'
import { PlusCircleOutlined } from '@acx-ui/icons'
import { FileValidation }     from '@acx-ui/rc/utils'
import { getIntl }            from '@acx-ui/utils'


export interface ImageUploadProps {
  formItemProps?: FormItemProps,
  // imageType: "LOGO" | "FAVICON"
}


// TODO: rename? ResidentPortalImaeUpload
// export default function FloorplanUpload ({ validateFile, imageFile } : {
//   validateFile: Function, imageFile?: string }) {
export default function ResidentPortalImageUpload (props: ImageUploadProps) {

  // TODO: remove
  // const tempFileList:UploadFile[] = [{
  //   uid: '-1',
  //   name: 'image.png',
  //   status: 'done',
  //   url: 'data:image/png;base64,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'
  // }]

  const form = Form.useFormInstance()
  const formItemProps = {
    name: 'imageFile',
    ...props.formItemProps
  }


  const [imageName, setImageName] = useState('')


  const [imageUrl, setImageUrl] = useState('')
  const [tempUrl, setTempUrl] = useState('')

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
    
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setTempUrl(URL.createObjectURL(file))
      setImageUrl(reader.result as string)
      setImageName(file.name)
    }
    return false
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

            //{/* TODO: { fileValidation?.file.name } */}
    <Form.Item {...formItemProps}
        children={
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
              }}>
              {(imageUrl)
                ? <img src={imageUrl}
                  alt='floorplan'
                  style={{ width: 'auto',
                    height: 'auto',
                    maxHeight: '100%',
                    maxWidth: '100%'
                  }} /> : <div>
                  <PlusCircleOutlined />
                  <div className='ant-upload-text'>
                    { $t({ defaultMessage: 'Upload' }) }</div>
                </div>}
            </Upload>
        }
        extra={<>
          TODO: UPDATE THIS TEXT -- Add change and reset buttons, figure out how to make it look close to the mockup... if possible <br />
          {imageName} <br />
          {$t({ defaultMessage: 'Max. image size: 20 MB' })}
          <br />
          {$t({ defaultMessage: 'Supported formats: PNG, JPEG, GIF, SVG' })}
        </>}/>
  )

}
