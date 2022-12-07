import { useEffect, useState } from 'react'

import { Row, Col, Form, Select, Switch, Typography } from 'antd'
import { useIntl }                                    from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Subtitle,
  Tabs,
  Tooltip
} from '@acx-ui/components'
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation
} from '@acx-ui/rc/services'
import {
  DetailLevel,
  ProfileDataToUpdate,
  RolesEnum
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams
} from '@acx-ui/react-router-dom'
import { notAvailableMsg } from '@acx-ui/utils'

import {
  RecentLogin
} from './RecentLogin'
import { EnvelopClosedSolidIcon, UserCircle, UserEmailLabel } from './styledComponents'

interface fromLoc {
  from: string
}

const GetRoleString = ( role: RolesEnum ) => {
  const { $t } = useIntl()
  switch (role) {
    case RolesEnum.PRIME_ADMIN:
      return $t({ defaultMessage: 'Prime Admin' })
    case RolesEnum.ADMINISTRATOR:
      return $t({ defaultMessage: 'Administrator' })
    case RolesEnum.GUEST_MANAGER:
      return $t({ defaultMessage: 'Guest Manager' })
    case RolesEnum.READ_ONLY:
      return $t({ defaultMessage: 'Read Only' })
    default:
      return $t({ defaultMessage: 'Known' })
  }
}

export function UserProfile () {
  const { $t } = useIntl()
  const { Option } = Select
  const { Paragraph } = Typography
  const { tenantId } = useParams()
  const navigate = useNavigate()
  const [userInitial, setInitial] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setRole] = useState('')
  const [userEmail, setEmail] = useState('')
  const [dateFormat, setDateFormat] = useState('')
  const [detailLevel, setDetailLevel] = useState('')

  const { data } = useGetUserProfileQuery({ params: { tenantId } })
  const location = useLocation().state as fromLoc

  useEffect(() => {
    if (data) {
      setInitial(data.initials)
      setUserName(data.fullName)
      setRole(data.role)
      setEmail(data.email)
      setDateFormat(data.dateFormat)
      setDetailLevel(data.detailLevel)
    }
  }, [data])

  const [ updateUserProfile ] = useUpdateUserProfileMutation()

  const handleUpdate = () => {
    const payload: ProfileDataToUpdate = {
      detailLevel: detailLevel as DetailLevel,
      dateFormat: dateFormat
    }

    updateUserProfile({ payload, params: { tenantId } })
      .then(() => {
        navigate({
          pathname: location.from
        }, { replace: true })
      })
  }

  const handleCancel = () => {
    navigate({
      pathname: location.from
    }, { replace: true })
  }

  const UserData = () => {
    return (
      <Row>
        <Col>
          <UserCircle>{userInitial}</UserCircle>
        </Col>
        <Col style={{ margin: '15px' }}>
          <Subtitle style={{ marginBottom: '0px' }} level={2}>{ userName }</Subtitle>
          <label
            style={{ color: 'var(--acx-neutrals-50)' }}>{GetRoleString(userRole as RolesEnum)}
          </label>
          <Row style={{ marginTop: '10px' }}>
            <Col><EnvelopClosedSolidIcon /></Col>
            <Col><h4>{ userEmail }</h4></Col>
            {/* <Col style={{ marginLeft: '25px' }}><h4>+1 408-234-9811</h4></Col> */}
            <Col style={{ marginLeft: '25px' }}><b>Tenant ID</b></Col>
            <Col style={{ marginLeft: '5px' }}><Paragraph copyable>{tenantId}</Paragraph></Col>
          </Row>
        </Col>
      </Row>
    )
  }

  const NotificationTab = () => {
    return (
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onFinish={async () => handleCancel()}
        onCancel={async () => handleCancel()}
      >
        <StepsForm.StepForm
          layout='horizontal'
          labelAlign='left'
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 24 }}>
          <label>{$t({ defaultMessage: 'Receive notifications through:' })}</label>
          <Row gutter={20}>
            <Col span={8}>
              <StepsForm.FieldLabel width='190px'>
                <UserEmailLabel>
                  {$t({ defaultMessage: 'Email' })}
                  {userEmail}
                </UserEmailLabel>
                <Form.Item
                  name='email_format'
                  rules={[{
                    required: false
                  }]}
                  children={<Switch></Switch>}
                />
              </StepsForm.FieldLabel>
              <StepsForm.FieldLabel width='190px'>
                {$t({ defaultMessage: 'SMS' })}
                <Form.Item
                  name='phone_format'
                  rules={[{
                    required: false
                  }]}
                  children={<Switch></Switch>}
                />
              </StepsForm.FieldLabel>
            </Col>
          </Row>

          {/* <label>{$t({ defaultMessage: 'Select the notifications you wish to receive::' })}
              </label>
              <Subtitle level={4} style={{ marginTop: '17px' }}>
                { $t({ defaultMessage: 'Incidents' }) }</Subtitle>

              <div style={{ marginBottom: '5px' }}>
                <Checkbox>{$t({ defaultMessage: 'P1 Incidents' })}</Checkbox>
              </div>
              <div style={{ marginBottom: '5px' }}>
                <Checkbox>{$t({ defaultMessage: 'P2 Incidents' })}</Checkbox>
              </div>
              <div style={{ marginBottom: '5px' }}>
                <Checkbox>{$t({ defaultMessage: 'P3 Incidents' })}</Checkbox>
              </div>
              <div>
                <Checkbox>{$t({ defaultMessage: 'P4 Incidents' })}</Checkbox>
              </div> */}
        </StepsForm.StepForm>
      </StepsForm>
    )
  }

  const onEventDetailChange = function (value: string) {
    setDetailLevel(value)
  }

  const onDateFormatChange = function (value: string) {
    setDateFormat(value)
  }

  const SettingsTab = () => {
    return (
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onFinish={async () => handleUpdate()}
        onCancel={async () => handleCancel()}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item
                name='date_format'
                label={$t({ defaultMessage: 'Date Format' })}
                rules={[{
                  required: false
                }]}
                children={
                  <Select defaultValue={dateFormat}
                    onChange={onDateFormatChange}>
                    <Option value={'mm/dd/yyyy'}>
                      {$t({ defaultMessage: 'MM/DD/YYYY' })}</Option>
                    <Option value={'dd/mm/yyyy'}>
                      {$t({ defaultMessage: 'DD/MM/YYYY' })}</Option>
                    <Option value={'yyyy/mm/dd'}>
                      {$t({ defaultMessage: 'YYYY/MM/DD' })}</Option>
                  </Select>
                }
              />
              <Form.Item
                name='event_level'
                label={$t({ defaultMessage: 'Event Details Level' })}
                rules={[{
                  required: false
                }]}
                children={
                  <Select defaultValue={detailLevel}
                    onChange={onEventDetailChange}>
                    <Option value={DetailLevel.BASIC_USER}>
                      {$t({ defaultMessage: 'Basic User' })}</Option>
                    <Option value={DetailLevel.IT_PROFESSIONAL}>
                      {$t({ defaultMessage: 'IT Professional' })}</Option>
                    <Option value={DetailLevel.SUPER_USER}>
                      {$t({ defaultMessage: 'Super User' })}</Option>
                    <Option value={DetailLevel.DEBUGGING}>
                      {$t({ defaultMessage: 'Debugging' })}</Option>
                  </Select>
                }
              />
              {/* <Form.Item
                name='event_tooltip'
                label={$t({ defaultMessage:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
                'Aenean euismod bibendum laoreet. Proin gravida dolor sit amet ' +
                'lacus accumsan et viverra justo' })}
              /> */}

              <Form.Item
                name='preferred_language'
                label={$t({ defaultMessage: 'Preferred Language' })}
                rules={[{
                  required: false
                }]}
                children={
                  <Select defaultValue={'ENGLISH'} >
                    <Option value={'ENGLISH'}>{$t({ defaultMessage: 'English' })}</Option>
                  </Select>
                }
              />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    )
  }

  const SecurityTab = () => {
    return (
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onFinish={async () => handleCancel()}
        onCancel={async () => handleCancel()}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <h4 ><b>{$t({ defaultMessage: 'Multi-Factor Authentication' })}</b></h4>

              <Form.Item style={{ marginTop: '15px' }}
                name='mfa_status'
                label={$t({ defaultMessage: 'Multi-Factor Authentication' })}
                tooltip={$t({ defaultMessage:
                  'This option is controlled by the Prime-Administrator(s) of this account.' +
                  'If they turn it on, you will be able to manage here your authentication ' +
                  'settings' })}
                rules={[{
                  required: false
                }]}
                children={
                  <h4>Off</h4>
                }
              />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    )
  }

  return (
    <>
      <PageHeader
        title='User Profile'
      />
      <UserData/>

      <Tabs activeKey={'Settings'}>
        <Tabs.TabPane
          tab={<Tooltip title={$t(notAvailableMsg)}>
            {$t({ defaultMessage: 'Notifications' })}
          </Tooltip>}
          disabled={true}
          key='Notfications'>
          <NotificationTab />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={$t({ defaultMessage: 'Settings' })}
          key='Settings'>
          <SettingsTab />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={<Tooltip title={$t(notAvailableMsg)}>
            {$t({ defaultMessage: 'Security' })}
          </Tooltip>}
          disabled={true}
          key='Security'>
          <SecurityTab />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={<Tooltip title={$t(notAvailableMsg)}>
            {$t({ defaultMessage: 'Recent Logins' })}
          </Tooltip>}
          disabled={true}
          key='RecentLogins'>
          <RecentLogin />
        </Tabs.TabPane>
      </Tabs>
    </>
  )
}
