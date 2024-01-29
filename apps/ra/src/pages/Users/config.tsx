
import { Checkbox, Typography } from 'antd'
import input                    from 'antd/lib/input'
import { defineMessage }        from 'react-intl'


import { ManagedUser } from '@acx-ui/analytics/utils'
import { Label }       from '@acx-ui/rc/components'
import { getIntl }     from '@acx-ui/utils'

import { AvailableUsersSelection } from './AvailableUsersSelection'
import { ResourceGroupSelection }  from './ResourceGroupSelection'
import { RoleSelection }           from './RoleSelection'

import type { CheckboxProps } from 'antd'


const Disclaimer = (props: object) => {
  const { $t } = getIntl()
  const { Paragraph } = Typography
  /* eslint-disable max-len */
  return (<><Paragraph {...props}>
    {$t({ defaultMessage: 'By inviting a 3rd party user, you are explicitly granting access to someone outside of your organization into this RUCKUS Analytics service account. Please ensure that you have the necessary authorization to do so.' })}
  </Paragraph><Paragraph {...props}>
    {$t({ defaultMessage: 'Do note that if the Admin role is granted, this 3rd party user will also be able to invite other users into your account. If this is not desired, you may want to grant the 3rd party user a Network Admin or Report Only role.' })}
  </Paragraph></>)
  /* eslint-enable max-len */
}
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
  createExternal: FormItemConfig[]
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
        onChange,
        updatedUser
      }) => ({
        selectedValue: updatedUser?.resourceGroupId || selectedUser?.resourceGroupId,
        onChange: (value: string) => onChange({ ...selectedUser, resourceGroupId: value })
      })
    },
    {
      name: 'role',
      labelKey: defineMessage({ defaultMessage: 'Role' }),
      component: RoleSelection,
      componentProps: ({ selectedUser, onChange, updatedUser }) => ({
        selectedValue: updatedUser?.role || selectedUser?.role,
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
  ],
  createExternal: [
    {
      name: 'invitedEmail',
      labelKey: defineMessage({ defaultMessage: 'Email' }),
      component: input,
      componentProps: ({ onChange, updatedUser }) => {
        const { $t } = getIntl()
        return {
          style: { width: '350px' },
          type: 'email',
          value: updatedUser?.email || '',
          onChange: ({ target: { value } } : { target: { value: string } }) => onChange(
            { invitedEmail: value }
          ),
          placeholder: $t({ defaultMessage: 'Email Id of the invited user' })
        }
      }
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
    },
    {
      name: 'disclaimerMsg',
      labelKey: defineMessage({ defaultMessage: '3rd Party User' }),
      component: Disclaimer,
      componentProps: () => ({
        className: 'description greyText',
        style: {
          width: '350px',
          display: 'flex',
          lineHeight: 'var(--acx-subtitle-4-line-height)',
          fontSize: 'var(--acx-body-4-font-size)'
        }
      })
    },
    {
      name: 'disclaimerCheck',
      labelKey: defineMessage({ defaultMessage: 'User Agreement' }),
      component: Checkbox,
      componentProps: ({ onChange, updatedUser }) => {
        type invitedUser = Partial<ManagedUser> & { disclaimerChecked: boolean }
        const { $t } = getIntl()
        return {
          className: 'description greyText',
          style: {
            width: '350px',
            display: 'flex',
            lineHeight: 'var(--acx-subtitle-4-line-height)',
            fontSize: 'var(--acx-body-4-font-size)'
          },
          children: $t({ defaultMessage: 'I understand and agree' }),
          onChange: (e: { target: { checked: boolean } }) : CheckboxProps['onChange'] => onChange(
            { disclaimerChecked: e.target.checked }
          ),
          checked: (updatedUser as invitedUser).disclaimerChecked
        }
      }
    }
  ]
}
