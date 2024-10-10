import { useCallback, useEffect } from 'react'

import { FetchBaseQueryError }             from '@reduxjs/toolkit/query'
import { Divider, Form, FormProps, Input } from 'antd'
import _                                   from 'lodash'
import { useIntl }                         from 'react-intl'

import {
  Drawer,
  DrawerProps,
  showToast
} from '@acx-ui/components'

import { TransparentButton, Label, SecretInput, Row } from '../styledComponents'
import { handleError }                                from '../utils'

import { applicationTokenDtoKeys, useCreateApplicationTokenMutation, useRotateApplicationTokenMutation } from './services'

import type { ApplicationToken, ApplicationTokenDto } from './services'

export function ApplicationTokenForm (props: {
  applicationToken?: ApplicationToken | null
  onClose: () => void
}) {
  const [doCreate, createResponse] = useCreateApplicationTokenMutation()
  const [doRotate, rotateResponse] = useRotateApplicationTokenMutation()
  const applicationToken = props.applicationToken
  const { $t } = useIntl()
  const [form] = Form.useForm<ApplicationTokenDto>()

  const onClose = useCallback(() => {
    form.resetFields()
    props.onClose()
  }, [form, props.onClose])

  // reset form fields every time user choose to edit/create record
  useEffect(() => {
    form.resetFields()
  }, [form, props.applicationToken?.id, props.applicationToken?.clientSecret])

  useEffect(() => {
    if (createResponse.isSuccess) {
      onClose()
      showToast({
        type: 'success',
        content: $t({ defaultMessage: 'Application token was created' })
      })
    }

    if (createResponse.isError) {
      handleError(
        createResponse.error as FetchBaseQueryError,
        $t({ defaultMessage: 'Failed to create application token' })
      )
    }

    // reset mutation response everytime submission ended
    const isEnded = createResponse.isSuccess || createResponse.isError
    if (isEnded) createResponse.reset()
  }, [$t, onClose, createResponse, applicationToken?.id])

  useEffect(() => {
    if (rotateResponse.isSuccess) {
      showToast({
        type: 'success',
        content: $t({ defaultMessage: 'Application token secret was rotated' })
      })
    }

    if (rotateResponse.isError) {
      handleError(
        rotateResponse.error as FetchBaseQueryError,
        $t({ defaultMessage: 'Failed to rotate application token secret' })
      )
    }

    // reset mutation response everytime submission ended
    const isEnded = rotateResponse.isSuccess || rotateResponse.isError
    if (isEnded) rotateResponse.reset()
  }, [$t, rotateResponse, applicationToken?.clientSecret])

  const formProps: FormProps<ApplicationTokenDto> = {
    layout: 'vertical',
    form,
    initialValues: _.pick(applicationToken, applicationTokenDtoKeys) as Partial<ApplicationTokenDto>
  }

  const handleClickCopy = (copyString: string) => {
    navigator.clipboard.writeText(copyString)
  }

  const onSave = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      await doCreate(values).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onRotate = async () => {
    try {
      await doRotate(applicationToken!).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const drawerProps: DrawerProps = {
    destroyOnClose: true,
    visible: Boolean(props.applicationToken !== null),
    width: 450,
    title: applicationToken?.id
      ? $t({ defaultMessage: 'Edit Application Token' })
      : $t({ defaultMessage: 'Create Application Token' }),
    onClose: onClose,
    footer: !applicationToken?.id ? (
      <Drawer.FormFooter
        buttonLabel={{ save: $t({ defaultMessage: 'Create' }) }}
        onCancel={onClose}
        onSave={onSave}
      />
    ) : null
  }

  return <Drawer {...drawerProps}>
    <Form {...formProps}>
      <Form.Item
        validateFirst
        name='name'
        label={$t({ defaultMessage: 'Token Name' })}
        rules={[
          { required: true },
          { max: 255 },
          { whitespace: true }
        ]}
        children={
          applicationToken?.id ? <Label>{applicationToken.name}</Label> : <Input />
        }
      />
      { applicationToken?.id && (<>
        <Form.Item
          validateFirst
          name='clientId'
          label={$t({ defaultMessage: 'Client ID' })}
          rules={[{ required: true }]}
          children={
            <Label>{applicationToken?.clientId}</Label>
          }
        />
        <TransparentButton
          type='link'
          data-testid='copy-client-id'
          onClick={() => {
            handleClickCopy(form.getFieldValue('clientId'))
          }}>
          {$t({ defaultMessage: 'Copy' })}
        </TransparentButton>
        <Form.Item
          validateFirst
          name='clientSecret'
          style={{ marginTop: '13px' }}
          label={$t({ defaultMessage: 'Client Secret' })}
          rules={[{ required: true }]}
          children={
            <SecretInput
              bordered={false}
              value={applicationToken?.clientSecret}
            />
          }
        />
        <Row>
          <TransparentButton
            type='link'
            onClick={onRotate}>
            {$t({ defaultMessage: 'Rotate Secret' })}
          </TransparentButton>
          <Divider type='vertical'/>
          <TransparentButton
            type='link'
            data-testid='copy-client-secret'
            onClick={() => handleClickCopy(form.getFieldValue('clientSecret'))}>
            {$t({ defaultMessage: 'Copy' })}
          </TransparentButton>
        </Row>
      </>)}
    </Form>
  </Drawer>
}