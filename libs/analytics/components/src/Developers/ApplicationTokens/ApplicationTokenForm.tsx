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

import { handleError }                                from '../services'
import { TransparentButton, Label, SecretInput, Row } from '../styledComponents'

import { applicationTokenDtoKeys, useCreateApplicationTokenMutation, useUpdateApplicationTokenMutation } from './services'

import type { ApplicationToken, ApplicationTokenDto } from './services'

function useApplicationTokenMutation (
  applicationToken?: ApplicationToken | null
) {
  const [doCreate, createResponse] = useCreateApplicationTokenMutation()
  const [doUpdate, updateResponse] = useUpdateApplicationTokenMutation()

  return applicationToken
    ? { submit: doUpdate, response: updateResponse }
    : { submit: doCreate, response: createResponse }
}

const generateHexKey = (keyLength: number):string => {
  let hexKey = ''
  const crypto = window.crypto
  const array = new Uint32Array(1)
  while (hexKey.length < keyLength) {
    hexKey += crypto.getRandomValues(array)[0].toString(16).substring(2)
  }
  return hexKey.slice(0, keyLength)
}

export function ApplicationTokenForm (props: {
  applicationToken?: ApplicationToken | null
  onClose: () => void
}) {
  const { submit, response } = useApplicationTokenMutation(props.applicationToken)
  const applicationToken = props.applicationToken
  const { $t } = useIntl()
  const [form] = Form.useForm<ApplicationTokenDto>()

  const onClose = useCallback(() => {
    form.resetFields()
    props.onClose()
  }, [form, props.onClose])

  // reset form fields every time user choose to edit/create record
  useEffect(() => { form.resetFields() }, [form, props.applicationToken?.id])

  useEffect(() => {
    if (response.isSuccess) {
      onClose()
      showToast({
        type: 'success',
        content: applicationToken?.id
          ? $t({ defaultMessage: 'Application Token was updated' })
          : $t({ defaultMessage: 'Application token was created' })
      })
    }

    if (response.isError) {
      handleError(
        response.error as FetchBaseQueryError,
        applicationToken?.id
          ? $t({ defaultMessage: 'Failed to update application token' })
          : $t({ defaultMessage: 'Failed to create application token' })
      )
    }

    // reset mutation response everytime submission ended
    const isEnded = response.isSuccess || response.isError
    if (isEnded) response.reset()
  }, [$t, onClose, response, applicationToken?.id])

  const formProps: FormProps<ApplicationTokenDto> = {
    layout: 'vertical',
    form,
    initialValues: _.pick(applicationToken, applicationTokenDtoKeys) as Partial<ApplicationTokenDto>
  }

  const handleClickCopy = (copyString: string) => {
    navigator.clipboard.writeText(copyString)
  }

  const initClientId = applicationToken?.clientId || generateHexKey(32)
  const initClientSecret = applicationToken?.clientSecret || generateHexKey(32)

  const onSave = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      await submit(values).unwrap()
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
    footer: <Drawer.FormFooter
      buttonLabel={{ save: applicationToken?.id
        ? $t({ defaultMessage: 'Save' })
        : $t({ defaultMessage: 'Create' })
      }}
      onCancel={onClose}
      onSave={onSave}
    />
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
        children={<Input />}
      />
      { applicationToken?.id && (<>
        <Form.Item
          validateFirst
          name='clientId'
          label={$t({ defaultMessage: 'Client ID' })}
          rules={[{ required: true }]}
          children={
            <Label>{initClientId}</Label>
          }
        />
        <TransparentButton
          type='link'
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
              value={initClientSecret}
            />
          }
        />
        <Row>
          <TransparentButton
            type='link'
            onClick={() => {}}>
            {$t({ defaultMessage: 'Rotate Secret' })}
          </TransparentButton>
          <Divider type='vertical'/>
          <TransparentButton
            type='link'
            onClick={() => {
              handleClickCopy(form.getFieldValue('clientSecret'))
            }}>
            {$t({ defaultMessage: 'Copy' })}
          </TransparentButton>
        </Row>
      </>)}
    </Form>
  </Drawer>
}