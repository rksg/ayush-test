
import {
  Checkbox,
  Form,
  Input
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Descriptions,
  PageHeader,
  StepsForm,
  Subtitle
} from '@acx-ui/components'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

import * as UI from '../styledComponents'

export function AddCustomRole () {
  const intl = useIntl()
  const { action } = useParams()

  const navigate = useNavigate()
  const linkToCustomRoles = useTenantLink('/administration/userPrivileges/customRoles', 't')
  const [form] = Form.useForm()

  const handleAddRole = async () => {
    // try {
    //   const ecFormData = { ...values }

    // }
  }

  const CustomRoleForm = () => {
    return <StepsForm
      form={form}
      onFinish={handleAddRole}
      onCancel={() => navigate(linkToCustomRoles)}
    >
      <StepsForm.StepForm
        key='general'
        name='general'
        title={intl.$t({ defaultMessage: 'General' })}
      >
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'General' })}</Subtitle>
        <Form.Item
          name='name'
          label={intl.$t({ defaultMessage: 'Role Name' })}
          style={{ width: '300px' }}
          rules={[
            { required: true }//,
            // { validator: (_, value) => whitespaceOnlyRegExp(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='description'
          label={intl.$t({ defaultMessage: 'Role Description' })}
          style={{ width: '300px' }}
          children={
            <Input.TextArea rows={4} maxLength={180} />
          }
        />
      </StepsForm.StepForm>

      <StepsForm.StepForm
        name='permissions'
        key='ermissions'
        title={intl.$t({ defaultMessage: 'Permissions' })}
        // onFinish={async (data: CliConfiguration) => {
        //   if (!data?.cliValid?.valid) {
        //     showToast({ type: 'error', duration: 2, content: data?.cliValid?.tooltip })
        //   }
        //   return true
        // }}
      >
        <Subtitle level={3}>{ intl.$t({ defaultMessage: 'Permissions' }) }</Subtitle>
        <h4>
          {intl.$t({ defaultMessage: 'Choose permissions and permission levels for this role:' })}
        </h4>
        <div
          style={{
            width: 758, height: 432, backgroundColor: '#F2F2F2', padding: '20px 40px 40px 20px' }}>
          <UI.FieldLabelPermission width='270'>
            <Checkbox style={{ backgroundColor: '#F2F2F2' }}
              // onChange={handlePermissionChange}
              // checked={isPermissionEnabled}
              // value={isPermissionEnabled}
              // disabled={isDisabled}
            >
              {intl.$t({ defaultMessage: 'Permission' })}
            </Checkbox>
            <label>Read</label>
            <label>Create</label>
            <label>Update</label>
            <label>Delete</label>
            <label>Execute</label>
          </UI.FieldLabelPermission>

          <UI.FieldLabelAttributes width='660'>
            <Checkbox style={{ width: 400 }}
              // checked={isPermissionEnabled}
            >
              {intl.$t({ defaultMessage: 'Wi-Fi' })}
            </Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
          </UI.FieldLabelAttributes>

          <UI.FieldLabelAttributes width='270'>
            <Checkbox>
              {intl.$t({ defaultMessage: 'Wired' })}
            </Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
          </UI.FieldLabelAttributes>

          <UI.FieldLabelAttributes width='660'>
            <Checkbox>
              {intl.$t({ defaultMessage: 'SmartEdge' })}
            </Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>

          </UI.FieldLabelAttributes>
          <UI.FieldLabelAttributes width='660'>
            <Checkbox>
              {intl.$t({ defaultMessage: 'Guests' })}
            </Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
          </UI.FieldLabelAttributes>

          <UI.FieldLabelAttributes width='660'>
            <Checkbox>
              {intl.$t({ defaultMessage: 'Reports' })}
            </Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
          </UI.FieldLabelAttributes>

          <UI.FieldLabelAttributes width='660'>
            <Checkbox>
              {intl.$t({ defaultMessage: 'DPSK Managemen' })}
            </Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
          </UI.FieldLabelAttributes>

          <UI.FieldLabelAttributes width='660'>
            <Checkbox>
              {intl.$t({ defaultMessage: 'Templates' })}
            </Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>
            <Checkbox></Checkbox>

          </UI.FieldLabelAttributes>
        </div>

      </StepsForm.StepForm>

      {/* {!editMode && */}
      <StepsForm.StepForm
        name='summary'
        title={intl.$t({ defaultMessage: 'Summary' })}
      >
        <Subtitle level={3}>{ intl.$t({ defaultMessage: 'Summary' }) }</Subtitle>
        <h4>{ intl.$t({ defaultMessage: 'Network Info' }) }</h4>
        <Form.Item
          label={intl.$t({ defaultMessage: 'Role Name' })}
          children={'my role name'}
        />
        <Form.Item
          label={intl.$t({ defaultMessage: 'Role Description' })}
          children={'None'}
        />

        <Form.Item
          label={intl.$t({ defaultMessage: 'Permissions' })}
          children={
            <Descriptions labelWidthPercent={15}>
              <Descriptions.Item
                label={intl.$t({ defaultMessage: 'Wi-Fi' })}
                labelStyle={{ fontWeight: 800, overflow: 'hidden', width: '200' }}
                children={'Create, Update, Delete, Read'} />

              <Descriptions.Item
                label={intl.$t({ defaultMessage: 'Wired' })}
                labelStyle={{ fontWeight: 800 }}
                children={'Create, Update, Delete, Read'} />

              <Descriptions.Item
                label={intl.$t({ defaultMessage: 'SmartEdge' })}
                labelStyle={{ fontWeight: 800 }}
                children={'Create, Update, Delete, Read'} />

              <Descriptions.Item
                label={intl.$t({ defaultMessage: 'Guests' })}
                labelStyle={{ fontWeight: 800 }}
                children={'Read'} />

              <Descriptions.Item
                label={intl.$t({ defaultMessage: 'Reports' })}
                labelStyle={{ fontWeight: 800 }}
                children={'Create, Update, Delete, Read'} />

              <Descriptions.Item
                label={intl.$t({ defaultMessage: 'DPSK Management' })}
                labelStyle={{ fontWeight: 800 }}
                children={'Read'} />

              <Descriptions.Item
                label={intl.$t({ defaultMessage: 'Template' })}
                labelStyle={{ fontWeight: 800 }}
                children={'Read'} />

            </Descriptions>
          }
        />
      </StepsForm.StepForm>
      {/* } */}
    </StepsForm>
  }

  return (<>
    <PageHeader
      title={(action === 'edit' || action === 'view')
        ? intl.$t({ defaultMessage: 'Edit Admin Role' })
        : intl.$t({ defaultMessage: 'Add Admin Role' })
      }
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
