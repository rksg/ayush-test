import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import { Descriptions, Drawer }      from '@acx-ui/components'
import { ExternalIdentity, Persona } from '@acx-ui/rc/utils'

export function CommonAttributesDrawer (props:{
    persona:Persona,
    externalData: ExternalIdentity,
    visible: boolean,
    onClose: ()=>void })
{
  const { persona, externalData, visible, onClose } = props
  const { $t } = useIntl()
  const noDataDisplay = '--'
  return <Drawer
    visible={visible}
    destroyOnClose
    onClose={onClose}
    title={$t({ defaultMessage: 'Identity Attributes' })}
    children={<>
      <Descriptions>
        <Descriptions.Item
          key={'userName'}
          label={$t({ defaultMessage: 'Username' })}
          children={persona.name}
        />
        <Descriptions.Item
          key={'firstName'}
          label={$t({ defaultMessage: 'First Name' })}
          children={externalData.firstName ?? noDataDisplay}
        />
        <Descriptions.Item
          key={'lastName'}
          label={$t({ defaultMessage: 'Last Name' })}
          children={externalData.lastName ?? noDataDisplay}
        />
        <Descriptions.Item
          key={'email'}
          label={$t({ defaultMessage: 'Email' })}
          children={externalData.email ?? noDataDisplay}
        />
        <Descriptions.Item
          key={'displayName'}
          label={$t({ defaultMessage: 'Display Name' })}
          children={externalData.displayName ?? noDataDisplay}
        />
        <Descriptions.Item
          key={'userPrincipalName'}
          label={$t({ defaultMessage: 'User Principal Name' })}
          children={externalData.userPrincipalName ?? noDataDisplay}
        />
      </Descriptions>
      <Divider/>
      <Descriptions>
        <Descriptions.Item
          key={'groups'}
          label={$t({ defaultMessage: 'Groups' })}
          children={<div>{
            externalData.groups?.map((group, i) =>
              <p key={'group' + i}>{group}</p>)}</div>
          }
        />
        <Descriptions.Item
          key={'role'}
          label={$t({ defaultMessage: 'Role' })}
          children={<div>{
            externalData.roles?.map((role, i) =>
              <p key={'role' + i}>{role}</p>)}</div>
          }
        />
      </Descriptions>
      <Divider/>
      <Descriptions>
        <Descriptions.Item
          key={'organization'}
          label={$t({ defaultMessage: 'Organization' })}
          children={externalData.organization ?? noDataDisplay}
        />
        <Descriptions.Item
          key={'department'}
          label={$t({ defaultMessage: 'Department' })}
          children={externalData.department ?? noDataDisplay}
        />
        <Descriptions.Item
          key={'title'}
          label={$t({ defaultMessage: 'Title' })}
          children={externalData.title ?? noDataDisplay}
        />
        <Descriptions.Item
          key={'phone'}
          label={$t({ defaultMessage: 'Phone' })}
          children={externalData.phoneNumber ?? noDataDisplay}
        />
        <Descriptions.Item
          key={'address'}
          label={$t({ defaultMessage: 'Address' })}
          children={externalData.address ?? noDataDisplay}
        />
      </Descriptions>
    </>
    }
  />
}