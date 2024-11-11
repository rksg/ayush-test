import React, { useState, useEffect } from 'react'

import { Form, Input, Button, Upload, Space, Typography } from 'antd'
import { RcFile }                                         from 'antd/lib/upload'
import { useIntl }                                        from 'react-intl'

import { formatter }             from '@acx-ui/formatter'
import { useUploadFileMutation } from '@acx-ui/rc/services'
import {
  ActionType,
  FileContext,
  FileType,
  trailingNorLeadingSpaces
} from '@acx-ui/rc/utils'

import { CommonActionSettings } from './CommonActionSettings'



export function AupSettings () {
  const { $t } = useIntl()
  const formInstance = Form.useFormInstance()
  const [displayFileOption, setDisplayFileOption] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const [fileSizeInvalid, setfileSizeInvalid] = useState(false)
  const [fileTypeInvalid, setfileTypeInvalid] = useState(false)
  const [uploadFile] = useUploadFileMutation()

  const aupFormatSwitch = () => {
    setDisplayFileOption(!displayFileOption)
  }

  useEffect(() => {
    setDisplayFileOption(formInstance.getFieldValue('useAupFile'))
  }, [formInstance.getFieldValue('useAupFile')])

  useEffect(() => {
    formInstance.validateFields()
  }, [fileLoading])

  const validateBeforeUpload = ( file: File | RcFile) => {
    let errorMsg = validateFileSize(file)
    if (errorMsg) {
      setfileSizeInvalid(true)
      return false
    }
    if (file.type !== 'application/pdf' &&
      file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
            file.type !== 'application/msword') {
      setfileTypeInvalid(true)
      return false
    }
    setfileSizeInvalid(false)
    setfileTypeInvalid(false)
    formInstance.setFieldValue('aupFileName',file.name)
    return true
  }

  const validateFileSize = (file: File) => {
    const maxSize = 1024 * 1024 * 2
    const bytesFormatter = formatter('bytesFormat')
    let errorMsg = ''
    if (file.size > maxSize) {
      errorMsg = $t({ defaultMessage: 'File size ({fileSize}) is too big.' }, {
        fileSize: bytesFormatter(file.size)
      })
    }
    return errorMsg
  }


  async function fileUpload (file: RcFile | string | Blob) {
    const formDataInput = new FormData()
    const fileContext: FileContext = {
      name: formInstance.getFieldValue('aupFileName'),
      type: FileType.AUP_FILE
    }

    formDataInput.append('fileDetails',
      new Blob([JSON.stringify(fileContext)],
        { type: 'application/json' }), '')
    formDataInput.append('fileToUpload', new Blob([file]))
    await uploadFile({
      payload: formDataInput
    }).unwrap()
      .then(response => {
        formInstance.setFieldValue('aupFileLocation', response.url)
        formInstance.setFieldValue('useAupFile', true)
        formInstance.setFieldValue('aupPlainText', '')
        setFileLoading(false)
        formInstance.validateFields()
      })
  }

  const validateFileLoading = async ( ) => {
    if (fileLoading === true) {
      return Promise.reject($t({ defaultMessage: 'File upload is in progress' }))
    } else {
      return Promise.resolve()
    }
  }

  const fileUrlPresent = async () => {
    if (null !== formInstance.getFieldValue('aupFileLocation')
      && '' !== formInstance.getFieldValue('aupFileLocation')
      && formInstance.getFieldValue('aupFileLocation') !== undefined)
    {
      return Promise.resolve()
    } else {
      return Promise.reject($t({ defaultMessage: 'Please upload policy file' }))
    }
  }

  const invalidFileSize = async ( ) => {
    if (fileSizeInvalid === true) {
      return Promise.reject($t({ defaultMessage: 'File size should be upto 2MB' }))
    } else {
      return Promise.resolve()
    }
  }

  const invalidFileType = async ( ) => {
    if (fileTypeInvalid === true) {
      return Promise.reject($t({ defaultMessage: 'Invalid file type' }))
    } else {
      return Promise.resolve()
    }
  }

  return (<>
    <CommonActionSettings actionType={ActionType.AUP} />

    <Form.Item
      name={'title'}
      label={$t({ defaultMessage: 'Title' })}
      rules={[
        { required: true },
        { min: 2 },
        { max: 100 },
        { validator: (_, value) => trailingNorLeadingSpaces(value) }
      ]}
    >
      <Input/>
    </Form.Item>

    <Form.Item
      name={'messageHtml'}
      label={$t({ defaultMessage: 'Message' })}
      rules={[
        { required: true },
        { min: 1 },
        { max: 1000 },
        { validator: (_, value) => trailingNorLeadingSpaces(value) }
      ]}
    >
      <Input.TextArea rows={8}/>
    </Form.Item>

    <Form.Item
      name={'checkboxText'}
      hidden={true}
    >
      <Input/>
    </Form.Item>

    <Form.Item
      name={'checkboxHighlightColor'}
      hidden={true}
    >
      <Input/>
    </Form.Item>

    <Form.Item
      name={'continueButtonText'}
      hidden={true}
    >
      <Input/>
    </Form.Item>

    <Form.Item
      name={'backButtonText'}
      hidden={true}
    >
      <Input/>
    </Form.Item>

    <Form.Item
      name={'useAupFile'}
      hidden={true}
    >
      <Input/>
    </Form.Item>

    {displayFileOption?
      <Form.Item
        name={'aupFile'}
        label={$t({ defaultMessage: 'Policy Content' })}
        validateFirst={true}
        rules={[
          { validator: validateFileLoading },
          { validator: invalidFileSize },
          { validator: invalidFileType },
          { validator: fileUrlPresent }
        ]}
        valuePropName='file'
        extra={<Button
          type='link'
          size='small'
          onClick={aupFormatSwitch}>
          {$t({ defaultMessage: 'Paste text instead' })}
        </Button>}>
        <Upload.Dragger
          name={'aupFile'}
          data-testid='aupPolicy'
          multiple={false}
          accept={'application/pdf,' +
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document, ' +
            'application/msword'}
          maxCount={1}
          showUploadList={false}
          beforeUpload={validateBeforeUpload}
          customRequest={async (options) => {
            setFileLoading(true)
            const { file } = options
            await fileUpload(file)
            setFileLoading(false)
          }}>
          <Space style={{ height: '96px' }}>
            { formInstance.getFieldValue('aupFileName')
              ? formInstance.getFieldValue('aupFileName') :
              <Typography.Text>
                {$t({ defaultMessage: 'Drag & drop file here or' })}
              </Typography.Text>}
            <Button
              type='primary'
              loading={fileLoading} >{formInstance.getFieldValue('aupFileName')
                ? $t({ defaultMessage: 'Change File' })
                : $t({ defaultMessage: 'Browse' })}
            </Button>
          </Space>
        </Upload.Dragger>
      </Form.Item> :
      <Form.Item
        name={'aupPlainText'}
        label={$t({ defaultMessage: 'Policy Content' })}
        rules={[
          { required: true },
          { max: 1000 },
          { validator: (_, value) => trailingNorLeadingSpaces(value) }
        ]}
        extra={<Button
          type='link'
          size='small'
          onClick={aupFormatSwitch}>
          {$t({ defaultMessage: 'Upload file instead' })}
        </Button>}>
        <Input.TextArea data-testid='policy-text'
          rows={8}
          onChange={() => {
            formInstance.setFieldValue('useAupFile',false)
            formInstance.setFieldValue('aupFileLocation', null)
            formInstance.setFieldValue('aupFileName', null)
          }}/>
      </Form.Item>}

    <Form.Item name={'useAupFile'} hidden={true}>
      <Input/>
    </Form.Item>

    <Form.Item name={'aupFileName'} hidden={true}>
      <Input/>
    </Form.Item>

    <Form.Item name={'aupFileLocation'} hidden={true}>
      <Input/>
    </Form.Item>

  </>)
}
