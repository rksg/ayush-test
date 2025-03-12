import { useEffect, useState } from 'react'

import {
  Form,
  Input
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Descriptions,
  PageHeader,
  StepsForm,
  Subtitle,
  Tooltip
} from '@acx-ui/components'
import {
  useAddCustomRoleMutation,
  useGetCustomRolesQuery,
  useUpdateCustomRoleMutation
} from '@acx-ui/rc/services'
import {
  CustomGroupType,
  CustomRole,
  specialCharactersRegExp,
  systemDefinedNameValidator
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { EdgeScopes, RolesEnum, SwitchScopes, WifiScopes } from '@acx-ui/types'

import * as UI from '../styledComponents'

interface CustomRoleData {
  name?: string,
  description?: string,
  scopes?: string[],
  preDefinedRole?: string
}

export function AddCustomRole () {
  const intl = useIntl()
  const navigate = useNavigate()
  const { action, customRoleId } = useParams()
  const location = useLocation().state as CustomRole
  const [roleNames, setRoleNames] = useState([] as RolesEnum[])

  const linkToCustomRoles = useTenantLink('/administration/userPrivileges/customRoles', 't')
  const [form] = Form.useForm()

  const { data: roleList } = useGetCustomRolesQuery({})
  useEffect(() => {
    if (roleList) {
      const nameList = roleList.filter(item =>
        item.type === CustomGroupType.CUSTOM && item.name !== location?.name).map(item => item.name)
      setRoleNames(nameList as RolesEnum[])
    }
  }, [roleList])

  const [addCustomRole] = useAddCustomRoleMutation()
  const [updateCustomRole] = useUpdateCustomRoleMutation()

  const isEditMode = action === 'edit'
  const isClone = action === 'clone'
  const clonePreDefinedRole = location?.preDefinedRole ? location?.preDefinedRole
    : ((isClone && location?.name && location?.type === CustomGroupType.SYSTEM) ? location.name
      : undefined)

  const wifiScopes = [
    WifiScopes.READ, WifiScopes.CREATE,
    WifiScopes.UPDATE, WifiScopes.DELETE
  ]
  const switchScopes = [
    SwitchScopes.READ, SwitchScopes.CREATE,
    SwitchScopes.UPDATE, SwitchScopes.DELETE
  ]
  const edgeScopes = [
    EdgeScopes.READ, EdgeScopes.CREATE,
    EdgeScopes.UPDATE, EdgeScopes.DELETE
  ]

  let scopes: Array<string> = []
  wifiScopes.map(item => scopes.push(item))
  switchScopes.map(item => scopes.push(item))
  edgeScopes.map(item => scopes.push(item))

  const handleAddRole = async () => {
    const name = form.getFieldValue('name')
    const description = form.getFieldValue('description')
    try {
      await form.validateFields()
      const checkedScopes = scopes.filter((s) => form.getFieldValue(s))
      const roleData: CustomRoleData = {
        name: name,
        description: description,
        scopes: checkedScopes,
        preDefinedRole: clonePreDefinedRole || RolesEnum.READ_ONLY
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

  useEffect(() => {
    if (location && (isEditMode || isClone)) {
      form.setFieldValue('name', isClone ? (location?.name + ' - copy') : location?.name)
      form.setFieldValue('description', location?.description)
    }
    if (location && location?.scopes && (isEditMode || isClone)) {
      const scopes = location.scopes
      scopes.map(s => form.setFieldValue(s, true))
    }
    form.setFieldValue(WifiScopes.READ, true)
    form.setFieldValue(SwitchScopes.READ, true)
    form.setFieldValue(EdgeScopes.READ, true)
  }, [form, location])

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
            { required: true },
            { min: 2 },
            { max: 128 },
            { validator: (_, value) => {
              if(roleNames.includes(value)) {
                return Promise.reject(
                  `${intl.$t({ defaultMessage: 'Name already exists' })} `
                )
              }
              return Promise.resolve()}
            },
            { validator: (_, value) => systemDefinedNameValidator(value) },
            { validator: (_, value) => specialCharactersRegExp(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='description'
          label={intl.$t({ defaultMessage: 'Role Description' })}
          style={{ width: '300px' }}
          rules={[
            { max: 180 }
          ]}
          children={
            <Input.TextArea rows={4} />
          }
        />
      </StepsForm.StepForm>

      <StepsForm.StepForm
        name='permissions'
        key='permissions'
        title={intl.$t({ defaultMessage: 'Permissions' })}
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
      <div style={{ width: 697, height: 432, backgroundColor: '#F2F2F2',
        padding: '20px 0px 16px 0px' }}>

        <PermissionsTechForm />
      </div></>
  }

  const PermissionsTechForm = () => {
    return <div >
      <UI.FieldLabelPermission width='270'>
        <label></label>
        <label>{intl.$t({ defaultMessage: 'Read' })}</label>
        <label>{intl.$t({ defaultMessage: 'Create' })}</label>
        <label>{intl.$t({ defaultMessage: 'Update' })}</label>
        <label>{intl.$t({ defaultMessage: 'Delete' })}</label>
      </UI.FieldLabelPermission>

      <UI.FieldLabelAttributes width='660'>
        <div className='grid-item'>
          <label style={{ width: '36px', marginLeft: '10px' }}>
            {intl.$t({ defaultMessage: 'Wi-Fi' })}</label>
          <Tooltip.Question iconStyle={{ width: '20px' }}
            title={<>
              <div style={{ fontWeight: 800 }}>
                {intl.$t({ defaultMessage: 'What is included?' })}</div>
              <div>{intl.$t({ defaultMessage: '<VenueSingular></VenueSingular> Management' })}</div>
              <div >{intl.$t({ defaultMessage: 'AI Assurance' })}</div>
              <div >{intl.$t({ defaultMessage: 'Access Points' })}</div>
              <div >{intl.$t({ defaultMessage: 'Wi-Fi Networks' })}</div>
              <div >{intl.$t({ defaultMessage: 'Wireless Clients' })}</div>
              <div >{intl.$t({ defaultMessage: 'Wi-Fi Network Control' })}</div>
              <div >{intl.$t({ defaultMessage: 'Wi-Fi Reports' })}</div>
              <div >{intl.$t({ defaultMessage: 'Wi-Fi Version Management' })}</div>
            </>}
            placement='right'
          />
        </div>

        <Form.Item
          name={WifiScopes.READ}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox disabled={true} />
        </Form.Item>

        <Form.Item
          name={WifiScopes.CREATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox />
        </Form.Item>

        <Form.Item
          name={WifiScopes.UPDATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox />
        </Form.Item>

        <Form.Item
          name={WifiScopes.DELETE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox />
        </Form.Item>
      </UI.FieldLabelAttributes>

      <UI.FieldLabelAttributes width='660'>
        <div className='grid-item'>
          <label style={{ width: '42px', marginLeft: '10px' }}>
            {intl.$t({ defaultMessage: 'Wired' })}</label>
          <Tooltip.Question iconStyle={{ width: '20px' }}
            title={<>
              <div style={{ fontWeight: 800 }}>
                {intl.$t({ defaultMessage: 'What is included?' })}</div>
              <div>{intl.$t({ defaultMessage: '<VenueSingular></VenueSingular> Management' })}</div>
              <div >{intl.$t({ defaultMessage: 'Switches' })}</div>
              <div >{intl.$t({ defaultMessage: 'Wired Clients' })}</div>
              <div >{intl.$t({ defaultMessage: 'Switch Network Control' })}</div>
              <div >{intl.$t({ defaultMessage: 'Switch Reports' })}</div>
              <div >{intl.$t({ defaultMessage: 'Switch Version Management' })}</div>
            </>}
            placement='right'
          />
        </div>

        <Form.Item
          name={SwitchScopes.READ}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox disabled={true} />
        </Form.Item>

        <Form.Item
          name={SwitchScopes.CREATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox />
        </Form.Item>

        <Form.Item
          name={SwitchScopes.UPDATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox />
        </Form.Item>

        <Form.Item
          name={SwitchScopes.DELETE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox />
        </Form.Item>
      </UI.FieldLabelAttributes>

      <UI.FieldLabelAttributes width='660'>
        <div className='grid-item'>
          <label style={{ width: '68px', marginLeft: '10px' }}>
            {intl.$t({ defaultMessage: 'RUCKUS Edge' })}</label>
          <Tooltip.Question iconStyle={{ width: '20px' }}
            title={<>
              <div style={{ fontWeight: 800 }}>
                {intl.$t({ defaultMessage: 'What is included?' })}</div>
              <div>{intl.$t({ defaultMessage: '<VenueSingular></VenueSingular> Management' })}</div>
              <div >{intl.$t({ defaultMessage: 'RUCKUS Edge Devices' })}</div>
              <div >{intl.$t({ defaultMessage: 'RUCKUS Edge Network Control' })}</div>
              <div >{intl.$t({ defaultMessage: 'RUCKUS Edge Version Management' })}</div>
            </>}
            placement='right'
          />
        </div>

        <Form.Item
          name={EdgeScopes.READ}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox disabled={true} />
        </Form.Item>

        <Form.Item
          name={EdgeScopes.CREATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox />
        </Form.Item>

        <Form.Item
          name={EdgeScopes.UPDATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox />
        </Form.Item>

        <Form.Item
          name={EdgeScopes.DELETE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <UI.PermissionCheckbox />
        </Form.Item>
      </UI.FieldLabelAttributes>

    </div>
  }

  const GetPermissionList = (prefix: string) => {
    let permissions: Array<string> = []
    const filteredScopes = scopes.filter(s => s.includes(prefix))
    filteredScopes.forEach(s => {
      if(form.getFieldValue(s)) {
        switch(s.charAt(s.indexOf('-') + 1)) {
          case 'r':
            permissions.push('Read')
            break
          case 'c':
            permissions.push('Create')
            break
          case 'u':
            permissions.push('Update')
            break
          case 'd':
            permissions.push('Delete')
            break
        }
      }
    })
    return permissions.join(', ')
  }

  const SummaryForm = () => {
    const formValues = form.getFieldsValue(true)
    const wifiPermissions = GetPermissionList('wifi')
    const wiredPermissions = GetPermissionList('switch')
    const smartEdgePermissions = GetPermissionList('edge')

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
              children={wifiPermissions} />

            <Descriptions.Item
              label={intl.$t({ defaultMessage: 'Wired' })}
              labelStyle={{ fontWeight: 800 }}
              children={wiredPermissions} />

            <Descriptions.Item
              label={intl.$t({ defaultMessage: 'RUCKUS Edge' })}
              labelStyle={{ fontWeight: 800 }}
              children={smartEdgePermissions} />

          </Descriptions>
        }/>
    </>
  }

  return (<>
    <PageHeader
      title={isEditMode
        ? intl.$t({ defaultMessage: 'Edit Admin Role' })
        : isClone ? intl.$t({ defaultMessage: 'Clone Admin Role' })
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
