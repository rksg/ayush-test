import { ReactNode, useEffect, useState } from 'react'

import {
  FileTextOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import {
  Space,
  Typography,
  Upload
} from 'antd'
import { useIntl } from 'react-intl'

import { Button, DrawerProps } from '@acx-ui/components'
import { formatter }           from '@acx-ui/utils'

import * as UI from './styledComponents'

type importErrorRes = {
  errors: {
    code: number
    description: string
  }[]
  downloadUrl?: string
  txId: string
  fileErrorsCount: number
}

interface ImportCsvDrawerProps extends DrawerProps {
  temlateLink: string
  maxSize: number
  maxEntries: number
  importError?: FetchBaseQueryError
  importRequest: (file: FormData)=>void
  type: 'AP' | 'Switch' | 'GuestPass' | 'DPSK'
}

export const CsvSize = {
  '1MB': 1024*1*1024,
  '5MB': 1024*5*1024
}

export function ImportCsvDrawer (props: ImportCsvDrawerProps) {
  const { $t } = useIntl()

  const { maxSize, maxEntries, temlateLink, importError, importRequest } = props

  const [fileDescription, setFileDescription] = useState<ReactNode>('')
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>()

  const bytesFormatter = formatter('bytesFormat')

  useEffect(()=>{
    setFormData(undefined)
    setFileDescription('')
  }, [props.visible])

  useEffect(()=>{
    if (importError?.data) {
      const { errors, downloadUrl } = importError?.data as importErrorRes
      setFormData(undefined)
      setFileDescription(<>
        { errors && <Typography.Text type='danger'><WarningOutlined /> {$t(
          { defaultMessage: `{count, plural,
              one {{description}}
              other {{count} errors found.}
          }` },
          { count: errors.length,
            description: errors[0].description }
        )}</Typography.Text>}
        { downloadUrl && <Typography.Link href={downloadUrl}
          onClick={(e)=>{
            e.stopPropagation()
          }}>
          {$t({ defaultMessage: 'See errors' })}
        </Typography.Link>}
      </>)
      setConfirmLoading(false)
    }
  }, [$t, importError])

  const beforeUpload = (file: File) => {
    let errorMsg = ''
    if (file.type !== 'text/csv') {
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
    setConfirmLoading(true)
    formData && importRequest(formData)
  }

  return (<UI.ImportFileDrawer {...props}
    keyboard={false}
    closable={true}
    width={440}
    footer={<div>
      <Button
        disabled={!formData}
        loading={confirmLoading}
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
      <li><a href={temlateLink}>{$t({ defaultMessage: 'Download template' })}</a></li>
      <li>{$t({ defaultMessage: 'File format must be csv' })}</li>
      <li>{$t(
        { defaultMessage: 'File may contain up to {maxEntries} entries' },
        { maxEntries })}</li>
      <li>{$t(
        { defaultMessage: 'File size cannot exceed {maxSize}' },
        { maxSize: bytesFormatter(maxSize) })}</li>
    </ul>
  </UI.ImportFileDrawer>)
}