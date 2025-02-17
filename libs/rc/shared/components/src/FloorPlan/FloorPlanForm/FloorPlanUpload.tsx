import { useContext, useEffect, useState } from 'react'

import { Upload, Space }                    from 'antd'
import { RcFile }                           from 'antd/lib/upload'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

import { showToast }          from '@acx-ui/components'
import { PlusCircleOutlined } from '@acx-ui/icons'
import { FileValidation }     from '@acx-ui/rc/utils'
import { getIntl }            from '@acx-ui/utils'

import { ModalContext } from '../FloorPlanModal'


GlobalWorkerOptions.workerSrc = pdfjsWorker

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
    const acceptedImageTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/svg',
      'image/svg+xml',
      'application/pdf'
    ]
    const validImage = acceptedImageTypes.includes(file.type)
    if (!validImage) {
      const content = $t({ defaultMessage: 'Invalid file type!' })
      openToastAndResetFile({ ...fileValidation, isValidfileType: false }, content)
      return
    }

    if (file.type === 'application/pdf') {
      const uid = (file as RcFile).uid
      convertPdfToImage(file, uid).then(uploadedFile => {
        beforeUpload(uploadedFile)
      })
        .catch(err => {
          const content = err.name === 'PasswordException'
            ? $t({ defaultMessage: 'Password protected files are not allowed!' })
            : err?.message ? err.message : $t({ defaultMessage: 'Unsupported file!' })
          openToastAndResetFile({ ...fileValidation, isValidFileSize: false }, content)
          return
        })
    } else {
      const isLt20M = file.size / 1024 / 1024 < 20
      if (!isLt20M) {
        const content = $t({ defaultMessage: 'File must smaller than 20MB!' })
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
    }
    return false
  }

  const convertPdfToImage = async (pdfFile: File, uid: string): Promise<RcFile> => {
    const pdf = await getDocument(URL.createObjectURL(pdfFile)).promise
    const page = await pdf.getPage(1) // Get the first page

    const scale = 1.5
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.height = viewport.height
    canvas.width = viewport.width

    const renderContext = {
      canvasContext: context,
      viewport
    }

    await page.render(renderContext).promise

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob)
      }, 'image/jpeg')
    })

    // Convert Blob to RcFile
    const rcFile = await new File([blob], `${pdfFile.name.split('.')[0]}.jpg`, {
      type: 'image/jpeg'
    }) as RcFile

    rcFile.uid = uid
    return rcFile
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
    <Space direction='vertical'>
      { fileValidation?.file.name }
      <Upload
        name='floorplan'
        listType='picture-card'
        className='avatar-uploader'
        showUploadList={false}
        action={tempUrl}
        beforeUpload={beforeUpload}
        accept='image/*, application/pdf'
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
            <div className='ant-upload-text'>
              { $t({ defaultMessage: 'Upload' }) }</div>
          </div>}
      </Upload>
    </Space>
  )

}
