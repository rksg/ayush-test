import { useState } from 'react'

import { Row, Col, Form, Select, Typography } from 'antd'
import { useIntl }                            from 'react-intl'

import { Button, PageHeader, StepsForm, Tabs, UserProfileSection } from '@acx-ui/components'
import { Features, useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import { MultiFactor }                                             from '@acx-ui/msp/components'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { RolesEnum } from '@acx-ui/types'
import {
  DetailLevel,
  useUserProfileContext,
  useUpdateUserProfileMutation,
  roleStringMap,
  hasRoles,
  LocalUserProfile
} from '@acx-ui/user'
import { LangKey, useLocaleContext } from '@acx-ui/utils'

import AddPhoneDrawer                from './AddPhoneDrawer'
import { PreferredLanguageFormItem } from './PreferredLanguageFormItem'
import { RecentLogin }               from './RecentLogin'
import * as UI                       from './styledComponents'
import { UserNotifications }         from './UserNotifications'

export function UserProfile () {
  const { $t } = useIntl()
  const { Option } = Select
  const { tenantId, activeTab } = useParams()
  const navigate = useNavigate()
  const localeContext = useLocaleContext()
  const { data: userProfile, setLocalProfile } = useUserProfileContext()
  const [ updateUserProfile ] = useUpdateUserProfileMutation()
  const basePath = useTenantLink('/userprofile')
  const isGuestManager = hasRoles([RolesEnum.GUEST_MANAGER])
  const rootPath = useTenantLink('/')
  const notificationAdminContextualEnabled =
    useIsSplitOn(Features.NOTIFICATION_ADMIN_CONTEXTUAL_TOGGLE)
  const [phoneDrawerVisible, setPhoneDrawerVisible] = useState(false)

  const handleUpdateSettings = async (data: LocalUserProfile) => {
    localeContext.setLang(data.preferredLanguage as LangKey)
    setLocalProfile(data)

    await updateUserProfile({ payload: data, params: { tenantId } })
    window.location.reload()
    navigate(-1)
  }

  const handleCancel = () => {
    isGuestManager ?
      navigate({ pathname: rootPath.pathname }):
      navigate(-1)
  }

  const SettingsTab = () => {
    return (
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply Settings' }) }}
        onFinish={handleUpdateSettings}
        onCancel={async () => handleCancel()}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <Form.Item
                name='dateFormat'
                label={$t({ defaultMessage: 'Date Format' })}
                initialValue={userProfile?.dateFormat}
                children={
                  <Select>
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
                name='detailLevel'
                label={$t({ defaultMessage: 'Event Details Level' })}
                initialValue={userProfile?.detailLevel}
                children={
                  <Select>
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
              <PreferredLanguageFormItem />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    )
  }

  const SecurityTab = () => {
    return <MultiFactor/>
  }

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }
  const tabs = [
    {
      key: 'settings',
      title: $t({ defaultMessage: 'Settings' }),
      component: <SettingsTab />
    },
    {
      key: 'security',
      title: $t({ defaultMessage: 'Security' }),
      component: <SecurityTab />
    },
    {
      key: 'recentLogins',
      title: $t({ defaultMessage: 'Recent Logins' }),
      disabled: hasRoles([RolesEnum.DPSK_ADMIN]),
      component: userProfile && <RecentLogin userEmail={userProfile!.email} />
    },
    ...(!notificationAdminContextualEnabled ? [] : [
      {
        title: $t({ defaultMessage: 'Notifications' }),
        key: 'notifications',
        component: <UserNotifications profile={userProfile!}/>
      }
    ])
  ]

  const ActiveTabPane = tabs.find(({ key }) => key === activeTab)?.component

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'User Profile' })}
      />
      <UserProfileSection
        userProfile={userProfile}
        tenantId={tenantId}
        roleStringMap={roleStringMap}
      />
      {notificationAdminContextualEnabled && <UI.UserProfilePhoneNumberWrapper>
        <Row align='middle'>
          <UI.MobilePhoneOutlinedIcon style={{ marginLeft: '115px' }}/>
          <Typography.Paragraph>{userProfile?.phoneNumber ?? ''}</Typography.Paragraph>
          <Button type='link'
            style={{ marginLeft: '3px' }}
            onClick={() => setPhoneDrawerVisible(true)}>
            {userProfile?.phoneNumber ? $t({ defaultMessage: 'Change' })
              : $t({ defaultMessage: 'Add phone' })}
          </Button>
        </Row>
      </UI.UserProfilePhoneNumberWrapper>}

      {phoneDrawerVisible &&
        <AddPhoneDrawer
          profile={userProfile}
          visible={phoneDrawerVisible}
          setVisible={setPhoneDrawerVisible} />}

      <Tabs
        defaultActiveKey='settings'
        activeKey={activeTab}
        onChange={onTabChange}
      >
        {tabs.map(({ key, title, disabled }) =>
          <Tabs.TabPane tab={title} key={key} disabled={disabled} />)}
      </Tabs>
      {ActiveTabPane}
    </>
  )
}
