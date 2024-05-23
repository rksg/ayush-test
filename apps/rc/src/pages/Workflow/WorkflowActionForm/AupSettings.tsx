import React, { useEffect, useState } from 'react'

import { Checkbox, Form, Input, Upload } from 'antd'
import { RcFile }                        from 'antd/lib/upload'
import { useIntl }                       from 'react-intl'

import { Button }               from '@acx-ui/components'
import { UploadDocument }       from '@acx-ui/icons'
import { whitespaceOnlyRegExp } from '@acx-ui/rc/utils'
import { loadImageWithJWT }     from '@acx-ui/utils'

import { CommonActionSettings } from './CommonActionSettings'

export function AupSettings () {
  const { $t } = useIntl()
  const [downloadUrl, setDownloadUrl] = useState()
  const form = Form.useFormInstance()
  const aupFileLocation = Form.useWatch<RcFile|string>('aupFileLocation', form)

  useEffect(() => {
    if (typeof aupFileLocation === 'string') {
      console.log('Location value = ', aupFileLocation)
      if (aupFileLocation.trim() === '') return
      loadImageWithJWT(aupFileLocation)
        .then(res => {
          setDownloadUrl(res)
        })
        .catch(ex => {
          // FIXME: Try to display the error result to the user
          console.log('Error', ex)
        })
    }
  }, [aupFileLocation])

  const setFile = (file: RcFile) => {
    form.setFieldValue('aupFileLocation', file)
    form.setFieldValue('useAupFile', true)

    return Upload.LIST_IGNORE
  }

  const onRemoveFile = (): boolean => {
    form.setFieldValue('aupFileLocation', undefined)
    form.setFieldValue('useAupFile', false)
    return true
  }

  return (<>
    <CommonActionSettings />

    {/* TODO: Split content if the user want to upload the file as the template (Need HTML file) */}
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
      <Input />
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
      <Input.TextArea rows={8} />
    </Form.Item>

    <Form.Item
      name={'bottomLabel'}
      label={$t({ defaultMessage: 'Bottom Label' })}
      rules={[{ max: 1000 }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name={'checkboxDefaultState'}
      label={$t({ defaultMessage: 'Checkbox Default State' })}
      valuePropName={'checked'}
    >
      <Checkbox />
    </Form.Item>

    <Form.Item
      name={'checkboxText'}
      label={$t({ defaultMessage: 'Acceptance Checkbox Label' })}
      rules={[
        { required: true },
        { max: 100 },
        { validator: (_, value) => whitespaceOnlyRegExp(value) }
      ]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name={'checkboxHighlightColor'}
      label={$t({ defaultMessage: 'Checkbox Highlight Color' })}
      rules={[
        { required: true }
      ]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name={'backButtonText'}
      label={$t({ defaultMessage: 'Back Button Label' })}
      rules={[
        { required: true },
        { max: 20 }
      ]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name={'continueButtonText'}
      label={$t({ defaultMessage: 'Continue Button Label' })}
      rules={[
        { required: true },
        { max: 20 }
      ]}
    >
      <Input />
    </Form.Item>


    {/* Different type of AUP settings */}
    <Form.Item
      hidden
      name={'useAupFile'}
      label={$t({ defaultMessage: 'useAupFile' })}
      valuePropName={'checked'}
    >
      <Checkbox />
    </Form.Item>

    <Form.Item
      name={'aupFileLocation'}
      label={$t({ defaultMessage: 'Aup File' })}
    >
      {downloadUrl
        ? <>
          <Button
            type={'link'}
            target={'_blank'}
            href={downloadUrl}
          >
            {$t({ defaultMessage: 'Download Policy File' })}
          </Button>
          {/*<Button*/}
          {/*  onClick={onRemoveFile}*/}
          {/*  icon={<DeleteOutlined />}*/}
          {/*/>*/}
        </>
        : <div>
          {$t({ defaultMessage: 'No File Chosen' })}
        </div>
      }
    </Form.Item>

    {/*<Form.Item*/}
    {/*  hidden*/}
    {/*  name={'useContentFile'}*/}
    {/*  label={$t({ defaultMessage: 'useContentFile' })}*/}
    {/*  valuePropName={'checked'}*/}
    {/*>*/}
    {/*  <Checkbox />*/}
    {/*</Form.Item>*/}

    {/*<Form.Item*/}
    {/*  name={'contentFileLocation'}*/}
    {/*  label={$t({ defaultMessage: 'contentFileLocation' })}*/}
    {/*>*/}
    {/*  {downloadUrl*/}
    {/*    ? <>*/}
    {/*      <Button*/}
    {/*        type={'link'}*/}
    {/*        target={'_blank'}*/}
    {/*        href={downloadUrl}*/}
    {/*      >*/}
    {/*        {$t({ defaultMessage: 'Download Policy File' })}*/}
    {/*      </Button>*/}
    {/*      <Button*/}
    {/*        onClick={onRemoveFile}*/}
    {/*        icon={<DeleteOutlined />}*/}
    {/*      />*/}
    {/*    </>*/}
    {/*    : <Input hidden disabled />*/}
    {/*  }*/}
    {/*</Form.Item>*/}

    <Upload
      showUploadList
      name={'file'}
      accept={'txt'}
      beforeUpload={setFile}
      onRemove={onRemoveFile}
      maxCount={1}
    >
      <Button icon={<UploadDocument />}>
        {$t({ defaultMessage: 'Upload AUP File' })}
      </Button>
    </Upload>

  </>)
}
