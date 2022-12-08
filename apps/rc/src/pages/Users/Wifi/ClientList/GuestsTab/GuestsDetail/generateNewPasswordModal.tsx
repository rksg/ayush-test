import { useState } from 'react'

import { Checkbox, Form, Tooltip, Typography } from 'antd'

import { cssStr, Modal, showToast }         from '@acx-ui/components'
import { useGenerateGuestPasswordMutation } from '@acx-ui/rc/services'
import { Guest }                            from '@acx-ui/rc/utils'
import { getIntl }                          from '@acx-ui/utils'

import {
  CheckboxLabel,
  EnvelopClosedOutlinedIcon,
  MobilePhoneOutlinedIcon,
  PrinterOutlinedIcon
} from '../styledComponents'


export function GenerateNewPasswordModal (props: {
  generateModalVisible: boolean,
  setGenerateModalVisible: (visible: boolean) => void,
  guestDetail: Guest,
  tenantId: string | undefined }) {

  const closeModal = () => {
    form.setFieldValue('outputInterface', [])
    props.setGenerateModalVisible(false)
    setButtonDisabled(true)
  }

  const [generateGuestPassword] = useGenerateGuestPasswordMutation()

  const saveModal = (async () => {
    try {
      const payload = form.getFieldValue('outputInterface')
      const params = {
        tenantId: props.tenantId,
        guestId: props.guestDetail.id
      }
      await generateGuestPassword({ params, payload }).unwrap().then(
        closeModal
      )
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  })

  const { $t } = getIntl()
  const [form] = Form.useForm()
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const hasEmailAddress = Boolean(props.guestDetail.emailAddress)
  const hasMobilePhoneNumber = Boolean(props.guestDetail.mobilePhoneNumber)
  return (<Modal
    title={$t({ defaultMessage: 'Generate New Password' })}
    visible={props.generateModalVisible}
    okButtonProps={{ disabled: buttonDisabled }}
    okText={$t({ defaultMessage: 'Generate' })}
    destroyOnClose={true}
    onCancel={closeModal}
    onOk={saveModal}
  >
    <Typography.Text style={{
      display: 'block', marginBottom: '20px',
      color: cssStr('--acx-neutrals-60')
    }}>
      {$t({ defaultMessage: 'How would you like to give the new password to the guest:' })}
    </Typography.Text>
    <Form
      form={form}
      onFieldsChange={() =>
        setButtonDisabled(
          form.getFieldsError().some((field) => field.errors.length > 0)
        )
      }>
      <Form.Item
        name='outputInterface'
        rules={[{
          required: true
        }]}
        children={
          <Checkbox.Group style={{ display: 'grid', rowGap: '20px', marginBottom: '20px' }}>

            <Tooltip
              title={hasEmailAddress ? '' :
                $t({ defaultMessage: 'No phone number defined for this guest' })}
              mouseLeaveDelay={0}>
              <Checkbox value='SMS'
                style={{ alignItems: 'start' }}
                disabled={!hasMobilePhoneNumber}
              >
                <MobilePhoneOutlinedIcon />
                <CheckboxLabel>{$t({ defaultMessage: 'Send to Phone' })}</CheckboxLabel>
              </Checkbox>
            </Tooltip>

            <Tooltip
              title={hasEmailAddress ? '' :
                $t({ defaultMessage: 'No Email address defined for this guest' })}
              mouseLeaveDelay={0}>
              <Checkbox
                value='MAIL'
                style={{ marginLeft: '0px', alignItems: 'start' }}
                disabled={!hasEmailAddress}
              >
                <EnvelopClosedOutlinedIcon />
                <CheckboxLabel>{$t({ defaultMessage: 'Send to Email' })}</CheckboxLabel>
              </Checkbox>
            </Tooltip>

            <Checkbox
              value='PRINT'
              style={{ marginLeft: '0px', alignItems: 'start' }}
              disabled={true} //Wait for merge code from add guest
            >
              <PrinterOutlinedIcon />
              <CheckboxLabel>{$t({ defaultMessage: 'Print Guest pass' })}</CheckboxLabel>
            </Checkbox>

          </Checkbox.Group>
        } />
    </Form>

  </Modal>)
}
