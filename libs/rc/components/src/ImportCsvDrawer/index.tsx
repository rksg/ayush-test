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
import { GuestErrorRes }       from '@acx-ui/rc/utils'
import { formatter }           from '@acx-ui/utils'

import * as UI from './styledComponents'

type importErrorRes = {
  errors: {
    code: number
    description?: string
    message?: string
  }[],
  downloadUrl?: string
  txId: string
} | GuestErrorRes

interface ImportCsvDrawerProps extends DrawerProps {
  templateLink: string
  maxSize: number
  maxEntries: number
  isLoading?: boolean
  importError?: FetchBaseQueryError
  importRequest: (formData: FormData, values: object)=>void
  type: 'AP' | 'Switch' | 'GuestPass' | 'DPSK' | 'Persona'
}

export const CsvSize = {
  '1MB': 1024*1*1024,
  '5MB': 1024*5*1024
}

export function ImportCsvDrawer (props: ImportCsvDrawerProps) {
  const { $t } = useIntl()
  const [form] = Form.useForm()

  const { maxSize, maxEntries, isLoading, templateLink, importError, importRequest } = props

  const [fileDescription, setFileDescription] = useState<ReactNode>('')
  const [formData, setFormData] = useState<FormData>()

  const bytesFormatter = formatter('bytesFormat')

  useEffect(()=>{
    form.resetFields()
    setFormData(undefined)
    setFileDescription('')
  }, [form, props.visible])

  useEffect(()=>{
    if (importError?.data) {
      const errorObj = importError?.data as importErrorRes
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
        { errors && <Typography.Text type='danger'><WarningOutlined /> {$t(
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
  }, [$t, importError])

  const beforeUpload = (file: File) => {
    let errorMsg = ''
    if (file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      errorMsg = $t({ defaultMessage: 'Invalid file type.' })
    }
    if (file.size > maxSize) {
      errorMsg = $t({ defaultMessage: 'File size ({fileSize}) is too big.' }, {
        fileSize: bytesFormatter(file.size)
      })
    }

    if (errorMsg) {
      setFormData(undefined)
      setFileDescription(
        <Typography.Text type='danger'>
          <WarningOutlined /> {errorMsg}
        </Typography.Text>
      )
      return Upload.LIST_IGNORE
    }

    const newFormData = new FormData()
    newFormData.append('file', file, file.name)

    setFormData(newFormData)
    setFileDescription(<Typography.Text><FileTextOutlined /> {file.name} </Typography.Text>)

    return false
  }

  const okHandler = () => {
    form.validateFields().then(values => {
      formData && importRequest(formData, values)
    }).catch(() => {})
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
        type={'secondary'}
      >
        {$t({ defaultMessage: 'Import' })}
      </Button>
      <Button onClick={props?.onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
    </div>} >
    <Upload.Dragger
      accept='.csv'
      maxCount={1}
      showUploadList={false}
      beforeUpload={beforeUpload} >
      <Space style={{ height: '90px' }}>
        { fileDescription ? fileDescription :
          <Typography.Text>
            {$t({ defaultMessage: 'Drag & drop file here or' })}
          </Typography.Text> }
        <Button type='primary'>{ fileDescription ?
          $t({ defaultMessage: 'Change File' }) :
          $t({ defaultMessage: 'Browser' }) }
        </Button>
      </Space>
    </Upload.Dragger>
    <ul>
      <li><a href={templateLink} download>{$t({ defaultMessage: 'Download template' })}</a></li>
      <li>{$t({ defaultMessage: 'File format must be csv' })}</li>
      <li>{$t(
        { defaultMessage: 'File may contain up to {maxEntries} entries' },
        { maxEntries })}</li>
      <li>{$t(
        { defaultMessage: 'File size cannot exceed {maxSize}' },
        { maxSize: bytesFormatter(maxSize) })}</li>
    </ul>
    <Form layout='vertical' form={form} >
      {props.children}
    </Form>
  </UI.ImportFileDrawer>)
}
