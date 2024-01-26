
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
  StepsForm
} from '@acx-ui/components'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import RoleSelector from '../../Administrators/AdministratorsTable/AddAdministratorDialog/RoleSelector'

export function AddCustomRole () {
  const intl = useIntl()

  const navigate = useNavigate()
  const linkToCustomRoles = useTenantLink('/administration/userPrivileges/customRoles', 't')
  const [form] = Form.useForm()

  const handleAssignLicense = async () => {
    // try {
    //   const ecFormData = { ...values }

    // }
  }

  const CustomRoleForm = () => {
    return <StepsForm
      form={form}
      onFinish={handleAssignLicense}
      onCancel={() => navigate(linkToCustomRoles)}
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

  return (<>
    <PageHeader
      title={intl.$t({ defaultMessage: 'Add Admin Roles' })}
      breadcrumb={[
        { text: intl.$t({ defaultMessage: 'Administration' }) },
        { text: intl.$t({ defaultMessage: 'Users & Privileges' }) },
        { text: intl.$t({ defaultMessage: 'Roles' }),
          link: '/administration/userPrivileges/customRoles' }
      ]}
    />
    <CustomRoleForm />
  </>)
}
