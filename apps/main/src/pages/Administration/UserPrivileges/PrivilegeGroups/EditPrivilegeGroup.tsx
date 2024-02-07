
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
import { useUpdatePrivilegeGroupMutation } from '@acx-ui/rc/services'
import { PrivilegeGroup }                  from '@acx-ui/rc/utils'
import {
  useLocation,
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
interface PrivilegeGroupData {
  name?: string,
  description?: string,
  roleName?: string
}

export function EditPrivilegeGroup () {
  const intl = useIntl()

  const navigate = useNavigate()
  const { action, groupId } = useParams()
  const location = useLocation().state as PrivilegeGroup
  const linkToPrivilegeGroups = useTenantLink('/administration/userPrivileges/privilegeGroups', 't')
  const [form] = Form.useForm()
  const [updatePrivilegeGroup] = useUpdatePrivilegeGroupMutation()

  const isEditMode = action === 'view' || action === 'edit'

  const handleUpdatePrivilegeGroup = async () => {
    const formValues = form.getFieldsValue(true)

    try {
      await form.validateFields()
      const privilegeGroupData: PrivilegeGroupData = {
        name: formValues.name,
        description: formValues.description,
        roleName: formValues.role
      }
      await updatePrivilegeGroup({ params: { privilegeGroupId: groupId },
        payload: privilegeGroupData }).unwrap()

      navigate(linkToPrivilegeGroups)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  form.setFieldValue('name', location.name)
  form.setFieldValue('description', location?.description)

  const PrivilegeGroupForm = () => {
    return <StepsForm
      form={form}
      onFinish={handleUpdatePrivilegeGroup}
      onCancel={() => navigate(linkToPrivilegeGroups)}
      buttonLabel={{ submit: isEditMode
        ? intl.$t({ defaultMessage: 'Save' })
        : intl.$t({ defaultMessage: 'Add' }) }}
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
