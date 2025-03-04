import { useEffect, useState } from 'react'

import {
  Form,
  Input,
  TreeDataNode
} from 'antd'
import { IntlShape, useIntl } from 'react-intl'

import {
  PageHeader,
  StepsForm,
  Subtitle,
  Tabs
} from '@acx-ui/components'
import {
  useAddCustomRoleMutation,
  useGetCustomRoleFeaturesQuery,
  useGetCustomRolesQuery,
  useUpdateCustomRoleMutation
} from '@acx-ui/rc/services'
import {
  CustomGroupType,
  CustomRole,
  specialCharactersRegExp,
  systemDefinedNameValidator,
  ScopePermission,
  PermissionType,
  ScopeFeature
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { RolesEnum } from '@acx-ui/types'

import { AdvancedPermissionsTab } from './AdvancedPermissionsTab'
import { PermissionsTab }         from './PermissionsTab'

export function Flat (parent: TreeDataNode | undefined) {
  if (parent) {
    const result: TreeDataNode[] = []
    result.push({ ...parent, children: undefined })
    if (parent.children) {
      const flatChildren = parent.children.flatMap(child => { return Flat(child) })
      result.push(...flatChildren)
    }
    return result
  }
  return []
}

function getHierarchy ($t: IntlShape['$t'], scopeList: ScopeFeature[] | undefined) {
  if (scopeList) {
    return scopeList.map(s => {
      const result = {
        title: $t({ defaultMessage: '{title}' }, { title: s.description }),
        key: s.name.split('-')[0]
      } as TreeDataNode
      const childrenList = getHierarchy($t, s.subFeatures)
      if (childrenList.length > 0) {
        result.children = childrenList
      }
      return result
    })
  }
  return []
}

interface CustomRoleData {
  name?: string,
  description?: string,
  features?: string[],
  preDefinedRole?: string
}

export function AddExplicitCustomRole () {
  const intl = useIntl()
  const navigate = useNavigate()
  const { action, customRoleId } = useParams()
  const location = useLocation().state as CustomRole
  const [roleNames, setRoleNames] = useState([] as RolesEnum[])

  const { data: scopeTree } = useGetCustomRoleFeaturesQuery({})

  const scopeHierarchy =
    getHierarchy(intl.$t, scopeTree?.filter(s => s.name.split('-')[1] === PermissionType.read))

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

  const getSelectedScopesForPermission =
  (scope: TreeDataNode[], scopePerms: ScopePermission[], permission: string) => {
    const selectedScopes: string[] = []
    scope.forEach(s => {
      const scopePermission = scopePerms.find(p => p.id === s.key)
      // Only include parent if parent is selected
      if (scopePermission && scopePermission[permission]) {
        selectedScopes
          .push(s.key.toString() + '-' + PermissionType[permission as keyof typeof PermissionType])
      }
      // Otherwise include selected children
      else if (s.children) {
        selectedScopes.push(...getSelectedScopesForPermission(s.children, scopePerms, permission))
      }
    })
    return selectedScopes
  }

  const getSelectedScopes = (permissions: ScopePermission[]) => {
    const scopes: string[] = []
    Object.keys(PermissionType).forEach(key => {
      scopes.push(...getSelectedScopesForPermission(scopeHierarchy, permissions, key))
    })
    return scopes
  }

  const updateRelatedPermissions =
  (key: string, permission: string, enabled: boolean, permissionList: ScopePermission[]) => {
    const scope = scopeHierarchy.find(sc => sc.key === key) ||
      scopeHierarchy.flatMap(sc => sc.children).find(c => c?.key === key) ||
      scopeHierarchy.flatMap(sc => sc.children).flatMap(c => c?.children)
        .find(cc => cc?.key === key)
    if (!scope || permission === '') {
      return []
    }
    const scopeAndChildren = scope.children ? Flat(scope) : [scope]
    const globalParent = scopeHierarchy.find(sc => sc.key === key ||
        sc.children?.some(c => c.key === key || c.children?.some(cc => cc.key === key)))
    const parent = scopeHierarchy.flatMap(sc => sc.children)
      .find(c => c?.children?.some(cc => cc.key === key))
    const parents = [ parent, globalParent ].filter(p => p !== undefined && p.key !== key)

    const permissions: ScopePermission[] = []
    // Everything except this scope, its children, and its parents are unchanged
    permissions.push(...permissionList.filter(p =>
      !scopeAndChildren.map(sc => sc.key).includes(p.id)
      && !parents.map(sc => sc?.key).includes(p.id)))
    // Set permission for this scope and all its children if any
    permissions.push(...permissionList.filter(p =>scopeAndChildren.map(s => s.key).includes(p.id))
      .map(perm => { return { ...perm, [permission]: enabled } }))
    // Set permission as true for any parents if all their children have that permission enabled
    // and set as false if not
    // (Important that parent comes before globalParent in the parents array so that parent permission is set first)
    parents.forEach(parent => {
      const perm = permissionList.find(p => p.id === parent?.key)
      if (!parent || !perm) {
        return
      }
      permissions.push({
        ...perm,
        [permission]: !enabled
          ? enabled
          : permissions.filter(p =>
            Flat(parent).map(sc => sc.key).includes(p.id) && p.id !== parent.key)
            .every(p => p[permission])
      })
    })
    return permissions
  }

  const handleAddRole = async () => {
    const name = form.getFieldValue('name')
    const description = form.getFieldValue('description')
    try {
      await form.validateFields()
      const checkedScopes = getSelectedScopes(form.getFieldValue('permissions') ?? [])
      const roleData: CustomRoleData = {
        name: name,
        description: description,
        features: checkedScopes,
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
    if (location && location?.features && (isEditMode || isClone)) {
      let permissions: ScopePermission[] = initialPermissionList
      location.features.forEach(s => {
        const id = s.split('-')[0]
        const perm = Object.keys(PermissionType)
          .find(key => PermissionType[key as keyof typeof PermissionType] === s.split('-')[1]) ?? ''
        const updatedPerms = updateRelatedPermissions(id, perm, true, permissions)
        permissions = updatedPerms
      })
      form.setFieldValue('permissions', permissions)
    }
  }, [form, location, initialPermissionList])

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
    return <div style={{ width: 900, height: 600, padding: '20px 0px 16px 0px' }}>
      <Subtitle level={3}>{ intl.$t({ defaultMessage: 'Permissions' }) }</Subtitle>
      <h5 style={{ color: '#7f7f7f' }}>
        {intl.$t({ defaultMessage: `Set permission for this role at the Global level. 
          Global permissions will enable all of the Advanced ` })}<br/>
        {intl.$t({ defaultMessage: `permissions for enabled category. By default all permissions 
          set to Read Only.` })}
      </h5>
      <PermissionsTechForm />
    </div>
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
      const permissions = updateRelatedPermissions(key, permission, enabled, permissionList)
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
      <Subtitle level={3}>{ intl.$t({ defaultMessage: 'General Information' }) }</Subtitle>
      <Form.Item
        label={intl.$t({ defaultMessage: 'Role Name' })}
        children={formValues.name}
      />
      <Form.Item
        label={intl.$t({ defaultMessage: 'Role Description' })}
        children={formValues.description}
      />
      <Subtitle level={3}>{ intl.$t({ defaultMessage: 'Permissions' }) }</Subtitle>
      {PermissionsTabsContent(scopeHierarchy, formValues.permissions ?? initialPermissionList)}
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
