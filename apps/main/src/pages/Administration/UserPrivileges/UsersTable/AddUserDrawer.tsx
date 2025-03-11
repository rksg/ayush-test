import { useEffect, useState } from 'react'

import {
  Form,
  Input
} from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Select, showActionModal, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { PhoneInput }                               from '@acx-ui/rc/components'
import {
  useAddAdminMutation,
  useGetTenantAuthenticationsQuery
} from '@acx-ui/rc/services'
import {
  CommonErrorsResult,
  sfdcEmailRegExp,
  TenantAuthenticationType,
  TenantAuthentications,
  getRoles,
  PrivilegeGroup,
  CustomGroupType,
  generalPhoneRegExp
} from '@acx-ui/rc/utils'
import { useParams }         from '@acx-ui/react-router-dom'
import { CatchErrorDetails } from '@acx-ui/utils'

import AuthenticationSelector, { AuthTypeRadioButtonEnum } from '../../Administrators/AdministratorsTable/AddAdministratorDialog/AuthenticationSelector'
import MspCustomerSelector, { ECCustomerRadioButtonEnum }  from '../../Administrators/AdministratorsTable/AddAdministratorDialog/MspCustomersSelector'
import PrivilegeGroupSelector                              from '../PrivilegeGroups/PrivilegeGroupSelector'

interface AddUserDrawerProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  isMspEc: boolean;
  isOnboardedMsp: boolean;
  currentUserDetailLevel?: string;
}

interface AddUserDataModel {
  detailLevel: string;
  role: string;
  email: string;
  externalId?: string;
  delegateToAllECs?: boolean;
  delegatedECs?: string[];
  authenticationId?: string;
  name?: string;
  lastName?: string;
  phoneNumber?: string;
}

const AddUserDrawer = (props: AddUserDrawerProps) => {
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
  const [addAdmin] = useAddAdminMutation()
  const [isSsoConfigured, setSsoConfigured] = useState(false)
  const [selectedAuth, setSelectedAuth] = useState('')
  const [authenticationData, setAuthenticationData] = useState<TenantAuthentications>()
  const [isSystemRoleSelected, setSelectedRole] = useState<Boolean>()

  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE)
  const notificationAdminContextualEnabled =
    useIsSplitOn(Features.NOTIFICATION_ADMIN_CONTEXTUAL_TOGGLE)

  const tenantAuthenticationData =
    useGetTenantAuthenticationsQuery({ params })

  const handleSubmitFailed = (error: CommonErrorsResult<CatchErrorDetails>) => {
    const errData = error.data.errors
    let title = $t({ defaultMessage: 'Admin could not be added' })
    let message
    const adminInvitedError = errData.find(e => e.code === 'TNT-10300')
    const adminExistingError = errData.find(e => e.code === 'TNT-10000' || e.code === 'TNT-10303')

    if (adminInvitedError) {
      message = isMspEc
      // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'The email address belongs to a user of another Cloud Portal account.' })
      // eslint-disable-next-line max-len
        : $t({ defaultMessage: 'The email address belongs to a user of another RUCKUS One tenant. You may add this user as a 3rd party administrator.' })
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

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue(true)

    try {
      const payload = {
        detailLevel: currentUserDetailLevel,
        role: formValues.role
      } as AddUserDataModel

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
      payload.phoneNumber =
        notificationAdminContextualEnabled ? formValues.mobile?.trim() : undefined
      if (formValues.authType === AuthTypeRadioButtonEnum.sso && authenticationData?.id) {
        payload.authenticationId = authenticationData.id
        payload.lastName = formValues.lastName ?? ''
        payload.name = formValues.firstName ?? ''
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

  const selectedPrivilegeGroup = (selected: PrivilegeGroup) => {
    setSelectedRole(selected.type === CustomGroupType.SYSTEM)
  }

  const setPhoneValue = (phoneNumber: string) => {
    form.setFieldValue('mobile', phoneNumber)
    form.validateFields(['mobile'])
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

  const rolesList = getRoles().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add New User' })}
      visible={visible}
      keyboard={false}
      onClose={onClose}
      width={500}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Add User' })
          }}
          onCancel={handleCancel}
          onSave={async () => form.submit()}
        />
      }
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
      >
        {isSsoConfigured && <AuthenticationSelector
          ssoConfigured={isSsoConfigured}
          setSelected={setSelectedAuth}
        />}

        <Form.Item
          name='newEmail'
          initialValue=''
          label={<>
            {$t({ defaultMessage: 'Email' })}
            <Tooltip.Question
              // eslint-disable-next-line max-len
              title={$t({ defaultMessage: 'Email invitation will be sent to this Email address for registration.\n Once registered with this email, the invited user will become an administrator.' })}
              placement='right'
            />
          </>}
          rules={[
            { required: true,
              message: $t({ defaultMessage: 'Please enter email' })
            },
            { max: 255 },
            { validator: (_, value) => sfdcEmailRegExp(value) }
          ]}>
          <Input
            placeholder={$t({ defaultMessage: 'Enter email address' })}
          />
        </Form.Item>

        {selectedAuth === AuthTypeRadioButtonEnum.sso && isSsoConfigured &&
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

        {notificationAdminContextualEnabled && <Form.Item
          label={$t({ defaultMessage: 'Phone' })}
          name='mobile'
          rules={[
            { validator: (_, value) => generalPhoneRegExp(value) }
          ]}
          initialValue=''
          validateFirst >
          <PhoneInput name={'mobile'} callback={setPhoneValue} onTop={true} />
        </Form.Item>}

        {isAbacToggleEnabled
          ? <PrivilegeGroupSelector
            setSelected={selectedPrivilegeGroup}
          />
          : <Form.Item
            name='role'
            style={{ marginTop: '13px' }}
            label={$t({ defaultMessage: 'Role' })}
            rules={[
              { required: true }
            ]}
          >
            <Select
              options={rolesList}
              placeholder={$t({ defaultMessage: 'Select...' })}
            />
          </Form.Item> }

        { (isOnboardedMsp === true && isSystemRoleSelected === true)
          && <MspCustomerSelector /> }
      </Form>
    </Drawer>
  )
}

export default AddUserDrawer
