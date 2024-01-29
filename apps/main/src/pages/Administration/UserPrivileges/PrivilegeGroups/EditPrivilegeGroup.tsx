
import {
  Checkbox,
  Col,
  Form,
  Input,
  Row
} from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Tabs
} from '@acx-ui/components'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

import RoleSelector from '../../Administrators/AdministratorsTable/AddAdministratorDialog/RoleSelector'

const AdministrationTabs = () => {
  const { $t } = useIntl()
  const params = useParams()
  const { activeTab } = params
  const basePath = useTenantLink('/administration')
  const navigate = useNavigate()

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }

  return (
    <Tabs
      defaultActiveKey='groupSettings'
      activeKey={activeTab}
      onChange={onTabChange}
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Group Settings' })} key='groupSettings' />
      <Tabs.TabPane tab={$t({ defaultMessage: 'Members' })} key='members' />
    </Tabs>
  )
}

// const tabPanes = {
//   groupSettings: GroupSettings,
//   members: Members
// }

export function EditPrivilegeGroup () {
  const intl = useIntl()

  const navigate = useNavigate()
  //   const { activeTab } = useParams()
  const linkToPrivilegeGroups = useTenantLink('/administration/userPrivileges/privilegeGroups', 't')
  const [form] = Form.useForm()

  const handleUpdatePrivilegeGroup = async () => {
    // try {
    //   const ecFormData = { ...values }

    // }
  }

  const PrivilegeGroupForm = () => {
    return <StepsForm
      form={form}
      onFinish={handleUpdatePrivilegeGroup}
      onCancel={() => navigate(linkToPrivilegeGroups)}
    >
      <StepsForm.StepForm>
        <Row gutter={12}>
          <Col span={4}>
            <Form.Item
              name='name'
              label={intl.$t({ defaultMessage: 'Name' })}
              rules={[
                { required: true },
                { min: 2 },
                { max: 64 }
              ]}
              children={<Input />}
            />
            <Form.Item
              name='description'
              label={intl.$t({ defaultMessage: 'Description' })}
              rules={[
                { min: 2 },
                { max: 64 }
              ]}
              children={<Input />}
            />
            <RoleSelector />
            <Form.Item
              name='ownscope'
              label={intl.$t({ defaultMessage: 'Scope' })}
              rules={[
                { min: 2 },
                { max: 64 }
              ]}
              children={
                <Checkbox children={intl.$t({ defaultMessage: 'Own Account' })} />
              }
            />
            <Form.Item
              name='mspscope'
              rules={[
                { min: 2 },
                { max: 64 }
              ]}
              children={
                <Checkbox children={intl.$t({ defaultMessage: 'MSP Customers' })} />
              }
            />
          </Col>
        </Row>
      </StepsForm.StepForm>
    </StepsForm>
  }

  //   const ActiveTabPane = tabPanes[activeTab as keyof typeof tabPanes]

  return (<>
    <PageHeader
      title={intl.$t({ defaultMessage: 'Administrators' })}
      breadcrumb={[
        { text: intl.$t({ defaultMessage: 'Administration' }) },
        { text: intl.$t({ defaultMessage: 'Users & Privileges' }) },
        { text: intl.$t({ defaultMessage: 'Privilege Groups' }),
          link: '/administration/userPrivileges/privilegeGroups' }
      ]}
      footer={<AdministrationTabs />}
    />
    <PrivilegeGroupForm />
    {/* { ActiveTabPane && <ActiveTabPane /> } */}
  </>)
}
