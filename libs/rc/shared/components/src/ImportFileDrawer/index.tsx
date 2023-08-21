import { ReactNode, useEffect, useState } from 'react'

import {
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import {
  Form,
  Space,
  Typography,
  Upload
} from 'antd'
import { useIntl } from 'react-intl'

import { Button, DrawerProps } from '@acx-ui/components'
import { formatter }           from '@acx-ui/formatter'
import { GuestErrorRes }       from '@acx-ui/user'

import * as UI from './styledComponents'

export enum ImportFileDrawerType {
  AP,
  Switch,
  GuestPass,
  DPSK,
  Persona,
  CLI,
  PropertyUnit,
  EdgeDHCP,
  EdgeSubInterface
}

export type ImportErrorRes = {
  errors: {
    code: number
    description?: string
    message?: string
  }[],
  downloadUrl?: string
  txId: string
} | GuestErrorRes

type AcceptableType = 'csv' | 'txt' | 'xlsx'

interface ImportFileDrawerProps extends DrawerProps {
  templateLink?: string
  maxSize: number
  maxEntries?: number
  isLoading?: boolean
  importError?: FetchBaseQueryError
  importRequest: (formData: FormData, values: object, content?: string)=>void
  readAsText?: boolean,
  skipCsvTextConvert?: boolean,
  formDataName?: string,
  acceptType: string[]
  type: ImportFileDrawerType
  extraDescription?: string[],
  validator?: (content: string) => Promise<void>
}

export const CsvSize = {
  '1MB': 1024*1*1024,
  '2MB': 1024*2*1024,
  '5MB': 1024*5*1024,
  '20MB': 1024*20*1024
}

const fileTypeMap: Record<AcceptableType, string[]>= {
  csv: ['text/csv', 'application/vnd.ms-excel'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  txt: ['text/plain']
}

export function ImportFileDrawer (props: ImportFileDrawerProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()

  const { maxSize, maxEntries, isLoading, templateLink,
    importError, importRequest, readAsText, acceptType,
    extraDescription, formDataName = 'file', skipCsvTextConvert = false, validator } = props

  const [fileDescription, setFileDescription] = useState<ReactNode>('')
  const [formData, setFormData] = useState<FormData>()
  const [file, setFile] = useState<Blob>()
  const [fileName, setFileName] = useState<string>()

  const bytesFormatter = formatter('bytesFormat')

  useEffect(()=>{
    if (props.visible) {
      form.resetFields()
      setFormData(undefined)
      setFileDescription('')
    }
  }, [form, props.visible])

  useEffect(()=>{
    if (!importError) return

    if (typeof importError === 'string') {
      setFormData(undefined)
      setFileDescription(<Typography.Text type='danger'>
        <WarningOutlined />
        {importError}
      </Typography.Text>)
    } else {
      const importErrorData = (importError?.data ?? {}) as object
      if (Object.keys(importErrorData).length) {
        const errorObj = importError?.data as ImportErrorRes
        let errors, downloadUrl
        let description = ''

        if ('errors' in errorObj) {
          errors = errorObj.errors
          downloadUrl = errorObj.downloadUrl
          description = errors[0].description || errors[0].message!
        }
        if ('error' in errorObj) { // narrowing to GuestErrorRes
          errors = errorObj.error.rootCauseErrors
          description = errors[0].message
        }

        setFormData(undefined)
        setFileDescription(<>
          { errors && <Typography.Text type='danger'>
            <WarningOutlined /> {$t(
              { defaultMessage: `{count, plural,
                one {{description}}
                other {{count} errors found.}
            }` },
              { count: errors.length, description }
            )}</Typography.Text>}
          { downloadUrl && <Typography.Link href={downloadUrl}
            onClick={(e)=>{
              e.stopPropagation()
            }}>
            {$t({ defaultMessage: 'See errors' })}
          </Typography.Link>}
        </>)
      }
    }

  }, [$t, importError])


  const beforeUpload = async (file: File) => {
    try {
      let errorMsg = ''
      const acceptableFileType = acceptType.map(type =>
        fileTypeMap[type as AcceptableType]).flat()

      if (!acceptableFileType?.includes(file.type)) {
        errorMsg = $t({ defaultMessage: 'Invalid file type.' })
      }
      if (file.size > maxSize) {
        errorMsg = $t({ defaultMessage: 'File size ({fileSize}) is too big.' }, {
          fileSize: bytesFormatter(file.size)
        })
      }

      if (errorMsg) throw errorMsg

      if (readAsText && validator) {
        const content = await readFileContent(file, file.name, skipCsvTextConvert)
        await validator(content)
      }

      const newFormData = new FormData()
      newFormData.append(formDataName, file, file.name)

      setFile(file)
      setFileName(file.name)
      setFormData(newFormData)
      setFileDescription(<UI.FileNameText ellipsis={{ tooltip: file.name }}>
        <FileTextOutlined /> {file.name}
      </UI.FileNameText>)

      return false
    } catch(err) {
      setFormData(undefined)
      setFileDescription(
        <Typography.Text type='danger'>
          <WarningOutlined /> {err as string}
        </Typography.Text>
      )
      return Upload.LIST_IGNORE
    }
  }

  const okHandler = () => {
    if (readAsText) {
      const fileObject = new File([file!], fileName!)
      readFileContent(fileObject, fileName!, skipCsvTextConvert)
        .then(result => {
          importRequest(formData as FormData, {}, result)
        })
        .catch(() => {})
    } else {
      form.validateFields().then(values => {
        formData && importRequest(formData, values)
      }).catch(() => {})
    }
  }

  return (<UI.ImportFileDrawer {...props}
    keyboard={false}
    closable={true}
    width={440}
    footer={<div>
      <Button
        disabled={!formData}
        loading={isLoading}
        onClick={() => okHandler()}
        type='primary'
      >
        {$t({ defaultMessage: 'Import' })}
      </Button>
      <Button onClick={props?.onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
    </div>} >
    <Upload.Dragger
      accept={acceptType?.map(type => `.${String(type)}`).join(', ')}
      maxCount={1}
      showUploadList={false}
      beforeUpload={beforeUpload} >
      <Space>
        { fileDescription ? fileDescription :
          <Typography.Text>
            {$t({ defaultMessage: 'Drag & drop file here or' })}
          </Typography.Text> }
        <Button type='primary'>{ fileDescription ?
          $t({ defaultMessage: 'Change File' }) :
          $t({ defaultMessage: 'Browse' }) }
        </Button>
      </Space>
    </Upload.Dragger>
    <ul>
      { templateLink && <li>
        <a href={templateLink} download>{$t({ defaultMessage: 'Download template' })}</a>
      </li> }
      <li>{$t(
        { defaultMessage: 'File format must be {acceptTypes}' },
        { acceptTypes: acceptType.join(', ') })}</li>
      { maxEntries && <li>{$t(
        { defaultMessage: 'File may contain up to {maxEntries} entries' },
        { maxEntries })}</li>}
      <li>{$t(
        { defaultMessage: 'File size cannot exceed {maxSize}' },
        { maxSize: bytesFormatter(maxSize) })}</li>
      {extraDescription &&
        extraDescription.map((desc, index) => <li key={index}>{desc}</li>)
      }
    </ul>
    <Form layout='vertical' form={form} >
      {props.children}
    </Form>
  </UI.ImportFileDrawer>)
}

function isCsvFile (fileName: string) {
  return fileName.endsWith('.csv')
}

function convertCsvToText (csvData: string) {
  const allTextLines = csvData.split(/\r?\n|\r/)
  const headers = allTextLines[0].split(',')
  let text = ''

  for (let i = 0; i < allTextLines.length; i++) {
    // split content based on comma
    let data = allTextLines[i].split(',')
    if (data.length === headers.length) {
      let tarr = []
      for (let j = 0; j < headers.length; j++) {
        tarr.push(data[j])
      }

      text = text + tarr.join(' ') + '\n'
    }
  }
  return text
}

const readFileContent = (
  file: File,
  fileName: string,
  skipCsvTextConvert?: boolean):Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      try {
        let result = String(fileReader.result)
        if (isCsvFile(fileName as string) && !skipCsvTextConvert) {
          result = convertCsvToText(result)
        }

        resolve(result)
      } catch(error) {reject(error)}
    }

    fileReader.readAsText(file as Blob)
  })
}