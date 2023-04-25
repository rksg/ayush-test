import React, { useState } from 'react'

import {
  Col,
  Row,
  Button,
  Form,
  Space,
  Typography,
  Upload
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import { MessageMapping } from '../MessageMapping'

import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
// import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface'


const UploadForm = () => {
  const { $t } = useIntl()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  // const [uploading, setUploading] = useState(false)

  // const handleUpload = () => {
  //   const formData = new FormData()
  //   fileList.forEach((file) => {
  //     formData.append('files[]', file as RcFile)
  //   })
  //   setUploading(true)
  //   // You can use any AJAX library you like
  //   fetch('', {
  //     method: 'POST',
  //     body: formData
  //   })
  //     .then((res) => res.json())
  //     .then(() => {
  //       setFileList([])
  //       message.success('upload successfully.')
  //     })
  //     .catch(() => {
  //       message.error('upload failed.')
  //     })
  //     .finally(() => {
  //       setUploading(false)
  //     })
  // }

  const props: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    onRemove: (file) => {
      const index = fileList.indexOf(file)
      const newFileList = fileList.slice()
      newFileList.splice(index, 1)
      setFileList(newFileList)
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file])

      return false
    },
    fileList
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{$t({ defaultMessage: 'Backup File Selection' })}</StepsForm.Title>
        <Form.Item
          label={$t(MessageMapping.migrate_description)}
        />
        <Upload.Dragger {...props}>
          <Space style={{ height: '90px' }}>
            <Typography.Text>
              {$t({ defaultMessage: 'Drag & drop file here or' })}
            </Typography.Text>
            <Button type='primary'>
              {$t({ defaultMessage: 'Browse' })}
            </Button>
          </Space>
        </Upload.Dragger>
      </Col>
    </Row>
  )
}

export default UploadForm
