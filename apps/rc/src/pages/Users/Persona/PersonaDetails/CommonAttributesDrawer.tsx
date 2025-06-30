import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import { Descriptions, Drawer } from '@acx-ui/components'
import { ExternalIdentity }     from '@acx-ui/rc/utils'
import { noDataDisplay }        from '@acx-ui/utils'

export function CommonAttributesDrawer (props:{
    externalData: ExternalIdentity,
    visible: boolean,
    onClose: ()=>void })
{
  const { externalData, visible, onClose } = props
  const { $t } = useIntl()
  return <Drawer
    visible={visible}
    destroyOnClose
    onClose={onClose}
    title={$t({ defaultMessage: 'External Attributes' })}
    width={450}
    children={<>
      <Descriptions>
        <Descriptions.Item
          key={'userName'}
          label={$t({ defaultMessage: 'Username' })}
          children={externalData.userId}
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
      </Descriptions>
      <Divider/>
      <Descriptions>
        <Descriptions.Item
          key={'groups'}
          label={$t({ defaultMessage: 'Groups' })}
          children={
            externalData.groups?.length ?
              <div>{
                externalData.groups?.map((group, i) =>
                  <p key={'group' + i}>{group}</p>)}
              </div> : noDataDisplay
          }
        />
        <Descriptions.Item
          key={'role'}
          label={$t({ defaultMessage: 'Role' })}
          children={
            externalData.roles?.length ?
              <div>{
                externalData.roles?.map((role, i) =>
                  <p key={'role' + i}>{role}</p>)
              }</div> : noDataDisplay
          }
        />
      </Descriptions>
      <Divider/>
      <Descriptions>
        <Descriptions.Item
          key={'phone'}
          label={$t({ defaultMessage: 'Phone' })}
          children={externalData.phoneNumber ?? noDataDisplay}
        />
      </Descriptions>
    </>
    }
  />
}