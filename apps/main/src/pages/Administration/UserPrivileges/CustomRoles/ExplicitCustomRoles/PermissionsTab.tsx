import { Form, Table, TableProps, Tooltip } from 'antd'
import { useIntl }                          from 'react-intl'

import { Descriptions }                       from '@acx-ui/components'
import { ScopePermission, ScopeTreeDataNode } from '@acx-ui/rc/utils'

import * as UI from '../../styledComponents'

import { Flat } from './AddExplicitCustomRole'

interface PermissionsTabProps {
  updateSelected?: (key: string, permission: string, enabled: boolean) => void,
  scopeHierarchy: ScopeTreeDataNode[]
  tabScopes: ScopeTreeDataNode[]
  permissions: ScopePermission[]
}

// use these arrays to include permission feature key which is not applicable
// to toggle checkbox. this needs generic solution. as we are rendering checkbox
// based on feature not based on feature permission.

const exludeCreatePermissions: (string | number)[] = ['wifi.venue.wifi']
const exludeDeletePermissions: (string | number)[] = ['wifi.venue.wifi']

export const PermissionsTab = (props: PermissionsTabProps) => {
  const { $t } = useIntl()

  const { updateSelected, scopeHierarchy, tabScopes, permissions } = props
  const emptyFunc = () => {}
  const updatePermissions = updateSelected ?? emptyFunc
  const summary = updateSelected ? false : true

  const getIndeterminate = (key: string, permission: string) => {
    /*const parent = scopeHierarchy.find(sc => sc.key === key ||
        sc.children?.some(child => child.key === key || child.children?.some(cc => cc.key === key)))
    const scopeFamily = Flat(scopeHierarchy.find(s => s.key === parent?.key))
    const children = permissions.filter(p =>
      scopeFamily.map(sc => sc.key).includes(p.id) && p.id !== parent?.key)
    // Return true if some children have this permission enabled but not all
    return children.some(p => p[permission]) && !children.every(p => p[permission])*/

    const scope = scopeHierarchy.find(sc => sc.key === key) ||
    scopeHierarchy.flatMap(sc => sc.children).find(c => c?.key === key) ||
    scopeHierarchy.flatMap(sc => sc.children).flatMap(c => c?.children)
      .find(cc => cc?.key === key)
    // Only parents can have indeterminate checkboxes
    if (!scope || !scope.children) {
      return false
    }
    const children = permissions.filter(p =>
      Flat(scope).map(c => c.key).includes(p.id) && p.id !== key)
    // Return true if some children have this permission enabled but not all
    return children.some(p => p[permission]) && !children.every(p => p[permission])
  }

  const columns: TableProps<ScopeTreeDataNode>['columns'] = [
    {
      title: '',
      dataIndex: 'title',
      key: 'title',
      width: '52%'
    },
    {
      title: $t({ defaultMessage: 'Read Only' }),
      dataIndex: 'read',
      key: 'read',
      width: '12%',
      render: (_, row) => {
        return <Form.Item
          className='grid-item'
          valuePropName='checked'>
          <UI.PermissionCheckbox disabled={true}
            checked={permissions.find(p => p.id === row.key)?.read}
            onChange={(e) =>
              updatePermissions(row.key.toString(), 'read', e.target.checked)} />
        </Form.Item>
      }
    },
    {
      title: $t({ defaultMessage: 'Create' }),
      dataIndex: 'create',
      key: 'create',
      width: '12%',
      render: (_, row) => {
        return !exludeCreatePermissions.includes(row.key) ? <Form.Item
          className='grid-item'
          valuePropName='checked'>
          <UI.PermissionCheckbox
            checked={permissions.find(p => p.id === row.key)?.create}
            indeterminate={getIndeterminate(row.key.toString(), 'create')}
            onChange={(e) =>
              updatePermissions(row.key.toString(), 'create', e.target.checked)} />
        </Form.Item> :<Form.Item
          className='grid-item'><Tooltip title={$t({
            defaultMessage: 'This feature permission is not applicable.'
          })}>
            <UI.PermissionCheckbox checked={false} disabled={true}/>
          </Tooltip></Form.Item>
      }
    },
    {
      title: $t({ defaultMessage: 'Edit' }),
      dataIndex: 'update',
      key: 'update',
      width: '12%',
      render: (_, row) => {
        return <Form.Item
          className='grid-item'
          valuePropName='checked'>
          <UI.PermissionCheckbox
            checked={permissions.find(p => p.id === row.key)?.update}
            indeterminate={getIndeterminate(row.key.toString(), 'update')}
            onChange={(e) =>
              updatePermissions(row.key.toString(), 'update', e.target.checked)} />
        </Form.Item>
      }
    },
    {
      title: $t({ defaultMessage: 'Delete' }),
      dataIndex: 'delete',
      key: 'delete',
      width: '12%',
      render: (_, row) => {
        return !exludeDeletePermissions.includes(row.key) ? <Form.Item
          className='grid-item'
          valuePropName='checked'>
          <UI.PermissionCheckbox
            checked={permissions.find(p => p.id === row.key)?.delete}
            indeterminate={getIndeterminate(row.key.toString(), 'delete')}
            onChange={(e) =>
              updatePermissions(row.key.toString(), 'delete', e.target.checked)} />
        </Form.Item>: <Form.Item
          className='grid-item'><Tooltip title={$t({
            defaultMessage: 'This feature permission is not applicable.'
          })}>
            <UI.PermissionCheckbox checked={false} disabled={true}/>
          </Tooltip></Form.Item>
      }
    }
  ]

  const getPermissionsSummaryList = (key:string) => {
    const list = []
    const scopePermission = permissions.find(perm => perm.id === key)
    if (scopePermission?.read) {
      list.push($t({ defaultMessage: 'Read Only' }))
    }
    if (scopePermission?.create && !exludeCreatePermissions.includes(key)) {
      list.push($t({ defaultMessage: ', Create' }))
    }
    if (scopePermission?.update) {
      list.push($t({ defaultMessage: ', Edit' }))
    }
    if (scopePermission?.delete && !exludeDeletePermissions.includes(key)) {
      list.push($t({ defaultMessage: ', Delete' }))
    }
    return list
  }

  const summaryContent = tabScopes.some(s => s.children)
    ? tabScopes.map(scope =>
      (<UI.PermissionSummaryWrapper key={scope.key}>
        <Form.Item
          label={scope.title?.toString()}
          children={<Descriptions labelWidthPercent={15}>
            {scope.children?.map(s =>
              <Descriptions.Item
                key={s.key}
                label={s.title?.toString()}
                children={getPermissionsSummaryList(s.key.toString())}
              />
            )}
          </Descriptions>}
        />
      </UI.PermissionSummaryWrapper>)
    )
    : tabScopes.map(scope =>
      (<Descriptions labelWidthPercent={15} key={scope.key}>
        <Descriptions.Item
          label={scope.title?.toString()}
          children={getPermissionsSummaryList(scope.key.toString())}
        />
      </Descriptions>)
    )

  return summary ? <div>{summaryContent}</div>
    : <UI.PermissionTableWrapper>
      <Table
        columns={columns}
        dataSource={tabScopes}
        indentSize={0}
        pagination={false}
        rowKey='key'
      />
    </UI.PermissionTableWrapper>

}
