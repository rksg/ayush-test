import { useEffect } from 'react'

import { QuestionCircleOutlined } from '@ant-design/icons'
import {
  Form,
  Radio,
  Row,
  Col,
  Space,
  Select,
  Input,
  Tooltip
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Modal, showActionModal/*, showToast */ } from '@acx-ui/components'
import {
  useAddAdminMutation,
  useGetRegisteredUsersListQuery
} from '@acx-ui/rc/services'
import {
  CommonErrorsResult,
  catchErrorDetails,
  emailRegExp
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import MspCustomerSelector, { ECCustomerRadioButtonEnum } from './MspCustomersSelector'
import RoleSelector                                       from './RoleSelector'


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
  const userType = Form.useWatch('userType', form)
  const [addAdmin, { isLoading: isAddAdminUpdating }] = useAddAdminMutation()

  const {
    data: registerUsersList,
    isLoading: isRegisterUsersListLoading
  } = useGetRegisteredUsersListQuery({ params })

  const isRegisteredUser = (email: string): boolean => {
    if (!registerUsersList) return false
    return Boolean(_.find(registerUsersList, { email }))
  }

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

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue(true)
    const { userType, newEmail } = formValues

    // check duplicate with UI cached data if choose "invite new"
    if (userType === 'new') {
      const isExistedUser = isRegisteredUser(newEmail)

      if (isExistedUser) {
        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Admin could not be added' }),
          // eslint-disable-next-line max-len
          content: $t({ defaultMessage: 'The email address belongs to a registered user in this account. Please select him using the "Registered User" option' })
        })

        return
      }
    }

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

      if (userType === 'new') {
        payload.email = formValues.newEmail
      } else {
        payload.email = formValues.email
        payload.externalId = _.find(registerUsersList, { email: formValues.email })?.externalId
      }

      await addAdmin({ params, payload }).unwrap()
      handleCancel()
    } catch(error) {
      const respData = error as CommonErrorsResult<catchErrorDetails>
      handleSubmitFailed(respData)
    }
  }

  const handleCancel = () => {
    setVisible(false)
    form.resetFields()
  }

  useEffect(() => {
    if (form && registerUsersList) {
      form.setFieldValue('userType', registerUsersList.length > 0 ? 'existing' : 'new')
    }
  }, [form, registerUsersList])

  const registerUsersSelectOpts = registerUsersList ? registerUsersList.map((item) => ({
    label: item.email,
    value: item.email
  })): []

  const isNoExistingUser = registerUsersSelectOpts.length === 0

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
        layout='horizontal'
        onFinish={handleSubmit}
      >
        <Space direction='vertical' style={{ width: '100%' }} >
          <Form.Item name='userType' initialValue='new'>
            <Radio.Group style={{ width: '100%' }}>
              <Space direction='vertical' size='large' style={{ width: '100%' }} >
                {isMspEc === false && (
                  <Row justify='space-between'>
                    <Col span={8}>
                      <Radio
                        value='existing'
                        disabled={isRegisterUsersListLoading || isNoExistingUser}
                      >
                        {$t({ defaultMessage: 'Registered user' })}
                        <Tooltip
                          placement='topRight'
                          // eslint-disable-next-line max-len
                          title={$t({ defaultMessage: 'Select a registered user. Registered user is a user which has a Ruckus Support Account' })}
                        >
                          <QuestionCircleOutlined />
                        </Tooltip>
                      </Radio>
                    </Col>
                    <Col span={15}>
                      <Form.Item
                        name='email'
                        noStyle
                        rules={[
                          { required: userType === 'existing' }
                        ]}
                      >
                        <Select
                          options={registerUsersSelectOpts}
                          disabled={isNoExistingUser}
                          placeholder={$t({ defaultMessage: 'Select admin...' })}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                <Row justify='space-between'>
                  <Col span={8}>
                    <Radio value='new'>
                      {$t({ defaultMessage: 'Invite new user' })}
                      <Tooltip
                        placement='topRight'
                        // eslint-disable-next-line max-len
                        title={$t({ defaultMessage: 'Email invitation will be sent to this Email address for registration.\n Once registered with this email, the invited user will become an administrator.' })}
                      >
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Radio>
                  </Col>
                  <Col span={15}>
                    <Form.Item
                      name='newEmail'
                      rules={[
                        {
                          required: userType === 'new',
                          message: $t({ defaultMessage: 'Please enter email' })
                        },
                        { validator: (_, value) => emailRegExp(value) }
                      ]}
                      noStyle
                      initialValue=''
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