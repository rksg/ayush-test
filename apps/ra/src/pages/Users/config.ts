import { defineMessage } from 'react-intl'

import { ManagedUser } from '@acx-ui/analytics/utils'
import { Label }       from '@acx-ui/rc/components'

import { AvailableUsersSelection } from './AvailableUsersSelection'
import { ResourceGroupSelection }  from './ResourceGroupSelection'
import { RoleSelection }           from './RoleSelection'
interface componentProps {
    selectedUser: Partial<ManagedUser> | null;
    updatedUser: Partial<ManagedUser> | null;
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
      componentProps: ({ selectedUser }) => ({ children: selectedUser?.email })
    },
    {
      name: 'resourceGroup',
      labelKey: defineMessage({ defaultMessage: 'Resource Group' }),
      component: ResourceGroupSelection,
      componentProps: ({
        selectedUser,
        onChange
      }) => ({
        selectedValue: selectedUser?.resourceGroupId,
        onChange: (value: string) => onChange({ ...selectedUser, resourceGroupId: value })
      })
    },
    {
      name: 'role',
      labelKey: defineMessage({ defaultMessage: 'Role' }),
      component: RoleSelection,
      componentProps: ({ selectedUser, onChange }) => ({
        selectedValue: selectedUser?.role,
        onChange: (value: string) => onChange({ ...selectedUser, role: value })
      })
    }
  ],
  create: [
    {
      name: 'email',
      labelKey: defineMessage({ defaultMessage: 'Email' }),
      component: AvailableUsersSelection,
      componentProps: ({ onChange, updatedUser }) => ({
        selectedValue: updatedUser?.id,
        onChange: (value: object) => onChange({ ...value })
      })
    },
    {
      name: 'resourceGroup',
      labelKey: defineMessage({ defaultMessage: 'Resource Group' }),
      component: ResourceGroupSelection,
      componentProps: ({ onChange, updatedUser }) => (
        {
          selectedValue: updatedUser?.resourceGroupId,
          onChange: (value: string) => onChange({ resourceGroupId: value })
        }
      )
    },
    {
      name: 'role',
      labelKey: defineMessage({ defaultMessage: 'Role' }),
      component: RoleSelection,
      componentProps: ({ onChange, updatedUser }) => (
        {
          selectedValue: updatedUser?.role,
          onChange: (value: string) => onChange({ role: value })
        }
      )
    }
  ]
}
