import { useState } from 'react'

import {
  Checkbox,
  Form,
  Input,
  Radio
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Descriptions,
  PageHeader,
  StepsForm,
  Subtitle
} from '@acx-ui/components'
import { useAddCustomRoleMutation, useUpdateCustomRoleMutation } from '@acx-ui/rc/services'
import { CustomRole }                                            from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

import * as UI from '../styledComponents'

import PermissionSelector from './PermissionSelector'

interface CustomRoleData {
  name?: string,
  description?: string
}

export function AddCustomRole () {
  const intl = useIntl()
  const navigate = useNavigate()
  const { action, customRoleId } = useParams()
  const location = useLocation().state as CustomRole

  const linkToCustomRoles = useTenantLink('/administration/userPrivileges/customRoles', 't')
  const [form] = Form.useForm()
  const [selectedPermission, setSelectedPermission] = useState('')
  const [addCustomRole] = useAddCustomRoleMutation()
  const [updateCustomRole] = useUpdateCustomRoleMutation()

  const isEditMode = action === 'view' || action === 'edit'
  const handleAddRole = async () => {
    const name = form.getFieldValue('name')
    const description = form.getFieldValue('description')
    try {
      await form.validateFields()
      const roleData: CustomRoleData = {
        name: name,
        description: description
      }
      if(isEditMode) {
        await updateCustomRole({ params: { customRoleId: customRoleId },
          payload: roleData }).unwrap()
      } else {
        await addCustomRole({ payload: roleData }).unwrap()
      }

      navigate(linkToCustomRoles)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
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

    return <>
      <Subtitle level={3}>{ intl.$t({ defaultMessage: 'Permissions' }) }</Subtitle>
      <h5>
        {intl.$t({ defaultMessage: 'Set the permissions for this role:' })}
      </h5>
      <div style={{ width: 758, height: 432, backgroundColor: '#F2F2F2',
        padding: '20px 40px 20px 20px' }}>

        <PermissionSelector
          // ssoConfigured={isSsoConfigured}
          setSelected={setSelectedPermission}
        />
        {selectedPermission === 'byTechnology'
          ? <PermissionsTechForm />
          : <PermissionsExpertiseForm />}

      </div></>
  }

  const PermissionsTechForm = () => {
    return <div >
      <UI.FieldLabelPermission width='270'>
        <label></label>
        <label>Read</label>
        <label>Create</label>
        <label>Update</label>
        <label>Delete</label>
      </UI.FieldLabelPermission>

      <UI.FieldLabelAttributes width='660'>
        <Checkbox style={{ width: 400 }}>
          {intl.$t({ defaultMessage: 'Wi-Fi' })}
        </Checkbox>
        <Checkbox></Checkbox>
        <Checkbox></Checkbox>
        <Checkbox></Checkbox>
        <Checkbox></Checkbox>
      </UI.FieldLabelAttributes>

      <UI.FieldLabelAttributes width='660'>
        <Checkbox style={{ width: 400 }}>
          {intl.$t({ defaultMessage: 'Wired' })}
        </Checkbox>
        <Checkbox></Checkbox>
        <Checkbox></Checkbox>
        <Checkbox></Checkbox>
        <Checkbox></Checkbox>
      </UI.FieldLabelAttributes>

      <UI.FieldLabelAttributes width='660'>
        <Checkbox style={{ width: 400 }}>
          {intl.$t({ defaultMessage: 'SmartEdge' })}
        </Checkbox>
        <Checkbox></Checkbox>
        <Checkbox></Checkbox>
        <Checkbox></Checkbox>
        <Checkbox></Checkbox>
      </UI.FieldLabelAttributes>
    </div>
  }

  const PermissionsExpertiseForm = () => {
    return <div style={{ marginTop: '15px' }}>

      <UI.FieldLabel2Attributes width='660'>
        <Radio>
          <div>{intl.$t({ defaultMessage: 'Guests Experience' })}</div>
          <div>
            {intl.$t({ defaultMessage:
            'Has full control access to guest pass credentials list, all other areas are hidden' })}
          </div>
        </Radio>
      </UI.FieldLabel2Attributes>

      <UI.FieldLabel2Attributes width='660'>
        <Radio>
          <div>{intl.$t({ defaultMessage: 'Reports' })}</div>
          <div>
            {intl.$t({ defaultMessage:
            'Has full control access to the reports area, all other areas are hidden' })}
          </div>
        </Radio>
      </UI.FieldLabel2Attributes>

      <UI.FieldLabel2Attributes width='660'>
        <Radio>
          <div>{intl.$t({ defaultMessage: 'DPSK Management' })}</div>
          <div>
            {intl.$t({ defaultMessage:
            'Has full control access to DPSK  credentials list, all other areas are hidden' })}
          </div>
        </Radio>
      </UI.FieldLabel2Attributes>

      <UI.FieldLabel2Attributes width='660'>
        <Radio>
          <div>{intl.$t({ defaultMessage: 'Templates Management' })}</div>
          <div>
            {intl.$t({ defaultMessage:
            'Has full control access to templates, all other areas are Read-Only' })}
          </div>
        </Radio>
      </UI.FieldLabel2Attributes>

    </div>
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
