import { useContext, useEffect, useState } from 'react'

import { Upload, Space, Button, UploadFile } from 'antd'

import { showToast }          from '@acx-ui/components'
import { PlusCircleOutlined } from '@acx-ui/icons'
import { FileValidation }     from '@acx-ui/rc/utils'
import { getIntl }            from '@acx-ui/utils'

// import { ModalContext } from '../FloorPlanModal'


export default function MspLogosUpload ({ validateFile, imageFile } : {
  validateFile: Function, imageFile?: string }) {

  //   const [imageUrl, setImageUrl] = useState(imageFile)
  const [tempUrl, setTempUrl] = useState('')
  const [fileList, setFileList] = useState<Array<UploadFile<unknown>>>()
  //   const { clearOldFile } = useContext(ModalContext)

  const [fileValidation, setFileValidation] = useState<FileValidation>({
    file: {} as File,
    isValidfileType: true,
    isValidFileSize: true
  })

  //   useEffect(() => {
  //     if (clearOldFile)
  //       validateFile({
  //         file: {} as File,
  //         isValidfileType: true,
  //         isValidFileSize: true
  //       })
  //   }, [clearOldFile])

  const { $t } = getIntl()

  const beforeUpload = function (file: File) {
    setFileValidation({
      file: {} as File,
      isValidfileType: true,
      isValidFileSize: true
    })
    const acceptedImageTypes = ['image/png', 'image/jpg', 'image/gif']
    const validImage = acceptedImageTypes.includes(file.type)
    if (!validImage) {
      const content = $t({ defaultMessage: 'Invalid Image type!' })
      openToastAndResetFile({ ...fileValidation, isValidfileType: false }, content)
      return
    }
    const isLt750K = file.size / 1024 / 1024 < 1     //TODO: UPDATE TO 0.75?
    if (!isLt750K) {
      const content = $t({ defaultMessage: 'Image must smaller than 750KB!' })
      openToastAndResetFile({ ...fileValidation, isValidFileSize: false }, content)
      return
    }

    setFileValidation({ ...fileValidation, file: file })
    validateFile({ ...fileValidation, file: file })
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setTempUrl(URL.createObjectURL(file))
    //   setImageUrl(reader.result as string)
    }
    return false
  }

  const openToastAndResetFile = function (validationAttributes: FileValidation, content: string) {
    showToast({
      type: 'error',
      content
    })
    setFileValidation(validationAttributes)
    validateFile(fileValidation)
    // setImageUrl('')
    setTempUrl('')
  }

  return (
    <Space direction='vertical'>
      { fileValidation?.file.name }
      <Upload
        // name='floorplan'
        listType='picture'
        // className='avatar-uploader'
        // showUploadList={false}
        action={tempUrl}
        fileList={fileList}
        beforeUpload={beforeUpload}
        accept='image/*'
        // style={{
        //   height: '180px'
        // }}
      >
        {/* {(imageUrl)
          ? <img src={imageUrl}
            alt='floorplan'
            style={{ width: 'auto',
              height: 'auto',
              maxHeight: '100%',
              maxWidth: '100%'
            }} /> : <div>
            <PlusCircleOutlined />
            <div className='ant-upload-text'>
              { $t({ defaultMessage: 'Import Logo' }) }</div>
          </div>} */}
        <Button type='link'>{$t({ defaultMessage: 'Import Logo' })}</Button>
      </Upload>
      {/* <Upload
        action=''
        // listType='picture'
        // accept='image/*'
      >
        <Button type='link'>{$t({ defaultMessage: 'Import Logo' })}</Button>
      </Upload> */}
    </Space>
  )

}
