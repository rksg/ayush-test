import {
  // Checkbox,
  Form,
  Input
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Descriptions,
  PageHeader,
  Select,
  StepsForm,
  Subtitle
} from '@acx-ui/components'
import { CustomRole, getRoles } from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { RolesEnum } from '@acx-ui/types'

import * as UI from '../styledComponents'

export function AddCustomRole () {
  const intl = useIntl()
  const navigate = useNavigate()
  const { action } = useParams()
  const location = useLocation().state as CustomRole

  const linkToCustomRoles = useTenantLink('/administration/userPrivileges/customRoles', 't')
  const [form] = Form.useForm()

  const isEditMode = action === 'view' || action === 'edit'
  const handleAddRole = async () => {
    // try {
    //   const ecFormData = { ...values }
    // }
  }

  if (isEditMode || action === 'clone') {
    form.setFieldValue('name', location?.name)
    form.setFieldValue('description', location?.description)
  }

  const CustomRoleForm = () => {
    return <StepsForm
      form={form}
      editMode={isEditMode}
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
        key='permissions'
        title={intl.$t({ defaultMessage: 'Permissions' })}
        // onFinish={async (data: CliConfiguration) => {
        //   if (!data?.cliValid?.valid) {
        //     showToast({ type: 'error', duration: 2, content: data?.cliValid?.tooltip })
        //   }
        //   return true
        // }}
      ><PermissionsForm />
      </StepsForm.StepForm>

      {!isEditMode &&
        <StepsForm.StepForm
          name='summary'
          title={intl.$t({ defaultMessage: 'Summary' })}
        ><SummaryForm />
        </StepsForm.StepForm>}

    </StepsForm>
  }

  const PermissionsForm = () => {
    const rolesList = getRoles().map((item) => ({
      label: intl.$t(item.label),
      value: item.value
    })).filter(item => !(item.value === RolesEnum.DPSK_ADMIN))

    return <>
      <Subtitle level={3}>{ intl.$t({ defaultMessage: 'Permissions' }) }</Subtitle>
      <h5>
        {intl.$t({ defaultMessage: 'Set the permissions for this role:' })}
      </h5>
      <div
        style={{
          width: 758, height: 432, backgroundColor: '#F2F2F2', padding: '20px 40px 40px 20px' }}>
        {/* <UI.FieldLabelPermission width='270'>
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
        </UI.FieldLabelPermission> */}

        <UI.FieldLabelAttributes width='660'>
          <div>
            {intl.$t({ defaultMessage: 'Wi-Fi' })}
            {/* <Tooltip title={intl.$t({ defaultMessage: 'Wi-Fi' })}/> */}
          </div>
          <Select
            options={rolesList}
            // placeholder={intl.$t({ defaultMessage: 'Select Role' })}
          />
        </UI.FieldLabelAttributes>

        <UI.FieldLabelAttributes width='660'>
          {intl.$t({ defaultMessage: 'Wired' })}
          <Select options={rolesList} />
        </UI.FieldLabelAttributes>

        <UI.FieldLabelAttributes width='660'>
          {intl.$t({ defaultMessage: 'SmartEdge' })}
          <Select options={rolesList} />
        </UI.FieldLabelAttributes>
        <UI.FieldLabelAttributes width='660'>
          {intl.$t({ defaultMessage: 'Guests' })}
          <Select options={rolesList} />
        </UI.FieldLabelAttributes>

        <UI.FieldLabelAttributes width='660'>
          {intl.$t({ defaultMessage: 'Reports' })}
          <Select options={rolesList} />
        </UI.FieldLabelAttributes>

        <UI.FieldLabelAttributes width='660'>
          {intl.$t({ defaultMessage: 'DPSK Managemen' })}
          <Select options={rolesList} />
        </UI.FieldLabelAttributes>

        <UI.FieldLabelAttributes width='660'>
          {intl.$t({ defaultMessage: 'Templates' })}
          <Select options={rolesList} />
        </UI.FieldLabelAttributes>
      </div></>
  }

  const SummaryForm = () => {
    const formValues = form.getFieldsValue(true)

    return <>
      <Subtitle level={3}>{ intl.$t({ defaultMessage: 'Summary' }) }</Subtitle>
      <h4 style={{ marginTop: '15px', marginBottom: '15px' }}>
        { intl.$t({ defaultMessage: 'Network Info' }) }</h4>
      <Form.Item
        label={intl.$t({ defaultMessage: 'Role Name' })}
        children={formValues.name}
      />
      <Form.Item
        label={intl.$t({ defaultMessage: 'Role Description' })}
        children={formValues.description}
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
        }/>
    </>
  }


  return (<>
    <PageHeader
      title={isEditMode
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
