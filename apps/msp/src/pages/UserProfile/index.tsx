import { useEffect, useState } from 'react'

import { Row, Col, Form, Select, Switch, Tabs, Checkbox, Typography } from 'antd'
import { useIntl }                                                    from 'react-intl'
import styled                                                         from 'styled-components/macro'

import {
  PageHeader,
  StepsForm,
  Subtitle
} from '@acx-ui/components'
import {
  RecentLogin
} from '@acx-ui/msp/components'
import {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation
} from '@acx-ui/rc/services'
import {
  DetailLevel,
  ProfileDataToUpdate
} from '@acx-ui/rc/utils'
import {
  useParams
} from '@acx-ui/react-router-dom'

interface Map {
  [key: string]: string
}
const RoleString: Map = {
  PRIME_ADMIN: 'Prime Admin',
  ADMIN: 'Administrator',
  OFFICE_ADMIN: 'Guest Manager',
  READ_ONLY: 'Read-Only'
}

export function UserProfile () {
  const { $t } = useIntl()
  const { Option } = Select
  const { Paragraph } = Typography
  const { tenantId } = useParams()
  const [userInitial, setInitial] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setRole] = useState('')
  const [userEmail, setEmail] = useState('')
  const [dateFormat, setDateFormat] = useState('')
  const [detailLevel, setDetailLevel] = useState('')

  const { data } = useGetUserProfileQuery({ params: { tenantId } })

  useEffect(() => {
    if (data) {
      setInitial(data.firstName[0].toUpperCase() + data.lastName[0].toLocaleUpperCase())
      setUserName( `${data.firstName} ${data.lastName}`)
      setRole(getRoleString(data.role))
      setEmail(data.email)
      setDateFormat(data.dateFormat)
      setDetailLevel(data.detailLevel)
    }
  }, [data])

  const getRoleString = (role: string ) => {
    return RoleString[role]
  }

  const UserCircle = styled.div`
  text-align: center;
  width: 100px;
  height: 100px;
  line-height: 100px;
  font-size: 36px;
  font-family: Arial, sans-serif;
  font-weight: bold;
  color: #fff;
  background: var(--acx-neutrals-40);
  border-radius: 50px;
`
  const [ updateUserProfile ] = useUpdateUserProfileMutation()

  const handleUpdate = () => {
    const payload: ProfileDataToUpdate = {
      detailLevel: DetailLevel.BASIC_USER,
      dateFormat: 'dd/mm/yyyy'
    }

    updateUserProfile({ payload, params: { tenantId } })
      .then(() => {
      })
  }

  const UserData = () => {
    return (
      <Row>
        <Col>
          <UserCircle
            style={{ width: '100px' }}
          >{userInitial}</UserCircle>
        </Col>
        <Col style={{ margin: '15px' }}>
          <Subtitle style={{ marginBottom: '0px' }} level={2}>{ userName }</Subtitle>
          <label style={{ color: 'var(--acx-neutrals-50)' }}>{userRole}</label>
          <Row style={{ marginTop: '10px' }}>
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
      >
        <StepsForm.StepForm style={{ marginTop: '20px' }}>
          <Row gutter={20}>
            <Col span={8}>
              <label>{$t({ defaultMessage: 'Receive notifications through:' })}</label>
              <div>
                <Form.Item
                  name='email_format'
                  label={$t({ defaultMessage: 'Email' })}
                  style={{ display: 'inline-block', width: 'calc(50%)',
                    marginTop: '15px' }}
                  rules={[{
                    required: false
                  }]}
                  // children={<Subtitle level={5}>eleu1658@yahoo.com</Subtitle>}
                />
                <Form.Item
                  name='email_format'
                  children={<Switch />}
                  style={{ display: 'inline-block', width: 'calc(50%)',
                    marginTop: '7px' }}
                />
              </div>
              <div>
                <Form.Item
                  name='email_format'
                  label={$t({ defaultMessage: 'SMS' })}
                  style={{ display: 'inline-block', width: 'calc(50%)' }}
                  rules={[{
                    required: false
                  }]}
                />
                <Form.Item
                  name='email_format'
                  children={<Switch />}
                  style={{ display: 'inline-block', width: 'calc(50%)',
                    marginTop: '-8px' }}
                />
              </div>

              <label>{$t({ defaultMessage: 'Select the notifications you wish to receive::' })}
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
              </div>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    )
  }

  const SettingsTab = () => {
    return (
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        onFinish={async () => handleUpdate()}
      >
        <StepsForm.StepForm style={{ marginTop: '20px' }}>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item
                name='date_format'
                label={$t({ defaultMessage: 'Date Format' })}
                rules={[{
                  required: false
                }]}
                children={
                  <Select defaultValue={dateFormat} >
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
                  <Select defaultValue={detailLevel} >
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
              <Form.Item
                name='event_tooltip'
                label={$t({ defaultMessage:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' +
                'Aenean euismod bibendum laoreet. Proin gravida dolor sit amet ' +
                'lacus accumsan et viverra justo' })}
              />

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

  return (
    <>
      <PageHeader
        title='User Profile'
      />
      <UserData/>

      <Tabs style={{ marginTop: '25px' }}>
        {/* <Tabs style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between' }}> */}
        <Tabs.TabPane tab={$t({ defaultMessage: 'Notfications' })} key='Notfications'>
          <NotificationTab />
        </Tabs.TabPane>

        <Tabs.TabPane tab={$t({ defaultMessage: 'Settings' })} key='Settings'>
          <SettingsTab />
        </Tabs.TabPane>

        <Tabs.TabPane tab={$t({ defaultMessage: 'Security' })} key='Security'>
        </Tabs.TabPane>

        <Tabs.TabPane tab={$t({ defaultMessage: 'Recent Logins' })} key='RecentLogins'>
          <RecentLogin />
        </Tabs.TabPane>
      </Tabs>
    </>
  )
}
