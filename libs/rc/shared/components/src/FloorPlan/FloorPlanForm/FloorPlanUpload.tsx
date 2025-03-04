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

    const isLt20M = file.size / 1024 / 1024 < 20
    if (!isLt20M) {
      const content = $t({ defaultMessage: 'File must smaller than 20MB!' })
      openToastAndResetFile({ ...fileValidation, isValidFileSize: false }, content)
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

  const readAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string)?.split(',')[1]) // Get Base64 without data URI prefix
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file) // Read as Base64 Data URL
    })
  }

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  const convertPdfToImage = async (pdfFile: File, uid: string): Promise<RcFile> => {

    // Convert PDF to Base64
    const base64Pdf = await readAsBase64(pdfFile)

    // Decode Base64 to ArrayBuffer
    const pdfUint8Array = new Uint8Array(base64ToArrayBuffer(base64Pdf))

    // Load the PDF document from ArrayBuffer
    const pdf = await getDocument({ data: pdfUint8Array }).promise
    const page = await pdf.getPage(1)

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


    // Convert canvas to Base64 Data URL
    const base64Image = canvas.toDataURL('image/jpeg')

    // Convert the Base64 string to a Blob
    const byteString = window.atob(base64Image.split(',')[1])
    const arrayBuffer = new ArrayBuffer(byteString.length)
    const uint8Array = new Uint8Array(arrayBuffer)

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i)
    }

    const blob = new Blob([uint8Array], { type: 'image/jpeg' })

    const rcFile = new File([blob], `${pdfFile.name.split('.')[0]}.jpg`, {
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
