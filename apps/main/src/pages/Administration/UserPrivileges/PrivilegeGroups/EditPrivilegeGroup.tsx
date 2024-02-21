
import { useEffect } from 'react'

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

import CustomRoleSelector from '../CustomRoles/CustomRoleSelector'

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
      {/* <Tabs.TabPane tab={$t({ defaultMessage: 'Members' })} key='members' /> */}
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
  roleName?: string,
  delegation?: boolean
}

export function EditPrivilegeGroup () {
  const { $t } = useIntl()

  const navigate = useNavigate()
  const { groupId } = useParams()
  const location = useLocation().state as PrivilegeGroup
  const linkToPrivilegeGroups = useTenantLink('/administration/userPrivileges/privilegeGroups', 't')
  const [form] = Form.useForm()
  const [updatePrivilegeGroup] = useUpdatePrivilegeGroupMutation()

  // const isEditMode = action === 'view' || action === 'edit'

  const handleUpdatePrivilegeGroup = async () => {
    const formValues = form.getFieldsValue(true)

    try {
      await form.validateFields()
      const privilegeGroupData: PrivilegeGroupData = {
        name: formValues.name,
        description: formValues.description,
        roleName: formValues.role,
        delegation: false
      }
      await updatePrivilegeGroup({ params: { privilegeGroupId: groupId },
        payload: privilegeGroupData }).unwrap()

      navigate(linkToPrivilegeGroups)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  useEffect(() => {
    if (location) {
      form.setFieldValue('name', location.name)
      form.setFieldValue('description', location?.description)
      form.setFieldValue('role', location?.roleName)
    }
  }, [location])

  const PrivilegeGroupForm = () => {
    return <StepsForm
      form={form}
      onFinish={handleUpdatePrivilegeGroup}
      onCancel={() => navigate(linkToPrivilegeGroups)}
      // buttonLabel={{ submit: isEditMode
      //   ? intl.$t({ defaultMessage: 'Save' })
      //   : intl.$t({ defaultMessage: 'Add' }) }}
      buttonLabel={{ submit: $t({ defaultMessage: 'Save' }) }}
    >
      <StepsForm.StepForm>
        <Row gutter={12}>
          <Col span={4}>
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Name' })}
              rules={[
                { required: true },
                { min: 2 },
                { max: 64 }
              ]}
              children={<Input />}
            />
            <Form.Item
              name='description'
              label={$t({ defaultMessage: 'Description' })}
              rules={[
                { min: 2 },
                { max: 64 }
              ]}
              children={<Input />}
            />
            <CustomRoleSelector />
            <Form.Item
              name='ownscope'
              label={$t({ defaultMessage: 'Scope' })}
              rules={[
                { min: 2 },
                { max: 64 }
              ]}
              children={
                <Checkbox checked={true} children={$t({ defaultMessage: 'Own Account' })} />
              }
            />
            <Form.Item
              name='mspscope'
              rules={[
                { min: 2 },
                { max: 64 }
              ]}
              children={
                <Checkbox checked={true} children={$t({ defaultMessage: 'MSP Customers' })} />
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
      title={$t({ defaultMessage: 'Administrators' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'Administration' }) },
        { text: $t({ defaultMessage: 'Users & Privileges' }) },
        { text: $t({ defaultMessage: 'Privilege Groups' }),
          link: '/administration/userPrivileges/privilegeGroups' }
      ]}
      footer={<AdministrationTabs />}
    />
    <PrivilegeGroupForm />
    {/* { ActiveTabPane && <ActiveTabPane /> } */}
  </>)
}
