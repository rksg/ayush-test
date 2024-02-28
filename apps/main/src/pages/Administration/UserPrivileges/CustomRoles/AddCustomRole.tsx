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
import { useAddCustomRoleMutation, useUpdateCustomRoleMutation } from '@acx-ui/rc/services'
import { CustomRole }                                            from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'

import * as UI from '../styledComponents'

interface CustomRoleData {
  name?: string,
  description?: string,
  scopes?: string[]
}

export function AddCustomRole () {
  const intl = useIntl()
  const navigate = useNavigate()
  const { action, customRoleId } = useParams()
  const location = useLocation().state as CustomRole

  const linkToCustomRoles = useTenantLink('/administration/userPrivileges/customRoles', 't')
  const [form] = Form.useForm()

  const [addCustomRole] = useAddCustomRoleMutation()
  const [updateCustomRole] = useUpdateCustomRoleMutation()

  const isEditMode = action === 'edit'

  const permissions = [ 'wifi', 'wired', 'smartEdge' ]
  let scopes: Array<string> = []
  permissions.forEach(p => {
    scopes.push(p + '-read')
    scopes.push(p + '-create')
    scopes.push(p + '-update')
    scopes.push(p + '-delete')
  })

  const handleAddRole = async () => {
    const name = form.getFieldValue('name')
    const description = form.getFieldValue('description')
    try {
      await form.validateFields()
      const checkedScopes: Array<string> = []
      scopes.forEach(s => {
        if (form.getFieldValue(s)) {
          checkedScopes.push(s.slice(0, s.indexOf('-') + 2))
        }
      })
      const roleData: CustomRoleData = {
        name: name,
        description: description,
        scopes: checkedScopes
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
    if (location && (isEditMode || action === 'clone')) {
      form.setFieldValue('name', location?.name)
      form.setFieldValue('description', location?.description)
    }
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
            { required: true }
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
    const [wifiAttribute, setWifiAttribute] = useState(false)
    const [wiredAttribute, setWiredAttribute] = useState(false)
    const [smartedgeAttribute, setSmartedgeAttribute] = useState(false)

    const OnWifiAttributeChange = (checked: boolean) => {
      setWifiAttribute(checked)
      form.setFieldValue('wifi-read', checked)
      form.setFieldValue('wifi-create', checked)
      form.setFieldValue('wifi-update', checked)
      form.setFieldValue('wifi-delete', checked)
    }

    const OnWifiReadChange = (checked: boolean) => {
      form.setFieldValue('wifi-read', checked)
      if (!checked) {
        form.setFieldValue('wifi-create', false)
        form.setFieldValue('wifi-update', false)
        form.setFieldValue('wifi-delete', false)
      }
    }

    const OnWiredAttributeChange = (checked: boolean) => {
      setWiredAttribute(checked)
      form.setFieldValue('wired-read', checked)
      form.setFieldValue('wired-create', checked)
      form.setFieldValue('wired-update', checked)
      form.setFieldValue('wired-delete', checked)
    }

    const OnWiredReadChange = (checked: boolean) => {
      form.setFieldValue('wired-read', checked)
      if (!checked) {
        form.setFieldValue('wired-create', false)
        form.setFieldValue('wired-update', false)
        form.setFieldValue('wired-delete', false)
      }
    }

    const OnSmartEdgeAttributeChange = (checked: boolean) => {
      setSmartedgeAttribute(checked)
      form.setFieldValue('smartEdge-read', checked)
      form.setFieldValue('smartEdge-create', checked)
      form.setFieldValue('smartEdge-update', checked)
      form.setFieldValue('smartEdge-delete', checked)
    }

    const OnSmartEdgeReadChange = (checked: boolean) => {
      form.setFieldValue('smartEdge-read', checked)
      if (!checked) {
        form.setFieldValue('smartEdge-create', false)
        form.setFieldValue('smartEdge-update', false)
        form.setFieldValue('smartEdge-delete', false)
      }
    }

    return <div >
      <UI.FieldLabelPermission width='270'>
        <label></label>
        <label>Read</label>
        <label>Create</label>
        <label>Update</label>
        <label>Delete</label>
      </UI.FieldLabelPermission>

      <UI.FieldLabelAttributes width='660'>
        <div className='grid-item'><Input type='checkbox'
          onChange={(e)=>OnWifiAttributeChange(e.target.checked)}
        />
        <label style={{ width: '36px' }}>{intl.$t({ defaultMessage: 'Wi-Fi' })}</label>
        <Tooltip.Question iconStyle={{ width: '20px' }}
          title={<>
            <div style={{ fontWeight: 800 }}>
              {intl.$t({ defaultMessage: 'What is included?' })}</div>
            <div >{intl.$t({ defaultMessage: 'Access Points' })}</div>
            <div >{intl.$t({ defaultMessage: 'Venue Management' })}</div>
            <div >{intl.$t({ defaultMessage: 'AI Assurance' })}</div>
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
          name='wifi-read'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!wifiAttribute}
            onChange={(e)=>OnWifiReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name='wifi-create'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!wifiAttribute}
          />
        </Form.Item>

        <Form.Item
          name='wifi-update'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!wifiAttribute}
          />
        </Form.Item>

        <Form.Item
          name='wifi-delete'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!wifiAttribute}
          />
        </Form.Item>
      </UI.FieldLabelAttributes>

      <UI.FieldLabelAttributes width='660'>
        <div className='grid-item'><Input type='checkbox'
          onChange={(e)=>OnWiredAttributeChange(e.target.checked)}
        />
        <label style={{ width: '42px' }}>{intl.$t({ defaultMessage: 'Wired' })}</label>
        <Tooltip.Question iconStyle={{ width: '20px' }}
          title={<>
            <div style={{ fontWeight: 800 }}>
              {intl.$t({ defaultMessage: 'What is included?' })}</div>
            <div >{intl.$t({ defaultMessage: 'Venue Management' })}</div>
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
          name='wired-read'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!wiredAttribute}
            onChange={(e)=>OnWiredReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name='wired-create'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!wiredAttribute}
          />
        </Form.Item>

        <Form.Item
          name='wired-update'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!wiredAttribute}
          />
        </Form.Item>

        <Form.Item
          name='wired-delete'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!wiredAttribute}
          />
        </Form.Item>

      </UI.FieldLabelAttributes>

      <UI.FieldLabelAttributes width='660'>
        <div className='grid-item'><Input type='checkbox'
          onChange={(e)=>OnSmartEdgeAttributeChange(e.target.checked)}
        />
        <label style={{ width: '68px' }}>{intl.$t({ defaultMessage: 'SmartEdge' })}</label>
        <Tooltip.Question iconStyle={{ width: '20px' }}
          // eslint-disable-next-line max-len
          title={<>
            <div style={{ fontWeight: 800 }}>
              {intl.$t({ defaultMessage: 'What is included?' })}</div>
            <div >{intl.$t({ defaultMessage: 'Access Points' })}</div>
            <div >{intl.$t({ defaultMessage: 'Venue Management' })}</div>
            <div >{intl.$t({ defaultMessage: 'AI Assurance' })}</div>
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
          name='smartEdge-read'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!smartedgeAttribute}
            onChange={(e)=>OnSmartEdgeReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name='smartEdge-create'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!smartedgeAttribute}
          />
        </Form.Item>

        <Form.Item
          name='smartEdge-update'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!smartedgeAttribute}
          />
        </Form.Item>

        <Form.Item
          name='smartEdge-delete'
          className='grid-item'
          valuePropName='checked'>
          <Input type='checkbox'
            hidden={!smartedgeAttribute}
          />
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
          default:
            return
        }
      }
    })
    return permissions.length === 0 ? 'No Access' : permissions.join(', ')
  }

  const SummaryForm = () => {
    const formValues = form.getFieldsValue(true)
    const wifiPermissions = GetPermissionList('wifi')
    const wiredPermissions = GetPermissionList('wired')
    const smartEdgePermissions = GetPermissionList('smartEdge')

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
              label={intl.$t({ defaultMessage: 'SmartEdge' })}
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
