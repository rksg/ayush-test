import { Checkbox, Typography } from 'antd'
import { Rule }                 from 'antd/lib/form'
import input                    from 'antd/lib/input'
import { defineMessage }        from 'react-intl'

import { ManagedUser } from '@acx-ui/analytics/utils'
import { emailRegExp } from '@acx-ui/rc/utils'
import { getIntl }     from '@acx-ui/utils'

import { AvailableUsersSelection } from './AvailableUsersSelection'
import { ResourceGroupSelection }  from './ResourceGroupSelection'
import { RoleSelection }           from './RoleSelection'
import { Label }                   from './styledComponents'

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
export type ValidationRule = Omit<Rule, 'message'> & {
  message: ReturnType<typeof defineMessage>
  required?: boolean
}
interface FormItemConfig {
    name: string;
    labelKey: ReturnType<typeof defineMessage>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.ComponentType<any>
    componentProps: (props: componentProps) => object
    rules?: Rule []
    tooltip?: ReturnType<typeof defineMessage>
    valuePropName?: string
}
interface DrawerContentConfig {
  edit: FormItemConfig[]
  addInternal: FormItemConfig[]
  invite3rdParty: FormItemConfig[]
}

export const drawerContentConfig: DrawerContentConfig = {
  edit: [
    {
      name: 'editEmail',
      labelKey: defineMessage({ defaultMessage: 'Email' }),
      component: Label,
      componentProps: ({ selectedUser }) => ({ children: selectedUser?.email }),
      rules: [{
        required: true
      }]
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
      }),
      rules: [{
        required: true
      }]
    },
    {
      name: 'role',
      labelKey: defineMessage({ defaultMessage: 'Role' }),
      component: RoleSelection,
      componentProps: ({ selectedUser, onChange, updatedUser }) => ({
        selectedValue: updatedUser?.role || selectedUser?.role,
        onChange: (value: string) => onChange({ ...selectedUser, role: value })
      }),
      rules: [{
        required: true
      }]
    }
  ],
  addInternal: [
    {
      name: 'addEmail',
      labelKey: defineMessage({ defaultMessage: 'Email' }),
      tooltip: defineMessage({ defaultMessage:
        `Add Internal user who belongs to your organisation into this RUCKUS AI account. Please note
        that the user needs to have an existing Ruckus Support account.` }),
      component: AvailableUsersSelection,
      componentProps: ({ onChange, updatedUser }) => ({
        selectedValue: updatedUser?.id,
        onChange: (value: object) => onChange({ ...value })
      }),
      rules: [{
        required: true
      }]
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
      ),
      rules: [{
        required: true
      }]
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
      ),
      rules: [{
        required: true
      }]
    }
  ],
  invite3rdParty: [
    {
      name: 'inviteEmail',
      labelKey: defineMessage({ defaultMessage: 'Email' }),
      tooltip: defineMessage({ defaultMessage:
        `Invite a 3rd Party user who does not belong to your organisation
        into this RUCKUS AI account. Please note that the invitee needs to have an existing
        Ruckus Support account.` }),
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
          placeholder: $t({ defaultMessage: 'Enter an email' })
        }
      },
      rules: [{
        required: true
      },
      {
        validator: (_: unknown, value: string) => emailRegExp(value)
      }]
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
      ),
      rules: [{
        required: true
      }]
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
      ),
      rules: [{
        required: true
      }]
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
          checked: Boolean((updatedUser as invitedUser).disclaimerChecked)
        }
      },
      rules: [{
        validator: (_, value) => {
          const { $t } = getIntl()
          return value
            ? Promise.resolve()
            : Promise.reject(new Error($t({ defaultMessage: 'Should accept agreement' })))
        }
      }],
      valuePropName: 'checked'
    }
  ]
}
