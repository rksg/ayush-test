import { useState } from 'react'

import { Form, Input, Typography } from 'antd'
import { FieldData }               from 'rc-field-form/lib/interface'
import { useIntl }                 from 'react-intl'
import { useParams }               from 'react-router-dom'

import { Button, Drawer, showActionModal } from '@acx-ui/components'
import {
  useLazyFindVARDelegationQuery,
  useInviteDelegationMutation
} from '@acx-ui/rc/services'
import {
  sfdcEmailRegExp,
  CommonErrorsResult
} from '@acx-ui/rc/utils'
import { CatchErrorDetails } from '@acx-ui/utils'

interface DelegationInviteDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const DelegationInviteDrawer = (props: DelegationInviteDrawerProps) =>{
  const { visible, setVisible } = props
  const [isValid, setIsValid] = useState<boolean>(false)
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const [findVARDelegation, { isLoading: isFindLoading }] = useLazyFindVARDelegationQuery()
  const [ inviteDelegation ] = useInviteDelegationMutation()

  const handleOk = async () => {
    const { email } = form.getFieldsValue()

    try {
      await findVARDelegation({
        params,
        payload: { username: email }
      }, true).unwrap()
      handleCancel()
      sendInvitation(email)
    } catch(error) {
      const respData = error as CommonErrorsResult<CatchErrorDetails>
      const errors = respData.data.errors

      // find VAR delegation failed
      handleCancel()
      handleInvitaionFailed(errors)
    }
  }

  const sendInvitation = async (email: string) => {
    try {
      await inviteDelegation({
        params,
        payload: { username: email }
      }).unwrap()

      handleCancel()
    } catch(error) {
      const respData = error as CommonErrorsResult<CatchErrorDetails>
      const errors = respData.data.errors

      // invitation failed
      handleInvitaionFailed(errors)
    }
  }

  const handleInvitaionFailed = (error: CatchErrorDetails[]) => {
    const errorMsgs = error.map(e => e.message)

    const mailNotValidErr = error.find(e => e.code === 'TNT-10301')
    const cannotInviteSupportErr = error.find(e => e.code === 'TNT-10304')
    const notValidEmailFormatErr = error.find(e => e.code === 'TNT-10306')

    const title = cannotInviteSupportErr ?
      $t({ defaultMessage: 'An error occurred' }) : $t({ defaultMessage: 'Invitation Failed' })
    let message
    if (mailNotValidErr) {
      // eslint-disable-next-line max-len
      message = $t({ defaultMessage: 'The specified email address is not linked to any 3rd party administrator. Try using a different email address.' })
    } else if (cannotInviteSupportErr) {
      message = $t({ defaultMessage: 'You cannot invite support user as a VAR' })
    } else if (notValidEmailFormatErr) {
      message = $t({ defaultMessage: 'Non valid email format' })
    } else {
      if (errorMsgs.length > 0) {
        message = $t({ defaultMessage: 'An error occurred: {error}' }, {
          error: errorMsgs[0]
        })
      } else {
        message = $t({ defaultMessage: 'An error occurred' })
      }
    }

    showActionModal({
      type: 'error',
      title,
      content: message
    })
  }

  const handleFieldsChange = (changedFields: FieldData[]) => {
    const value = changedFields[0].value
    const hasErrors = form.getFieldsError().some(item => item.errors.length > 0)
    setIsValid(value && !hasErrors)
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  const disabledOkButton = !isValid || isFindLoading

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add 3rd Party Administrator' })}
      visible={visible}
      onClose={handleCancel}
      width='380px'
      destroyOnClose={true}
      footer={
        <div>
          <Button
            disabled={disabledOkButton}
            onClick={handleOk}
            type='primary'
          >
            {$t({ defaultMessage: 'Add Administrator' })}
          </Button>
          <Button onClick={handleCancel}>
            {$t({ defaultMessage: 'Cancel' })}
          </Button>
        </div>
      }
    >

      <Form
        form={form}
        layout='vertical'
        onFieldsChange={handleFieldsChange}
      >
        <Form.Item
          label={$t({ defaultMessage: 'Email' })}
          name='email'
          rules={[
            { required: true },
            { validator: (_, value) => sfdcEmailRegExp(value) }
          ]}
        >
          <Input placeholder={$t({ defaultMessage: 'Enter email address' })} />
        </Form.Item>

        <Typography.Paragraph className='greyText'>
          {

            // eslint-disable-next-line max-len
            $t({ defaultMessage: 'An invitation will be sent to the entered email address. Once accepted, any person that has access to the email will gain administration rights to your system.' })
          }
        </Typography.Paragraph>
      </Form>
    </Drawer>
  )
}

export default DelegationInviteDrawer
