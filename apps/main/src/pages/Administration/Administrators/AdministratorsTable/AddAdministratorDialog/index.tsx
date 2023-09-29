import { useEffect, useState } from 'react'

import {
  Form,
  Space,
  Input
} from 'antd'
import { useIntl } from 'react-intl'

import { Modal, showActionModal, Tooltip } from '@acx-ui/components'
import {
  useAddAdminMutation,
  useGetTenantAuthenticationsQuery
} from '@acx-ui/rc/services'
import {
  CommonErrorsResult,
  CatchErrorDetails,
  emailRegExp,
  TenantAuthenticationType,
  TenantAuthentications
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import AuthenticationSelector, { AuthTypeRadioButtonEnum } from './AuthenticationSelector'
import MspCustomerSelector, { ECCustomerRadioButtonEnum }  from './MspCustomersSelector'
import RoleSelector                                        from './RoleSelector'


interface AddAdministratorDialogProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  isMspEc: boolean;
  isOnboardedMsp: boolean;
  currentUserDetailLevel?: string;
}

interface AddAdministratorDataModel {
  detailLevel: string;
  role: string;
  email: string;
  externalId?: string;
  delegateToAllECs?: boolean;
  delegatedECs?: string[];
  authenticationId?: string;
  firstName?: string;
  lastName?: string;
}

const AddAdministratorDialog = (props: AddAdministratorDialogProps) => {
  const {
    visible,
    setVisible,
    isMspEc,
    isOnboardedMsp,
    currentUserDetailLevel
  } = props
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const [addAdmin, { isLoading: isAddAdminUpdating }] = useAddAdminMutation()
  const [isSsoConfigured, setSsoConfigured] = useState(false)
  const [selectedAuth, setSelectedAuth] = useState('')
  const [authenticationData, setAuthenticationData] = useState<TenantAuthentications>()

  const tenantAuthenticationData =
    useGetTenantAuthenticationsQuery({ params })

  const handleSubmitFailed = (error: CommonErrorsResult<CatchErrorDetails>) => {
    const errData = error.data.errors
    let title = $t({ defaultMessage: 'Admin could not be added' })
    let message
    const adminInvitedError = errData.find(e => e.code === 'TNT-10300')
    const adminExistingError = errData.find(e => e.code === 'TNT-10000' || e.code === 'TNT-10303')

    if (adminInvitedError) {
      // eslint-disable-next-line max-len
      message = $t({ defaultMessage: 'The email address belongs to a user of another RUCKUS One tenant. You may add this user as a 3rd party administrator.' })

      if (isMspEc) {
        // eslint-disable-next-line max-len
        message = $t({ defaultMessage: 'The email address belongs to a user of another Cloud Portal account.' })
      }
    } else if (adminExistingError) {
      // eslint-disable-next-line max-len
      message = $t({ defaultMessage: 'The email address belongs to an administrator that already exists.' })
    } else {
      const status = error.status
      title = $t({ defaultMessage: 'Server Error' })
      // eslint-disable-next-line max-len
      message = $t({ defaultMessage: 'Error has occurred. Backend returned code {status}' }, { status })
    }

    showActionModal({
      type: 'error',
      title: title,
      content: message
    })
  }

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue(true)

    try {
      const payload = {
        detailLevel: currentUserDetailLevel,
        role: formValues.role
      } as AddAdministratorDataModel

      if (isOnboardedMsp) {
        if (formValues.ecType === ECCustomerRadioButtonEnum.all) {
          payload.delegateToAllECs = true
        } else if (formValues.ecType === ECCustomerRadioButtonEnum.none) {
          payload.delegateToAllECs = false
        } else {
          payload.delegateToAllECs = false
          payload.delegatedECs = formValues.delegatedEcs
        }
      }

      payload.email = formValues.newEmail
      if (formValues.authType === AuthTypeRadioButtonEnum.sso && authenticationData?.id) {
        payload.authenticationId = authenticationData.id
        payload.lastName = formValues.lastName ?? ''
        payload.firstName = formValues.firstName ?? ''
      }

      await addAdmin({ params, payload }).unwrap()
      handleCancel()
    } catch(error) {
      const respData = error as CommonErrorsResult<CatchErrorDetails>
      handleSubmitFailed(respData)
    }
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  useEffect(() => {
    if (tenantAuthenticationData) {
      const ssoData = tenantAuthenticationData.data?.filter(n =>
        n.authenticationType === TenantAuthenticationType.saml)
      if (ssoData?.length && ssoData?.length > 0) {
        setSsoConfigured(true)
        setAuthenticationData(ssoData[0])
      }
    }
  }, [form, tenantAuthenticationData])

  return (
    <Modal
      visible={visible}
      title={$t({ defaultMessage: 'Add New Administrator' })}
      okText={$t({ defaultMessage: 'Send Invitation' })}
      maskClosable={false}
      keyboard={false}
      width={500}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okButtonProps={{ disabled: isAddAdminUpdating }}
      cancelButtonProps={{ disabled: isAddAdminUpdating }}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
      >
        <Space direction='vertical' style={{ width: '100%' }} >
          <AuthenticationSelector
            ssoConfigured={isSsoConfigured}
            setSelected={setSelectedAuth}
          />
          {selectedAuth === AuthTypeRadioButtonEnum.sso &&
          <div>
            <Form.Item
              name='firstName'
              label={$t({ defaultMessage: 'First Name' })}
              initialValue=''
              rules={[
                { message: $t({ defaultMessage: 'Please enter first name' }) },
                { min: 2 },
                { max: 64 }
              ]} >
              <Input
                placeholder={$t({ defaultMessage: 'Enter first name' })}
              />
            </Form.Item>
            <Form.Item
              name='lastName'
              label={$t({ defaultMessage: 'Family Name' })}
              initialValue=''
              rules={[
                { message: $t({ defaultMessage: 'Please enter family name' }) },
                { min: 2 },
                { max: 64 }
              ]} >
              <Input
                placeholder={$t({ defaultMessage: 'Enter family name' })}
              />
            </Form.Item>
          </div>}

          <Form.Item
            name='newEmail'
            initialValue=''
            label={<>
              {$t({ defaultMessage: 'Invite new user' })}
              <Tooltip.Question
                // eslint-disable-next-line max-len
                title={$t({ defaultMessage: 'Email invitation will be sent to this Email address for registration.\n Once registered with this email, the invited user will become an administrator.' })}
                placement='right'
              />
            </>}
            rules={[
              {
                required: true,
                message: $t({ defaultMessage: 'Please enter email' })
              },
              { validator: (_, value) => emailRegExp(value) }
            ]}>
            <Input
              placeholder={$t({ defaultMessage: 'Enter email address' })}
            />
          </Form.Item>

          <RoleSelector />

          {
            isOnboardedMsp === true && (
              <MspCustomerSelector />
            )
          }
        </Space>
      </Form>
    </Modal>
  )
}


export default AddAdministratorDialog
