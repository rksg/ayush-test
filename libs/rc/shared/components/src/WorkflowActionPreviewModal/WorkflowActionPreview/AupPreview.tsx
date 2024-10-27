import React, { useState, useEffect } from 'react'

import { Typography, Checkbox, Button, Modal, Form } from 'antd'
import FormItem                                      from 'antd/es/form/FormItem'
import { useIntl }                                   from 'react-intl'

import { GridCol, GridRow }                     from '@acx-ui/components'
import { useLazyGetFileQuery }                  from '@acx-ui/rc/services'
import { AupAction, GenericActionPreviewProps } from '@acx-ui/rc/utils'

import { ContentPreview } from './ContentPreview'

export function AupPreview (props: GenericActionPreviewProps<AupAction>) {
  const { $t } = useIntl()
  const { Text, Link } = Typography
  const { data, ...rest } = props
  useEffect(() => {
    getFile()
  }, [])

  const [getFileUrl] = useLazyGetFileQuery()
  const [fileUrl, setfileUrl] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleClose = () => {
    setIsModalOpen(false)
  }


  const getFile = () => {
    if (data?.useAupFile && data?.aupFileLocation) {
      getFileUrl({ params: { fileId: data?.aupFileLocation } }).unwrap()
        .then((payload) => setfileUrl(payload.url))
    }
  }

  return <ContentPreview
    title={data?.title}
    body={
      <><GridRow justify={'center'}
        align={'middle'}>
        <GridCol col={{ span: 24 }}
          style={{ alignItems: 'center' }}>
          <span dangerouslySetInnerHTML={{ __html: data?.messageHtml || '' }} />
        </GridCol>

        <GridCol col={{ span: 24 }}
          style={{ alignItems: 'center' }}>
          <Form layout='vertical'
            style={{ width: '250px' }}>
            <FormItem
              name='acceptAup'
              initialValue={data?.checkboxDefaultState}
              valuePropName='checked'
            >
              <Checkbox data-testid='acceptAup'>
                {data?.useAupFile ?
                  <Text>{$t({ defaultMessage: 'I agree to the' })+' '}<Link href={fileUrl}>
                    {$t({ defaultMessage: 'Terms & Conditions' })}</Link></Text> :
                  <Text>{$t({ defaultMessage: 'I agree to the' })+' '}<Link onClick={showModal}>
                    {$t({ defaultMessage: 'Terms & Conditions' })}</Link></Text>}
              </Checkbox>
            </FormItem>
          </Form>
        </GridCol>
      </GridRow>
      <Modal
        visible={isModalOpen}
        closable={false}
        footer={<Button type='primary'
          onClick={handleClose}>
          {$t({ defaultMessage: 'Close' })}
        </Button>}>
        <span dangerouslySetInnerHTML={{ __html: data?.aupPlainText || '' }} />
      </Modal></>
    }
    {...rest}
  />
}
