import { defineMessage } from 'react-intl'

import { ManagedUser } from '@acx-ui/analytics/utils'
import { Label }       from '@acx-ui/rc/components'

import { AvailableUsersSelection } from './AvailableUsersSelection'
import { ResourceGroupSelection }  from './ResourceGroupSelection'
import { RoleSelection }           from './RoleSelection'
interface componentProps {
    selectedRow: ManagedUser | null;
    updatedRole: string | null;
    updatedResourceGroup: string | null;
    onRoleChange: (value: string) => void;
    onResourceGroupChange: (value: string) => void;
    onChange: CallableFunction
  }

interface FormItemConfig {
    name: string;
    labelKey: ReturnType<typeof defineMessage>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.ComponentType<any>
    componentProps: (props: componentProps) => object;
}
  interface DrawerContentConfig {
    edit: FormItemConfig[]
    create: FormItemConfig[]
  }
export const drawerContentConfig: DrawerContentConfig = {
  edit: [
    {
      name: 'email',
      labelKey: defineMessage({ defaultMessage: 'Email' }),
      component: Label,
      componentProps: ({ selectedRow }) => ({ children: selectedRow?.email })
    },
    {
      name: 'resourceGroup',
      labelKey: defineMessage({ defaultMessage: 'Resource Group' }),
      component: ResourceGroupSelection,
      componentProps: ({
        selectedRow,
        updatedResourceGroup,
        onResourceGroupChange
      }) => ({
        selectedValue: updatedResourceGroup ?? selectedRow?.resourceGroupId,
        onChange: onResourceGroupChange
      })
    },
    {
      name: 'role',
      labelKey: defineMessage({ defaultMessage: 'Role' }),
      component: RoleSelection,
      componentProps: ({ selectedRow, updatedRole, onRoleChange }) => ({
        selectedValue: updatedRole ?? selectedRow?.role,
        onChange: onRoleChange
      })
    }
  ],
  create: [
    {
      name: 'email',
      labelKey: defineMessage({ defaultMessage: 'Email' }),
      component: AvailableUsersSelection,
      componentProps: ({ onChange }: { onChange: CallableFunction }) => ({ onChange })
    },
    {
      name: 'resourceGroup',
      labelKey: defineMessage({ defaultMessage: 'Resource Group' }),
      component: ResourceGroupSelection,
      componentProps: ({
        selectedRow,
        updatedResourceGroup,
        onResourceGroupChange
      }) => ({
        selectedValue: updatedResourceGroup ?? selectedRow?.resourceGroupId,
        onChange: onResourceGroupChange
      })
    },
    {
      name: 'role',
      labelKey: defineMessage({ defaultMessage: 'Role' }),
      component: RoleSelection,
      componentProps: ({ selectedRow, updatedRole, onRoleChange }) => ({
        selectedValue: updatedRole ?? selectedRow?.role,
        onChange: onRoleChange
      })
    }
  ]
}
