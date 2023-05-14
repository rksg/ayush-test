import React, { ReactNode, useContext, useState } from 'react'

import {
  FileTextOutlined
} from '@ant-design/icons'
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

import {
  StepsFormLegacy
} from '@acx-ui/components'
import {
  MigrationActionTypes
} from '@acx-ui/rc/utils'

import { MessageMapping } from '../MessageMapping'
import MigrationContext   from '../MigrationContext'

import type { UploadProps } from 'antd/es/upload/interface'


const UploadForm = () => {
  const { $t } = useIntl()

  const {
    dispatch
  } = useContext(MigrationContext)

  const [fileDescription, setFileDescription] = useState<ReactNode>('')

  const props: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    // onRemove: (file) => {
    //   const index = fileList.indexOf(file)
    //   const newFileList = fileList.slice()
    //   newFileList.splice(index, 1)
    //   setFileList(newFileList)
    // },
    beforeUpload: (file: File) => {
      dispatch({
        type: MigrationActionTypes.UPLOADFILE,
        payload: {
          file: file
        }
      })
      setFileDescription(<Typography.Text><FileTextOutlined /> {file.name} </Typography.Text>)

      return false
    }
    // fileList
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsFormLegacy.Title children={$t({ defaultMessage: 'Backup File Selection' })} />
        <Form.Item
          name='backupFile'
          label={$t(MessageMapping.migrate_description)}
        />
        <Upload.Dragger {...props}>
          <Space style={{ height: '90px' }}>
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
      </Col>
    </Row>
  )
}

export default UploadForm
