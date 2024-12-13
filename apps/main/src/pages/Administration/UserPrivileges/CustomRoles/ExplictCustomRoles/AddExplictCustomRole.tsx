import { useEffect, useState } from 'react'

import {
  Form,
  Input,
  TreeDataNode
} from 'antd'
import { useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Subtitle,
  Tabs
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
  systemDefinedNameValidator,
  ScopePermission
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { EdgeScopes, RolesEnum, SwitchScopes, WifiScopes } from '@acx-ui/types'

import { AdvancedPermissionsTab } from '../AdvancedPermissionsTab'
import { PermissionsTab }         from '../PermissionsTab'

export function Flat (parent: TreeDataNode | undefined) {
  if (parent) {
    const result: TreeDataNode[] = []
    result.push({ ...parent, children: undefined })
    if ( parent.children) {
      const flatChildren = parent.children.flatMap(child => { return Flat(child) })
      result.push(...flatChildren)
    }
    return result
  }
  return []
}

interface CustomRoleData {
  name?: string,
  description?: string,
  scopes?: string[],
  preDefinedRole?: string
}


const scopeHierarchy: TreeDataNode[] = [
  {
    title: 'Wi-Fi',
    key: '0',
    children: [
      {
        title: 'Venue',
        key: '0-0',
        children: [
          {
            title: 'Wi-Fi',
            key: '0-0-0'
          },
          {
            title: 'Property Management',
            key: '0-0-1'
          }
        ]
      },
      {
        title: 'Wi-Fi',
        key: '0-1',
        children: [
          {
            title: 'Access Points',
            key: '0-1-0'
          },
          {
            title: 'Wi-Fi Networks',
            key: '0-1-1'
          }
        ]
      },
      {
        title: 'Clients',
        key: '0-2',
        children: [
          {
            title: 'Wireless',
            key: '0-2-0'
          },
          {
            title: 'Identity Management',
            key: '0-2-1'
          }
        ]
      },
      {
        title: 'Network Control (Services)',
        key: '0-3',
        children: [
          {
            title: 'DPSK',
            key: '0-3-0'
          },
          {
            title: 'DPSK Passphrases',
            key: '0-3-1'
          },
          {
            title: 'Wi-Fi Calling',
            key: '0-3-2'
          },
          {
            title: 'Guest Portal',
            key: '0-3-3'
          },
          {
            title: 'Resident Portal',
            key: '0-3-4'
          }
        ]
      },
      {
        title: 'Network Control (Policies)',
        key: '0-4',
        children: [
          {
            title: 'Access Control',
            key: '0-4-0'
          },
          {
            title: 'Adaptive Policy',
            key: '0-4-1'
          },
          {
            title: 'Client Isolation',
            key: '0-4-2'
          },
          {
            title: 'Identity Provider',
            key: '0-4-3'
          },
          {
            title: 'MAC Registration List',
            key: '0-4-4'
          },
          {
            title: 'Location Based Service',
            key: '0-4-5'
          },
          {
            title: 'RADIUS Server',
            key: '0-4-6'
          },
          {
            title: 'Rogue AP Detection',
            key: '0-4-7'
          },
          {
            title: 'SNMP Agent',
            key: '0-4-8'
          },
          {
            title: 'Syslog Server',
            key: '0-4-9'
          },
          {
            title: 'VLAN Pool',
            key: '0-4-10'
          },
          {
            title: 'Wi-Fi Operator',
            key: '0-4-11'
          },
          {
            title: 'Workflow',
            key: '0-4-12'
          }
        ]
      }
    ]
  },
  {
    title: 'Wired',
    key: '1',
    children: [
      {
        title: 'Venue',
        key: '1-0',
        children: [
          {
            title: 'Switch',
            key: '1-0-0'
          }
        ]
      },
      {
        title: 'Wired',
        key: '1-1',
        children: [
          {
            title: 'Switches',
            key: '1-1-0'
          },
          {
            title: 'Wired Network Profile',
            key: '1-1-1'
          }
        ]
      },
      {
        title: 'Clients',
        key: '1-2',
        children: [
          {
            title: 'Wired',
            key: '1-2-0'
          }
        ]
      }
    ]
  },
  {
    title: 'SmartEdge',
    key: '2',
    children: [
      {
        title: 'Edge',
        key: '2-0',
        children: [
          {
            title: 'RUCKUS Edge',
            key: '2-0-0'
          },
          {
            title: 'Network Assurance',
            key: '2-0-1'
          }
        ]
      }
    ]
  },
  {
    title: 'Analytics',
    key: '3',
    children: [
      {
        title: 'AI Assurance',
        key: '3-0',
        children: [
          {
            title: 'AI Analytics',
            key: '3-0-0'
          },
          {
            title: 'Network Assurance',
            key: '3-0-1'
          }
        ]
      }
    ]
  },
  {
    title: 'Admin',
    key: '4',
    children: [
      {
        title: 'Administration',
        key: '4-0',
        children: [
          {
            title: 'Timeline',
            key: '4-0-0'
          },
          {
            title: 'Account Management',
            key: '4-0-1'
          },
          {
            title: 'Account Setup',
            key: '4-0-2'
          }
        ]
      }
    ]
  },
  {
    title: 'MSP',
    key: '5',
    children: [
      {
        title: 'MSP Tenant Management',
        key: '5-0',
        children: [
          {
            title: 'Device Inventory',
            key: '5-0-0'
          },
          {
            title: 'Subscription',
            key: '5-0-1'
          },
          {
            title: 'Tempates',
            key: '5-0-2'
          },
          {
            title: 'MSP Portal',
            key: '5-0-3'
          }
        ]
      }
    ]
  }
]

const initialPermissionList: ScopePermission[] = scopeHierarchy.flatMap(s => Flat(s)).map(s => {
  return {
    name: s.title ? s.title.toString() : '',
    id: s.key.toString(),
    read: true,
    create: false,
    update: false,
    delete: false
  }
})

export function AddExplictCustomRole () {
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
        {intl.$t({ defaultMessage: `Set permission for this role at the Global level. 
          Global permissions will enable all of the Advanced` })}<br/>
        {intl.$t({ defaultMessage: `permissions for enabled category. 
          By default all permissions set to Read Only.` })}
      </h5>
      <div style={{ width: 900, height: 600, padding: '20px 0px 16px 0px' }}>
        <PermissionsTechForm />
      </div></>
  }

  const PermissionsTabsContent = (initialScopes: TreeDataNode[], permissionList: ScopePermission[],
    updatePermissionList?: (key: string, permission: string, enabled: boolean) => void) => {
    const { $t } = useIntl()
    const [currentTab, setCurrentTab] = useState('global')

    const tabs = [
      {
        key: 'global',
        title: $t({ defaultMessage: 'Global Permissions' }),
        component:
          <PermissionsTab
            updateSelected={updatePermissionList}
            scopeHierarchy={initialScopes}
            tabScopes={initialScopes.map(s => { return { ...s, children: undefined }})}
            permissions={permissionList}
          />
      },
      {
        key: 'advanced',
        title: $t({ defaultMessage: 'Advanced Permissions' }),
        component:
          <AdvancedPermissionsTab
            updateSelected={updatePermissionList}
            scopes={initialScopes}
            permissions={permissionList}
          />
      }
    ]

    const onTabChange = (tab: string) => {
      setCurrentTab(tab)
    }

    const ActiveTabPane = tabs.find(({ key }) => key === currentTab)?.component

    return <>
      <Tabs
        defaultActiveKey='global'
        activeKey={currentTab}
        onChange={onTabChange}
      >
        {tabs.map(({ key, title }) =>
          <Tabs.TabPane tab={title} key={key} />)}
      </Tabs>
      {ActiveTabPane}
    </>
  }

  const PermissionsTechForm = () => {
    const formPermissions = form.getFieldValue('permissions')
    const [permissionList, setPermissionList] = useState<ScopePermission[]>(formPermissions
      ?? initialPermissionList)

    const updatePermissionList = (key: string, permission: string, enabled: boolean) => {
      const parent = scopeHierarchy.find(sc => sc.key === key ||
        sc.children?.some(child => child.key === key || child.children?.some(cc => cc.key === key)))
      const scopeFamily = parent ? Flat(parent) : []
      const permissions: ScopePermission[] = key === parent?.key
        ? [
          ...permissionList.filter(p => !scopeFamily.map(sc => sc.key).includes(p.id)),
          // Set permission for everyone in the family
          ...permissionList.filter(p => scopeFamily.map(sc => sc.key).includes(p.id))
            .map(perm => { return { ...perm, [permission]: enabled } })
        ]
        : [
          ...permissionList.filter(p => p.id !== parent?.key && p.id !== key),
          // Set permission for the specific scope
          ...permissionList.filter(p => p.id === key)
            .map(perm => { return { ...perm, [permission]: enabled }}),
          // Set permission as true for the parent if all children have that permission enabled
          // and set as false if not
          ...permissionList.filter(p => p.id === parent?.key)
            .map(perm => {
              return {
                ...perm,
                [permission]: !enabled
                  ? enabled
                  : permissionList.filter(p =>
                    scopeFamily.map(sc => sc.key).includes(p.id)
                    && p.id !== parent?.key && p.id !== key)
                    .every(p => p[permission])
              }})
        ]
      setPermissionList(permissions)
      form.setFieldValue('permissions', permissions)
    }

    return <div >
      {PermissionsTabsContent(scopeHierarchy, permissionList, updatePermissionList)}
    </div>
  }

  const SummaryForm = () => {
    const formValues = form.getFieldsValue(true)
    return <>
      <Subtitle level={3}>{ intl.$t({ defaultMessage: 'Summary' }) }</Subtitle>
      <h4 style={{ marginTop: '15px', marginBottom: '15px' }}>
        { intl.$t({ defaultMessage: 'General Information' }) }</h4>
      <Form.Item
        label={intl.$t({ defaultMessage: 'Role Name' })}
        children={formValues.name}
      />
      <Form.Item
        label={intl.$t({ defaultMessage: 'Role Description' })}
        children={formValues.description}
      />
      {PermissionsTabsContent(scopeHierarchy, formValues.permissions)}
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
