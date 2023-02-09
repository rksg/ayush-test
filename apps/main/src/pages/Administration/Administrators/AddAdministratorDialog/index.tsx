import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import {
  // SelectProps,
  // ModalProps as AntdModalProps,
  Form,
  Radio,
  Row,
  Col,
  Space,
  // Spin
  Select,
  Input
} from 'antd'
import { useIntl, defineMessage } from 'react-intl'

import { Modal, showActionModal, showToast } from '@acx-ui/components'
import {
  useAddAdminMutation,
  useUpdateAdminMutation,
  useGetRegisteredUsersListQuery,
  useGetMspEcAdminQuery,
  getRoles,
  useUpdateMspEcAdminMutation
} from '@acx-ui/rc/services'
import {
  Administrator,
  CommonErrorsResult,
  catchErrorDetails,
  emailRegExp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

enum ECCustomerRadioButtonEnum {
  none = 'none',
  all = 'all',
  specific = 'specific'
}

export const GetEcTypeString = (type: ECCustomerRadioButtonEnum) => {
  switch (type) {
    case ECCustomerRadioButtonEnum.none:
      return defineMessage({ defaultMessage: 'None' })
    case ECCustomerRadioButtonEnum.all:
      return defineMessage({ defaultMessage: 'All Customers' })
    case ECCustomerRadioButtonEnum.specific:
      return defineMessage({ defaultMessage: 'Specific Customers' })
    default:
      return defineMessage({ defaultMessage: 'Known' })
  }
}

export const getEcTypes = () => {
  return [
    {
      label: GetEcTypeString(ECCustomerRadioButtonEnum.none),
      value: ECCustomerRadioButtonEnum.none
    },
    {
      label: GetEcTypeString(ECCustomerRadioButtonEnum.all),
      value: ECCustomerRadioButtonEnum.all
    },
    {
      label: GetEcTypeString(ECCustomerRadioButtonEnum.specific),
      value: ECCustomerRadioButtonEnum.specific
    }]
}

interface AddAdministratorDialogProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  editMode: boolean;
  editData: Administrator;
  editNameOnly: boolean;
  isMspEc: boolean;
  isOnboardedMsp: boolean;
}

interface AddAdministratorDataModel {
  detailLevel: string;
  role: string;
  email: string;
  externalId?: string;
  delegateToAllECs?: boolean;
  delegatedECs?: boolean;
}



const AddAdministratorDialog = (props: AddAdministratorDialogProps) => {
  const {
    visible,
    setVisible,
    editMode,
    editData,
    editNameOnly,
    isMspEc,
    isOnboardedMsp
  } = props
  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const ecType = Form.useWatch('ecType', form)

  const {
    data: registerUsersList,
    isLoading: isRegisterUsersListLoading
  } = useGetRegisteredUsersListQuery({ params }, { skip: editMode })
  const registerUsersSelectOpts = registerUsersList ? registerUsersList.map((item) => ({
    label: item.email,
    value: {
      externalId: item.externalId,
      email: item.email
    }
  })): []
  const rolesList = getRoles().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))
  const ecTypesList = getEcTypes().map((item) => ({
    label: $t(item.label),
    value: item.value
  }))

  const [addAdmin, { isLoading: isAddAdminUpdating }] = useAddAdminMutation()
  const [updateAdmin, { isLoading: isUpdateAdminUpdating }] = useUpdateAdminMutation()
  const [updateMspEcAdmin, { isLoading: isUpdateMSPAdminUpdating }] = useUpdateMspEcAdminMutation()

  const { data: mspEcAdmin, isLoading: isLoadingMspEcAdmin } = useGetMspEcAdminQuery({
    mspEcTenantId: params.tenantId,
    mspEcAdminId: editData.id
  }, { skip: isMspEc === false })

  const handleSubmitFailed = (error: CommonErrorsResult<catchErrorDetails>) => {
    const errData = error.data.errors
    let title = $t({ defaultMessage: 'Admin could not be added' })
    let message
    const adminInvitedError = errData.find(e => e.code === 'TNT-10300')
    const adminExistingError = errData.find(e => e.code === 'TNT-10000' || e.code === 'TNT-10303')

    if (adminInvitedError) {
      // eslint-disable-next-line max-len
      message = $t({ defaultMessage: 'The email address belongs to a user of another Ruckus Cloud tenant. You may add this user as a 3rd party administrator.' })

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

  const updateMspEcAdminUsername = async (data: Administrator) => {
    try {
      const payload = {
        ...data,
        first_name: data.name,
        last_name: data.lastName
      }

      await updateMspEcAdmin({
        params: {
          mspEcTenantId: params.tenantId,
          mspEcAdminId: data.id
        },
        payload
      }).unwrap()

    } catch(error) {
      const respData = error as { status: number, data: { [key: string]: string } }
      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Update User Name Failed' }),
        // eslint-disable-next-line max-len
        content: $t({ defaultMessage: 'An error occurred: {error}' }, { error: respData.data.message })
      })
    }
  }

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue()

    // TODO: check duplicate with UI cached data : showError
    const isExistedUser = false

    if (isExistedUser) {
      showActionModal({
        type: 'error',
        title: $t({ defaultMessage: 'Admin could not be added' }),
        // eslint-disable-next-line max-len
        content: $t({ defaultMessage: 'The email address belongs to a registered user in this account. Please select him using the "Registered User" option' })
      })

      return
    }

    try {
      if (editMode) {
        const payload = {
          ...editData,
          role: formValues.role,
          pdetailLevel: formValues.detailLevel
        } as Administrator

        await updateAdmin({ params, payload }).unwrap()

        if (isNameEditable) {
          updateMspEcAdminUsername(formValues)
        }
      } else {
        const payload = {
          detailLevel: formValues.detailLevel,
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

        if (formValues.userType === 'new') {
          payload.email = formValues.newEmail
        } else {
          payload.email = formValues.email.email
          payload.externalId = formValues.email.externalId
        }

        await addAdmin({ params, payload }).unwrap()
      }

      setVisible(false)
    } catch(error) {
      if (editMode) {
        const respData = error as { status: number, data: { [key: string]: string } }
        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Update User Name Failed' }),
          // eslint-disable-next-line max-len
          content: $t({ defaultMessage: 'An error occurred: {error}' }, { error: respData.data.message })
        })
      } else {
        const respData = error as CommonErrorsResult<catchErrorDetails>
        handleSubmitFailed(respData)
      }
    }
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  const isLoading = isAddAdminUpdating || isUpdateAdminUpdating
  const isNoExistingUser = registerUsersSelectOpts.length === 0
  const isNameEditable = true // TODO

  return (
    <Modal
      visible={visible}
      title={
        editMode
          ? $t({ defaultMessage: 'Edit Administrator' })
          : $t({ defaultMessage: 'Add New Administrator' })
      }
      okText={
        editMode
          ? $t({ defaultMessage: 'OK' })
          : $t({ defaultMessage: 'Send Invitation' })
      }
      maskClosable={false}
      keyboard={false}
      width={840}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okButtonProps={{ disabled: isLoading }}
      cancelButtonProps={{ disabled: isLoading }}
    >
      <Form
        form={form}
        layout='vertical'
      >
        {editMode === false && (
          <Form.Item name='userType'>
            <Radio.Group style={{ width: '100%' }}>
              <Space direction='vertical' size='middle'>
                {isMspEc === false && (
                  <Row>
                    <Col span={4}>
                      <Form.Item
                        // eslint-disable-next-line max-len
                        tooltip={$t({ defaultMessage: 'Select a registered user. Registered user is a user which has a Ruckus Support Account' })}
                        noStyle
                      >
                        <Radio
                          value='existing'
                          disabled={isRegisterUsersListLoading || isNoExistingUser}
                        >
                          {$t({ defaultMessage: 'Registered user:' })}
                        </Radio>
                      </Form.Item>
                    </Col>
                    <Col span={20}>
                      <Form.Item
                        name='email'
                        noStyle
                      >
                        <Select
                          options={registerUsersList}
                          disabled={isNoExistingUser}
                          placeholder={$t({ defaultMessage: 'Select admin...' })}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col span={4}>
                    <Form.Item
                      // eslint-disable-next-line max-len
                      tooltip={$t({ defaultMessage: 'Email invitation will be sent to this Email address for registration.\n Once registered with this email, the invited user will become an administrator.' })}
                      noStyle
                    >
                      <Radio
                        value='new'
                      >
                        {$t({ defaultMessage: 'Invite new user' })}
                      </Radio>
                    </Form.Item>
                  </Col>
                  <Col span={20}>
                    <Form.Item
                      name='newEmail'
                      rules={[
                        { validator: (_, value) => emailRegExp(value) }
                      ]}
                      noStyle
                      // initialValue=''
                    >
                      <Input
                        placeholder={$t({ defaultMessage: 'Enter email address' })}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Space>
            </Radio.Group>
          </Form.Item>
        )}

        {editMode === true && (
          <>
            {isNameEditable ? (
              <>
                <Form.Item
                  name='name'
                  label={$t({ defaultMessage: 'First Name' })}
                  rules={[
                    { required: true },
                    { min: 1 },
                    { max: 64 }
                  ]}
                >
                  <Input/>
                </Form.Item>
                <Form.Item
                  name='lastName'
                  label={$t({ defaultMessage: 'Last Name' })}
                  rules={[
                    { required: true },
                    { min: 1 },
                    { max: 64 }
                  ]}
                >
                  <Input/>
                </Form.Item>
              </>
            ) : (
              <Form.Item
                label={$t({ defaultMessage: 'Name' })}
              >
                {`${editData.name} ${editData.lastName}`}
              </Form.Item>
            )}

            <Form.Item
              label={$t({ defaultMessage: 'Email Address' })}
            >
              {editData.email}
            </Form.Item>
          </>
        )}

        <Form.Item
          name='role'
          label={$t({ defaultMessage: 'Roles' })}
          // TODO: rules
        >
          <Select
            options={rolesList}
            disabled={editNameOnly === true}
            placeholder={$t({ defaultMessage: 'Select Role' })}
          />
        </Form.Item>

        {
          editMode === false && isOnboardedMsp === true && (
            <>
              <Form.Item
                name='ecType'
                label={$t({ defaultMessage: 'Managed Customers' })}
                initialValue={ECCustomerRadioButtonEnum.all}
              >
                <Radio.Group style={{ width: '100%' }}>
                  {ecTypesList.map((item) => {
                    return (
                      <Radio
                        value={item.value}
                      >
                        {$t({ defaultMessage: 'Managed Customers:' })}
                      </Radio>
                    )
                  })

                  }
                </Radio.Group>
              </Form.Item>

              {ecType === ECCustomerRadioButtonEnum.specific && (
                <Form.Item
                  name='mspEC'
                  noStyle
                >
                  <Select
                    options={ecTypesList}
                    // onChange={handleECSelectionChange}
                  />
                </Form.Item>
              )}
            </>
          )}
      </Form>
    </Modal>
  )
}

// const AddAdministratorDialog = (props: AddAdministratorDialogProps) => {
//   return <span>AddAdministratorDialog</span>
// }
export default AddAdministratorDialog