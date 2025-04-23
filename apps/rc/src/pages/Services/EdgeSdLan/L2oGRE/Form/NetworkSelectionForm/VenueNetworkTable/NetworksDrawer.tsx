/* eslint-disable max-len */
import { useState } from 'react'

import { Form, Space, Typography }                         from 'antd'
import { assign, cloneDeep, find, remove, unionBy, unset } from 'lodash'
import { FormattedMessage, useIntl }                       from 'react-intl'

import { Drawer }                                          from '@acx-ui/components'
import { showSdLanCaptivePortalConflictModal }             from '@acx-ui/edge/components'
import { EdgeSdLanTunneledWlan, Network, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { messageMappings } from '../../messageMappings'

import { ActivatedNetworksTable } from './NetworkTable'

const toggleItemFromSelected = (
  checked: boolean,
  venueId: string,
  data: Network,
  selectedNetworks: NetworkActivationType
) => {
  let newSelected: NetworkActivationType = cloneDeep(selectedNetworks)
  if (checked) {
    newSelected[venueId] = unionBy(selectedNetworks?.[venueId],
      [{ networkId: data.id, networkName: data.name }], 'networkId')
  } else {
    newSelected[venueId] = cloneDeep(selectedNetworks[venueId])
    remove(newSelected[venueId], item => item.networkId === data.id)
    // prevent issue when delete a deleted item
    if (!Boolean(newSelected[venueId]?.length))
      unset(newSelected, venueId)
  }
  return newSelected
}

export interface NetworksDrawerProps {
  visible: boolean,
  onClose: () => void,
  onSubmit: (updates: NetworkActivationType) => void,
  venueId: string,
  venueName?: string,
  activatedNetworks?: NetworkActivationType,
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
    activatedNetworks = {},
    pinNetworkIds
  } = props

  const [form] = Form.useForm()
  const [updateContent, setUpdateContent] = useState<NetworkActivationType>(activatedNetworks)

  const handleActivateChange = (
    data: Network,
    checked: boolean
  ) => {
    setUpdateContent(toggleItemFromSelected(checked, venueId, data, updateContent))
  }

  const checkCaptivePortalConflict = (
    networkData: Network,
    tunnelProfileId: string
  ) => {
    showSdLanCaptivePortalConflictModal({
      currentNetworkVenueId: venueId,
      currentNetworkId: networkData.id,
      currentNetworkName: networkData.name,
      tunnelProfileId: tunnelProfileId,
      tunneledWlans: Object.entries(activatedNetworks).flatMap(([venueId, networks]) => networks.map(network => ({
        venueId,
        networkId: network.networkId,
        networkName: network.networkName,
        forwardingTunnelProfileId: network.tunnelProfileId
      }))) as unknown as EdgeSdLanTunneledWlan[],
      onOk: (impactVenueIds: string[]) => {
        const newUpdateContent = cloneDeep(updateContent)
        const currentVenueNetworkList = newUpdateContent[venueId] ?? []
        const currentNetworkData = currentVenueNetworkList.find(item => item.networkId === networkData.id)
        if(currentNetworkData) {
          currentNetworkData.tunnelProfileId = tunnelProfileId
        } else {
          currentVenueNetworkList.push({
            networkId: networkData.id,
            networkName: networkData.name,
            tunnelProfileId: tunnelProfileId
          })
        }
        if (impactVenueIds.length !== 0) {
          impactVenueIds.forEach((impactVenueId) => {
            const impactNetwork = newUpdateContent[impactVenueId].find(item => item.networkId === networkData.id)
            if(impactNetwork) {
              impactNetwork.tunnelProfileId = tunnelProfileId
            }
          })
        }
        setUpdateContent(newUpdateContent)
      }
    })
  }

  const handelTunnelProfileChange = (data: Network, tunnelProfileId: string) => {
    const cloneUpdateContent = cloneDeep(updateContent ?? {})
    const targetVenueData = cloneUpdateContent[venueId]
    const targetNetworkData = find(targetVenueData, { networkId: data.id })
    assign(targetNetworkData, { tunnelProfileId })
    if(data.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL) {
      checkCaptivePortalConflict(data, tunnelProfileId)
    } else {
      setUpdateContent(cloneUpdateContent)
    }
  }

  const handleSubmit = async () => {
    form.validateFields().then(() => {
      onSubmit(updateContent)
    }).catch(() => {
      // do nothing
    })
  }

  return (
    <Drawer
      title={$t({ defaultMessage: '{venueName}: Select Networks' }, { venueName })}
      width={1100}
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
        <Form form={form}>
          <ActivatedNetworksTable
            venueId={venueId}
            activated={updateContent}
            onActivateChange={handleActivateChange}
            onTunnelProfileChange={handelTunnelProfileChange}
            pinNetworkIds={pinNetworkIds}
          />
        </Form>
      </Space>
    </Drawer>
  )
}