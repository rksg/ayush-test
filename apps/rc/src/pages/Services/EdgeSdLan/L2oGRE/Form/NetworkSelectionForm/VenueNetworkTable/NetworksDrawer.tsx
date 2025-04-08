/* eslint-disable max-len */
import { useState } from 'react'

import { Space, Typography }                        from 'antd'
import { assign, cloneDeep, find, remove, unionBy } from 'lodash'
import { FormattedMessage, useIntl }                from 'react-intl'

import { Drawer }  from '@acx-ui/components'
import { Network } from '@acx-ui/rc/utils'

import { messageMappings } from '../../messageMappings'

import { ActivatedNetworksTable } from './NetworkTable'

const toggleItemFromSelected = (
  checked: boolean,
  data: Network,
  selectedNetworks: NetworkActivationType['venueId']
) => {
  let newSelected: NetworkActivationType['venueId'] = cloneDeep(selectedNetworks)
  if (checked) {
    newSelected = unionBy(selectedNetworks, [{
      networkId: data.id,
      networkName: data.name
    }], 'networkId')
  } else {
    newSelected = cloneDeep(selectedNetworks)
    remove(newSelected, item => item.networkId === data.id)
  }
  return newSelected
}

export interface NetworksDrawerProps {
  visible: boolean,
  onClose: () => void,
  onSubmit: (venueId: string, updates: NetworkActivationType['venueId']) => void,
  venueId: string,
  venueName?: string,
  tunneledNetworks?: NetworkActivationType['venueId'],
  pinNetworkIds?: string[]
}

export interface NetworkActivationType {
  [venueId: string]: {
    networkId: string
    networkName: string
    tunnelProfileId?: string
  }[]
}

export const NetworksDrawer = (props: NetworksDrawerProps) => {
  const { $t } = useIntl()
  const {
    visible,
    onClose,
    onSubmit,
    venueId,
    venueName,
    tunneledNetworks = [],
    pinNetworkIds
  } = props

  const [updateContent, setUpdateContent] = useState<NetworkActivationType['venueId']>(tunneledNetworks)

  const handleActivateChange = (
    data: Network,
    checked: boolean
  ) => {
    setUpdateContent(toggleItemFromSelected(checked, data, updateContent))
  }

  const handelTunnelProfileChange = (networkId: string, tunnelProfileId: string) => {
    const targetVenueData = cloneDeep(updateContent ?? [])
    const targetNetworkData = find(targetVenueData, { networkId })
    assign(targetNetworkData, { tunnelProfileId })
    setUpdateContent(targetVenueData)
  }

  const handleSubmit = async () => {
    onSubmit(venueId, updateContent)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: '{venueName}: Select Networks' }, { venueName })}
      width={1000}
      visible={visible}
      onClose={onClose}
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'OK' })
          }}
          onCancel={onClose}
          onSave={handleSubmit}
        />
      }
    >
      <Space direction='vertical' size={0}>
        <div>
          <Typography.Paragraph>
            { $t(messageMappings.drawer_table_description) }
          </Typography.Paragraph>
          <Typography.Paragraph>
            <FormattedMessage
              {...messageMappings.drawer_table_help}
              values={{
                b: (chunk) => <b>{chunk}</b>
              }}
            />
          </Typography.Paragraph>
        </div>

        <ActivatedNetworksTable
          venueId={venueId}
          activated={updateContent ?? []}
          onActivateChange={handleActivateChange}
          onTunnelProfileChange={handelTunnelProfileChange}
          pinNetworkIds={pinNetworkIds}
        />
      </Space>
    </Drawer>
  )
}