import React, { useState, useEffect } from 'react'

import { Form, Input, Button, Upload, Space, Typography } from 'antd'
import { RcFile }                                         from 'antd/lib/upload'
import { useIntl }                                        from 'react-intl'

import { formatter }                                                        from '@acx-ui/formatter'
import { useUploadFileMutation, useDeleteFileMutation }                     from '@acx-ui/rc/services'
import { ActionType, FileContext, FileDto, FileType, whitespaceOnlyRegExp } from '@acx-ui/rc/utils'

import { CommonActionSettings } from './CommonActionSettings'



export function AupSettings () {
  const { $t } = useIntl()
  const formInstance = Form.useFormInstance()
  const [displayFileOption, setDisplayFileOption] = useState(false)
  const [uploadFile] = useUploadFileMutation()
  const [deleteFile] = useDeleteFileMutation()

  const aupFormatSwitch = () => {
    setDisplayFileOption(!displayFileOption)
  }

  useEffect(() => {
    setDisplayFileOption(formInstance.getFieldValue('useAupFile'))
  }, [formInstance.getFieldValue('useAupFile')])

  const validateBeforeUpload = ( file: File | RcFile) => {
    try {
      let errorMsg = validateFileSize(file)
      if (errorMsg) throw errorMsg
      formInstance.setFieldValue('aupFileName',file.name)
      return true
    } catch (err) {
      formInstance.setFieldValue('aupFileName',err as string)
      return false
    }
  }

  const validateFileSize = (file: File) => {
    const maxSize = 1024 * 1024 * 10
    const bytesFormatter = formatter('bytesFormat')
    let errorMsg = ''
    if (file.size > maxSize) {
      errorMsg = $t({ defaultMessage: 'File size ({fileSize}) is too big.' }, {
        fileSize: bytesFormatter(file.size)
      })
    }
    return errorMsg
  }


  async function fileUpload (file : RcFile | string | Blob) {
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
        formInstance.setFieldValue('aupPlainText','')
      })
  }

  const fileDelete = async () => {
    const fileToDelete:string = formInstance.getFieldValue('aupFileLocation')
    if (null !== fileToDelete && '' !== fileToDelete && fileToDelete !== undefined) {
      const fileDto: FileDto = {
        url: fileToDelete,
        type: FileType.AUP_FILE
      }
      await deleteFile({
        payload: fileDto
      })
    }
  }


  return (<>
    <CommonActionSettings actionType={ActionType.AUP} />

    <Form.Item
      name={'title'}
      label={$t({ defaultMessage: 'Title' })}
      rules={[
        { required: true },
        { min: 1 },
        { max: 100 },
        { validator: (_, value) => whitespaceOnlyRegExp(value) }
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
        { validator: (_, value) => whitespaceOnlyRegExp(value) }
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
        rules={[
          { required: true }
        ]}
        extra={<Button
          type='link'
          size='small'
          onClick={aupFormatSwitch}>
          label={$t({ defaultMessage: 'Policy Content' })}
        </Button>}>
        <Upload.Dragger
          data-testid='aupPolicy'
          name={'aupFile'}
          multiple={false}
          accept={'application/pdf,' +
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document, ' +
            'application/msword'}
          maxCount={1}
          showUploadList={false}
          beforeUpload={validateBeforeUpload}
          customRequest={async (options) =>{
            const { file } = options
            await fileUpload(file)
          }}
          onChange={fileDelete}>
          <Space style={{ height: '96px' }}>
            { formInstance.getFieldValue('aupFileName')
              ? formInstance.getFieldValue('aupFileName') :
              <Typography.Text>
                {$t({ defaultMessage: 'Drag & drop file here or' })}
              </Typography.Text>}
            <Button
              type='primary'>{formInstance.getFieldValue('aupFileName')
                ? $t({ defaultMessage: 'Change File' })
                : $t({ defaultMessage: 'Browse' })}
            </Button>
          </Space>
        </Upload.Dragger>
      </Form.Item> :
      <Form.Item
        name={'aupPlainText'}
        label={'Policy Content'}
        rules={[
          { required: true }
        ]}
        extra={<Button
          type='link'
          size='small'
          onClick={aupFormatSwitch}>
          {$t({ defaultMessage: 'Upload file instead' })}
        </Button>}>
        <Input.TextArea rows={8}
          onChange={() => {
            formInstance.setFieldValue('useAupFile',false)
            formInstance.setFieldValue('aupFileLocation','')
            formInstance.setFieldValue('aupFileName','')
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
