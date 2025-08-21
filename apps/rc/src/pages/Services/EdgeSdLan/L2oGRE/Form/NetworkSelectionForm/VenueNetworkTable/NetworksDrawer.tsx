/* eslint-disable max-len */
import { useState } from 'react'

import { Form, Space, Typography }           from 'antd'
import { cloneDeep, remove, unionBy, unset } from 'lodash'
import { FormattedMessage, useIntl }         from 'react-intl'

import { Drawer, useStepFormContext }                           from '@acx-ui/components'
import { showSdLanNetworksTunnelConflictModal }                 from '@acx-ui/edge/components'
import { NetworkSelectTable }                                   from '@acx-ui/rc/components'
import { EdgeMvSdLanFormModel, EdgeSdLanTunneledWlan, Network } from '@acx-ui/rc/utils'

import { NetworkActivationType } from '../../../shared/type'
import { useEdgeSdLanContext }   from '../../EdgeSdLanContextProvider'
import { messageMappings }       from '../../messageMappings'

const toggleItemFromSelected = (
  checked: boolean,
  venueId: string,
  data: Network,
  selectedNetworks: NetworkActivationType
) => {
  let newSelected: NetworkActivationType = cloneDeep(selectedNetworks)
  if (checked) {
    const tunnelProfileIdDefaultValue = Object.values(selectedNetworks).flat()
      .find(item => item.networkId === data.id)?.tunnelProfileId ?? ''
    newSelected[venueId] = unionBy(selectedNetworks?.[venueId],
      [{ networkId: data.id, networkName: data.name, tunnelProfileId: tunnelProfileIdDefaultValue }], 'networkId')
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
  pinNetworkIds?: string[],
  softGreNetworkIds?: string[]
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
    pinNetworkIds,
    softGreNetworkIds
  } = props

  const {
    availableTunnelProfiles = [],
    associatedEdgeClusters = [],
    requiredFwMap = {}
  } = useEdgeSdLanContext()
  const [updateContent, setUpdateContent] = useState<NetworkActivationType>(activatedNetworks)
  const { form } = useStepFormContext<EdgeMvSdLanFormModel>()
  const [validationForm] = Form.useForm()
  const dcTunnelProfileId = form.getFieldValue('tunnelProfileId')

  const handleActivateChange = (
    data: Network,
    checked: boolean
  ) => {
    setUpdateContent(toggleItemFromSelected(checked, venueId, data, updateContent))
  }

  const checkNetworksTunnelConflict = (
    networkData: Network,
    tunnelProfileId: string
  ) => {
    showSdLanNetworksTunnelConflictModal({
      currentNetworkVenueId: venueId,
      currentNetworkId: networkData.id,
      currentNetworkName: networkData.name,
      tunnelProfileId: tunnelProfileId,
      tunneledWlans: Object.entries(updateContent).flatMap(([venueId, networks]) => networks.map(network => ({
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
        validationForm.validateFields()
      }
    })
  }

  const handelTunnelProfileChange = (data: Network, tunnelProfileId: string) => {
    checkNetworksTunnelConflict(data, tunnelProfileId)
  }

  const handleSubmit = async () => {
    validationForm.validateFields().then(() => {
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
        <Form form={validationForm}>
          <NetworkSelectTable
            venueId={venueId}
            activated={updateContent}
            onActivateChange={handleActivateChange}
            onTunnelProfileChange={handelTunnelProfileChange}
            pinNetworkIds={pinNetworkIds}
            softGreNetworkIds={softGreNetworkIds}
            validationFormRef={validationForm}
            dcTunnelProfileId={dcTunnelProfileId}
            availableTunnelProfiles={availableTunnelProfiles}
            requiredFwMap={requiredFwMap}
            edgeClusters={associatedEdgeClusters}
          />
        </Form>
      </Space>
    </Drawer>
  )
}