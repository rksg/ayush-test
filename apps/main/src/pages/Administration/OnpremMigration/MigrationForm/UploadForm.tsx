import React, { ReactNode, useContext, useState } from 'react'

import {
  FileTextOutlined,
  WarningOutlined
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
  formatter
} from '@acx-ui/formatter'
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

  const allowedExtensions: string[] = ['bak']
  const maxSize: number = 1024*10*1024
  const [fileDescription, setFileDescription] = useState<ReactNode>('')

  const bytesFormatter = formatter('bytesFormat')

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
      let errorMsg = ''
      dispatch({
        type: MigrationActionTypes.ERRORMSG,
        payload: {
          errorMsg
        }
      })

      const extension: string = file?.name.split('.').pop() as string
      if (!allowedExtensions.includes(extension)) {
        errorMsg = $t({ defaultMessage: 'Invalid file type.' })
      }
      if (file.size > maxSize) {
        errorMsg = $t({ defaultMessage: 'File size ({fileSize}) is too big.' }, {
          fileSize: bytesFormatter(file.size)
        })
      }

      if (errorMsg) {
        setFileDescription(
          <Typography.Text type='danger'>
            <WarningOutlined /> {errorMsg}
          </Typography.Text>
        )
        dispatch({
          type: MigrationActionTypes.ERRORMSG,
          payload: {
            errorMsg
          }
        })
        return Upload.LIST_IGNORE
      }

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
          // name='backupFile'
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
