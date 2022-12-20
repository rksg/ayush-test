import React, { useEffect, useRef } from 'react'

import {
  Form,
  Input,
  Select
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader,
  showToast,
  StepsForm,
  StepsFormInstance,
  Subtitle
} from '@acx-ui/components'
import {
  useGetWebAuthTemplateQuery,
  useCreateWebAuthTemplateMutation,
  useUpdateWebAuthTemplateMutation
} from '@acx-ui/rc/services'
import {
  getServiceListRoutePath,
  WebAuthTemplate
} from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export const defaultTemplateData = {
  webAuthPasswordLabel: 'DPSK Password',
  webAuthCustomTitle: 'Enter your Password below and press the button',
  webAuthCustomTop: 'Welcome to Ruckus Networks Web Authentication Homepage',
  webAuthCustomLoginButton: 'Login',
  webAuthCustomBottom: `This network is restricted to authorized users only.
    Violators may be subjected to legal prosecution.
    Acitvity on this network is monitored and may be used as evidence in a court of law.
    Copyright 2022 Ruckus Networks`
}

export default function NetworkSegAuthForm (props: { editMode?: boolean }) {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const linkToServices = useTenantLink(getServiceListRoutePath(true))

  const editMode = props.editMode === true

  const [createWebAuthTemplate] = useCreateWebAuthTemplateMutation()
  const [updateWebAuthTemplate] = useUpdateWebAuthTemplateMutation()
  const { data: editData } = useGetWebAuthTemplateQuery({ params }, { skip: !editMode })


  const formRef = useRef<StepsFormInstance<WebAuthTemplate>>()

  useEffect(() => {
    if (editData && editMode) {
      formRef.current?.setFieldsValue(editData)
    }
  }, [editData, editMode])

  const saveData = async (saveData: WebAuthTemplate) => {
    // const saveData = transferFormFieldsToSaveData(data)

    try {
      if (editMode) {
        await updateWebAuthTemplate({ params, payload: saveData }).unwrap()
      } else {
        await createWebAuthTemplate({ params, payload: _.omit(saveData, 'id') }).unwrap()
      }

      navigate(linkToServices, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const WebAuthFormItem = ({ name, label }:
    { name: keyof typeof defaultTemplateData, label: string }
  ) => {
    return (
      <UI.TextAreaWithReset>
        <Form.Item label={' '} style={{ float: 'right' }} >
          <Button type='link'
            onClick={()=>{
              formRef?.current?.setFieldValue(name, defaultTemplateData[name])
            }}>
            {$t({ defaultMessage: 'Reset to default' })}
          </Button>
        </Form.Item>
        <Form.Item name={name} label={label} >
          <Input.TextArea autoSize />
        </Form.Item>
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
        onCancel={() => navigate(linkToServices)}
        onFinish={saveData}
      >
        <StepsForm.StepForm
          name='settings'
          title={$t({ defaultMessage: 'Settings' })}
          layout='vertical'
          initialValues={editData}
          wrapperCol={{ span: 14 }} >
          <StepsForm.Title>
            {$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
          <Form.Item name='name'
            label={$t({ defaultMessage: 'Name' })}
            wrapperCol={{ span: 8 }}
            rules={[{ required: true }]} >
            <Input />
          </Form.Item>
          <Form.Item name='id' hidden />
          <Form.Item name='tag'
            label={$t({ defaultMessage: 'Tags' })}
            wrapperCol={{ span: 8 }} >
            <Select mode='tags' size='middle' allowClear />
          </Form.Item>
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
