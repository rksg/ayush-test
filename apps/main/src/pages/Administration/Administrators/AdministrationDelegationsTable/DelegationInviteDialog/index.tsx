import { useState } from 'react'

import { Form, Input, Modal, Typography } from 'antd'
import { FieldData }                      from 'rc-field-form/lib/interface'
import { useIntl }                        from 'react-intl'
import { useParams }                      from 'react-router-dom'

import { showActionModal }      from '@acx-ui/components'
import {
  useLazyFindVARDelegationQuery,
  useInviteDelegationMutation
} from '@acx-ui/rc/services'
import {
  emailRegExp,
  CommonErrorsResult,
  catchErrorDetails
} from '@acx-ui/rc/utils'

interface DelegationInviteDialogProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const DelegationInviteDialog = (props: DelegationInviteDialogProps) =>{
  const { visible, setVisible } = props
  const [isValid, setIsValid] = useState<boolean>(false)
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const [findVARDelegation, { isLoading: isFindLoading }] = useLazyFindVARDelegationQuery()

  const formContent = <Form
    form={form}
    layout='vertical'
    onFieldsChange={(changedFields: FieldData[]) => {
      const value = changedFields[0].value
      const hasErrors = form.getFieldsError().some(item => item.errors.length > 0)
      setIsValid(value && !hasErrors)
    }}
  >
    <Form.Item
      label={$t({ defaultMessage: 'Administrator Email' })}
      name='email'
      rules={[
        { validator: (_, value) => emailRegExp(value) }
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

  const [ inviteDelegation ] = useInviteDelegationMutation()

  const handleOk = async () => {
    const { email } = form.getFieldsValue()

    try {
      const data = await findVARDelegation({
        params,
        payload: { username: email }
      }, true).unwrap()

      // eslint-disable-next-line max-len
      const msg = $t({ defaultMessage: 'The following 3rd party administrator was found: {br} {name} {br} {streetAddress}, {city}, {stateOrProvince}' }, {
        br: <br/>,
        name: data.name,
        streetAddress: data.streetAddress,
        city: data.city,
        stateOrProvince: data.stateOrProvince
      })

      showActionModal({
        type: 'confirm',
        width: 450,
        title: $t({ defaultMessage: '3rd party administrator found' }),
        content: msg,
        okText: $t({ defaultMessage: 'Send Invitation' }),
        onOk: async () => {
          try {
            await inviteDelegation({
              params,
              payload: { username: email }
            }).unwrap()

            setVisible(false)
          } catch(error) {
            const respData = error as CommonErrorsResult<catchErrorDetails>
            const errors = respData.data.errors

            // invitation failed
            handleInvitaionFailed(errors)
          }
        }
      })
    } catch(error) {
      const respData = error as CommonErrorsResult<catchErrorDetails>
      const errors = respData.data.errors

      // find VAR delegation failed
      handleInvitaionFailed(errors)
    }
  }

  const handleInvitaionFailed = (error: catchErrorDetails[]) => {
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
        message = $t({ defaultMessage: 'An error occurred' })
      } else {
        message = $t({ defaultMessage: 'An error occurred: {error}' }, {
          error: errorMsgs[0]
        })
      }
    }

    showActionModal({
      type: 'error',
      title,
      content: message
    })
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  const disabledOkButton = !isValid || isFindLoading

  return (
    <Modal
      title={$t({ defaultMessage: 'Invite 3rd Party Administrator' })}
      width={500}
      visible={visible}
      okText={$t({ defaultMessage: 'Find' })}
      onCancel={handleCancel}
      onOk={handleOk}
      maskClosable={false}
      okButtonProps={{
        disabled: disabledOkButton
      }}
    >
      {formContent}
    </Modal>
  )
}

export default DelegationInviteDialog