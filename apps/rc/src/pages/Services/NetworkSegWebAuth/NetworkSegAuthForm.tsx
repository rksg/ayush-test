import React, { useEffect, useRef } from 'react'

import {
  Form,
  Input,
  Space
} from 'antd'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  StepsForm,
  StepsFormInstance,
  Subtitle
} from '@acx-ui/components'
import {
  useCreateWebAuthTemplateMutation,
  useGetWebAuthTemplateQuery,
  useUpdateWebAuthTemplateMutation
} from '@acx-ui/rc/services'
import {
  getServiceListRoutePath,
  LocationExtended,
  redirectPreviousPage,
  WebAuthTemplate
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export const defaultTemplateData = {
  webAuthPasswordLabel: defineMessage({ defaultMessage: 'DPSK Password' }),
  webAuthCustomTitle: defineMessage({
    defaultMessage: 'Enter your Password below and press the button' }),
  webAuthCustomTop: defineMessage({
    defaultMessage: 'Welcome to Ruckus Networks Web Authentication Homepage' }),
  webAuthCustomLoginButton: defineMessage({ defaultMessage: 'Login' }),
  webAuthCustomBottom: defineMessage({
    defaultMessage: `This network is restricted to authorized users only.
    Violators may be subjected to legal prosecution.
    Acitvity on this network is monitored and may be used as evidence in a court of law.
    Copyright 2022 Ruckus Networks` })
}

export default function NetworkSegAuthForm ({ editMode = false }: { editMode?: boolean } ) {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const linkToServices = useTenantLink(getServiceListRoutePath(true))

  const [createWebAuthTemplate] = useCreateWebAuthTemplateMutation()
  const [updateWebAuthTemplate] = useUpdateWebAuthTemplateMutation()
  const { data } = useGetWebAuthTemplateQuery({ params }, { skip: !editMode })

  const formRef = useRef<StepsFormInstance<WebAuthTemplate>>()

  const previousPath = (location as LocationExtended)?.state?.from?.pathname

  useEffect(() => {
    formRef.current?.resetFields()
    if (data && editMode) {
      formRef.current?.setFieldsValue(data)
    }
  }, [data, editMode])

  const saveData = async (data: WebAuthTemplate) => {
    try {
      if (editMode) {
        await updateWebAuthTemplate({ params, payload: data }).unwrap()
      } else {
        await createWebAuthTemplate({ params, payload: _.omit(data, 'id') }).unwrap()
      }

      redirectPreviousPage(navigate, previousPath, linkToServices)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const WebAuthFormItem = ({ name, label }:
    { name: keyof typeof defaultTemplateData, label: string }
  ) => {
    return (
      <UI.TextAreaWithReset label={label}>
        <Space size='middle'>
          <Form.Item name={name} children={<Input.TextArea autoSize />} />
          <Button type='link'
            onClick={()=>{
              formRef?.current?.setFieldValue(name, $t(defaultTemplateData[name]))
            }}>
            {$t({ defaultMessage: 'Reset to default' })}
          </Button>
        </Space>
      </UI.TextAreaWithReset>)
  }

  return (
    <>
      <PageHeader
        title={editMode ?
          $t({ defaultMessage: 'Edit Network Segmentation Auth page for Switch' }) :
          $t({ defaultMessage: 'Add Network Segmentation Auth page for Switch' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: getServiceListRoutePath(true) }
        ]}
      />
      <StepsForm<WebAuthTemplate>
        formRef={formRef}
        editMode={editMode}
        onCancel={() => redirectPreviousPage(navigate, previousPath, linkToServices)}
        onFinish={saveData}
      >
        <StepsForm.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
          layout='vertical' >
          <StepsForm.Title>
            {$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
          <Form.Item name='name'
            label={$t({ defaultMessage: 'Name' })}
            rules={[{ required: true }]} >
            <Input style={{ width: '360px' }}/>
          </Form.Item>
          <Form.Item name='id' hidden><Input type='hidden' /></Form.Item>
          {/* <Form.Item name='tag' // TODO: Waiting for TAG feature support
            label={$t({ defaultMessage: 'Tags' })} >
            <Select mode='tags' size='middle' allowClear style={{ width: '360px' }}/>
          </Form.Item> */}
          <Subtitle level={4}>
            {$t({ defaultMessage: 'Auth Page Details' })}</Subtitle>
          <WebAuthFormItem name='webAuthCustomTop'
            label={$t({ defaultMessage: 'Header' })} />
          <WebAuthFormItem name='webAuthCustomTitle'
            label={$t({ defaultMessage: 'Title' })} />
          <WebAuthFormItem name='webAuthPasswordLabel'
            label={$t({ defaultMessage: 'Password Label' })} />
          <WebAuthFormItem name='webAuthCustomLoginButton'
            label={$t({ defaultMessage: 'Button Text' })} />
          <WebAuthFormItem name='webAuthCustomBottom'
            label={$t({ defaultMessage: 'Footer' })} />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
