import { useEffect, useState } from 'react'

import {
  Form,
  Input
} from 'antd'
import _           from 'lodash'
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
  useUpdateCustomRoleMutation
} from '@acx-ui/rc/services'
import {
  CustomRole,
  systemDefinedNameValidator
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { EdgeScopes, SwitchScopes, WifiScopes } from '@acx-ui/user'

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
  const isClone = action === 'clone'

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
    if (location && (isEditMode || isClone)) {
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
            { required: true },
            { min: 2 },
            { max: 64 },
            { validator: (_, value) => systemDefinedNameValidator(value) }
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
    const [wifiAttribute, setWifiAttribute] =
      useState(form.getFieldValue(WifiScopes.READ) ?? false)
    const [wiredAttribute, setWiredAttribute] =
      useState(form.getFieldValue(SwitchScopes.READ) ?? false)
    const [smartedgeAttribute, setSmartedgeAttribute] =
      useState(form.getFieldValue(EdgeScopes.READ) ?? false)

    useEffect(() => {
      if (location && location?.scopes && (isEditMode || isClone)) {
        const scopes = location.scopes
        scopes.map(s => form.setFieldValue(s, true))
        setWifiAttribute(scopes.find(a =>a.includes('wifi')) ? true : false )
        setWiredAttribute(scopes.find(a =>a.includes('switch')) ? true : false)
        setSmartedgeAttribute(scopes.find(a =>a.includes('edge')) ? true : false)
      }
    }, [form, location])

    // wi-fi
    const OnWifiAttributeChange = (checked: boolean) => {
      setWifiAttribute(checked)
      form.setFieldsValue(_.reduce(wifiScopes , (obj, item) => {
        obj[item] = checked
        return obj
      }, {} as Record<WifiScopes, boolean>))
    }

    const OnWifiReadChange = (checked: boolean) => {
      form.setFieldValue(WifiScopes.READ, checked)
      if (!checked) {
        wifiScopes.map(item =>
          item !== WifiScopes.READ ? form.setFieldValue(item, false) : null
        )
      }
    }

    const OnWifiNonReadChange = (checked: boolean) => {
      if (checked) {
        form.setFieldValue(WifiScopes.READ, true)
      }
    }

    // switch
    const OnWiredAttributeChange = (checked: boolean) => {
      setWiredAttribute(checked)
      form.setFieldsValue(_.reduce(switchScopes , (obj, item) => {
        obj[item] = checked
        return obj
      }, {} as Record<SwitchScopes, boolean>))
    }

    const OnWiredReadChange = (checked: boolean) => {
      form.setFieldValue(SwitchScopes.READ, checked)
      if (!checked) {
        switchScopes.map(item =>
          item !== SwitchScopes.READ ? form.setFieldValue(item, false) : null
        )
      }
    }

    const OnWiredNonReadChange = (checked: boolean) => {
      if (checked) {
        form.setFieldValue(SwitchScopes.READ, true)
      }
    }

    // smart edge
    const OnSmartEdgeAttributeChange = (checked: boolean) => {
      setSmartedgeAttribute(checked)
      form.setFieldsValue(_.reduce(edgeScopes , (obj, item) => {
        obj[item] = checked
        return obj
      }, {} as Record<EdgeScopes, boolean>))
    }

    const OnSmartEdgeReadChange = (checked: boolean) => {
      form.setFieldValue(EdgeScopes.READ, checked)
      if (!checked) {
        edgeScopes.map(item =>
          item !== EdgeScopes.READ ? form.setFieldValue(item, false) : null
        )
      }
    }

    const OnSmartEdgeNonReadChange = (checked: boolean) => {
      if (checked) {
        form.setFieldValue(EdgeScopes.READ, true)
      }
    }

    return <div >
      <UI.FieldLabelPermission width='270'>
        <label></label>
        <label>{intl.$t({ defaultMessage: 'Read' })}</label>
        <label>{intl.$t({ defaultMessage: 'Create' })}</label>
        <label>{intl.$t({ defaultMessage: 'Update' })}</label>
        <label>{intl.$t({ defaultMessage: 'Delete' })}</label>
      </UI.FieldLabelPermission>

      <UI.FieldLabelAttributes width='660'>
        <div className='grid-item'><Input type='checkbox'
          checked={wifiAttribute}
          onChange={(e)=>OnWifiAttributeChange(e.target.checked)}
        />
        <label style={{ width: '36px' }}>{intl.$t({ defaultMessage: 'Wi-Fi' })}</label>
        <Tooltip.Question iconStyle={{ width: '20px' }}
          title={<>
            <div style={{ fontWeight: 800 }}>
              {intl.$t({ defaultMessage: 'What is included?' })}</div>
            <div >{intl.$t({ defaultMessage: 'Venue Management' })}</div>
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
          <Input type='checkbox'
            hidden={!wifiAttribute}
            onChange={(e)=>OnWifiReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name={WifiScopes.CREATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <Input type='checkbox'
            hidden={!wifiAttribute}
            onChange={(e)=>OnWifiNonReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name={WifiScopes.UPDATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <Input type='checkbox'
            hidden={!wifiAttribute}
            onChange={(e)=>OnWifiNonReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name={WifiScopes.DELETE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <Input type='checkbox'
            hidden={!wifiAttribute}
            onChange={(e)=>OnWifiNonReadChange(e.target.checked)}
          />
        </Form.Item>
      </UI.FieldLabelAttributes>

      <UI.FieldLabelAttributes width='660'>
        <div className='grid-item'><Input type='checkbox'
          checked={wiredAttribute}
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
          name={SwitchScopes.READ}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <Input type='checkbox'
            hidden={!wiredAttribute}
            onChange={(e)=>OnWiredReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name={SwitchScopes.CREATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <Input type='checkbox'
            hidden={!wiredAttribute}
            onChange={(e)=>OnWiredNonReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name={SwitchScopes.UPDATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <Input type='checkbox'
            hidden={!wiredAttribute}
            onChange={(e)=>OnWiredNonReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name={SwitchScopes.DELETE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <Input type='checkbox'
            hidden={!wiredAttribute}
            onChange={(e)=>OnWiredNonReadChange(e.target.checked)}
          />
        </Form.Item>

      </UI.FieldLabelAttributes>

      <UI.FieldLabelAttributes width='660'>
        <div className='grid-item'><Input type='checkbox'
          checked={smartedgeAttribute}
          onChange={(e)=>OnSmartEdgeAttributeChange(e.target.checked)}
        />
        <label style={{ width: '68px' }}>{intl.$t({ defaultMessage: 'SmartEdge' })}</label>
        <Tooltip.Question iconStyle={{ width: '20px' }}
          // eslint-disable-next-line max-len
          title={<>
            <div style={{ fontWeight: 800 }}>
              {intl.$t({ defaultMessage: 'What is included?' })}</div>
            <div >{intl.$t({ defaultMessage: 'Venue Management' })}</div>
            <div >{intl.$t({ defaultMessage: 'SmartEdge Devices' })}</div>
            <div >{intl.$t({ defaultMessage: 'SmartEdge Network Control' })}</div>
            <div >{intl.$t({ defaultMessage: 'SmartEdge Version Management' })}</div>
          </>}
          placement='right'
        />
        </div>

        <Form.Item
          name={EdgeScopes.READ}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <Input type='checkbox'
            hidden={!smartedgeAttribute}
            onChange={(e)=>OnSmartEdgeReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name={EdgeScopes.CREATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <Input type='checkbox'
            hidden={!smartedgeAttribute}
            onChange={(e)=>OnSmartEdgeNonReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name={EdgeScopes.UPDATE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <Input type='checkbox'
            hidden={!smartedgeAttribute}
            onChange={(e)=>OnSmartEdgeNonReadChange(e.target.checked)}
          />
        </Form.Item>

        <Form.Item
          name={EdgeScopes.DELETE}
          className='grid-item'
          valuePropName='checked'
          initialValue={false}>
          <Input type='checkbox'
            hidden={!smartedgeAttribute}
            onChange={(e)=>OnSmartEdgeNonReadChange(e.target.checked)}
          />
        </Form.Item>

      </UI.FieldLabelAttributes>

      <Form.Item
        name='permissions-validation'
        style={{ padding: '0px 20px', margin: '-20px 0px' }}
        rules={[
          { validator: () => {
            if (!form.getFieldValue(WifiScopes.READ) &&
            !form.getFieldValue(SwitchScopes.READ) &&
            !form.getFieldValue(EdgeScopes.READ)) {
              return Promise.reject(intl.$t({ defaultMessage: 'Please select permission(s)' }))
            }
            return Promise.resolve()
          }
          }
        ]}
        validateFirst />
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
