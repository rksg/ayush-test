/* eslint-disable max-len */
import { useEffect, useState } from 'react'

import { Space, Typography }                              from 'antd'
import { cloneDeep, isNil, pick, remove, unionBy, unset } from 'lodash'
import { FormattedMessage, useIntl }                      from 'react-intl'

import { Drawer }                                                                                   from '@acx-ui/components'
import { Features }                                                                                 from '@acx-ui/feature-toggle'
import { EdgeSdLanP2ActivatedNetworksTable, showSdLanGuestFwdConflictModal, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { EdgeMvSdLanFormNetwork, Network, NetworkTypeEnum }                                         from '@acx-ui/rc/utils'

import { messageMappings } from '../../messageMappings'

const toggleItemFromSelected = (
  checked: boolean,
  venueId: string,
  data: Network,
  selectedNetworks: EdgeMvSdLanFormNetwork
) => {
  let newSelected: EdgeMvSdLanFormNetwork = cloneDeep(selectedNetworks)
  if (checked) {
    newSelected[venueId] = unionBy(selectedNetworks?.[venueId],
      [pick(data, ['id', 'name'])], 'id')
  } else {
    newSelected[venueId] = cloneDeep(selectedNetworks[venueId])
    remove(newSelected[venueId], item => item.id === data.id)
    // prevent issue when delete a deleted item
    if (!Boolean(newSelected[venueId]?.length))
      unset(newSelected, venueId)
  }

  return newSelected
}

export interface NetworksDrawerProps {
  visible: boolean,
  onClose: () => void,
  onSubmit: (updates: Record<string, EdgeMvSdLanFormNetwork>) => void,
  venueId: string,
  venueName?: string,
  isGuestTunnelEnabled?: boolean,
  tunneledNetworks?: EdgeMvSdLanFormNetwork,
  tunneledGuestNetworks?: EdgeMvSdLanFormNetwork
  pinNetworkIds?: string[]
}

export const NetworksDrawer = (props: NetworksDrawerProps) => {
  const { $t } = useIntl()
  const {
    visible,
    onClose,
    onSubmit,
    venueId,
    venueName,
    isGuestTunnelEnabled = false,
    tunneledNetworks,
    tunneledGuestNetworks,
    pinNetworkIds
  } = props

  const [updateContent, setUpdateContent] = useState<Record<string, EdgeMvSdLanFormNetwork>>({})
  const isEdgeL2oGreReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)

  useEffect(() => {
    if (visible) {
      setUpdateContent({
        activatedNetworks: tunneledNetworks ?? ({} as EdgeMvSdLanFormNetwork),
        activatedGuestNetworks: tunneledGuestNetworks ?? ({} as EdgeMvSdLanFormNetwork)
      })
    }
  }, [visible, tunneledNetworks, tunneledGuestNetworks])

  const checkGuestFwdConflict = (
    networkData: Network,
    checked: boolean,
    newSelected: Record<string, EdgeMvSdLanFormNetwork>
  ) => {
    const { activatedNetworks, activatedGuestNetworks } = newSelected

    showSdLanGuestFwdConflictModal({
      currentNetworkVenueId: venueId,
      currentNetworkId: networkData.id,
      currentNetworkName: networkData.name,
      activatedDmz: checked,
      tunneledWlans: activatedNetworks,
      tunneledGuestWlans: activatedGuestNetworks,
      isL2oGreReady: isEdgeL2oGreReady,
      onOk: (impactVenueIds: string[]) => {
        let newSelectedNetworks = activatedGuestNetworks
        if (impactVenueIds.length !== 0) {
          impactVenueIds.forEach((impactVenueId) => {
            newSelectedNetworks = toggleItemFromSelected(checked, impactVenueId, networkData, newSelectedNetworks)
          })
        }
        setUpdateContent({
          activatedNetworks,
          activatedGuestNetworks: newSelectedNetworks
        })
      }
    })
  }

  const handleActivateChange = (
    fieldName: string,
    data: Network,
    checked: boolean
  ) => {
    const { activatedNetworks, activatedGuestNetworks } = updateContent

    // vlan pooling enabled cannot be a guest network
    const isVlanPooling = !isNil(data.vlanPool)

    const isGuestNetworkAction = fieldName === 'activatedGuestNetworks' || !(fieldName === 'activatedNetworks' && checked && isVlanPooling)

    if (isGuestTunnelEnabled && data.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL && isGuestNetworkAction) {

      // deactivate GuestNetworks: only update GuestNetworks
      if (fieldName === 'activatedGuestNetworks' && !checked) {
        const newActivatedGuestNetworks = toggleItemFromSelected(checked, venueId, data, activatedGuestNetworks)

        checkGuestFwdConflict(data, checked, {
          ...updateContent,
          activatedGuestNetworks: newActivatedGuestNetworks
        })
      } else {

        const updateData = {
          activatedNetworks: toggleItemFromSelected(checked, venueId, data, activatedNetworks),
          activatedGuestNetworks: toggleItemFromSelected(checked, venueId, data, activatedGuestNetworks)
        }

        // no need to check conflict when deactivate dc network
        if (fieldName === 'activatedNetworks' && !checked) {
          setUpdateContent(updateData)
        } else {
          checkGuestFwdConflict(data, checked, updateData)
        }
      }
    } else {
      setUpdateContent({
        ...updateContent,
        ...((data.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL && fieldName === 'activatedNetworks' && !checked)
          ? { activatedGuestNetworks: toggleItemFromSelected(checked, venueId, data, activatedGuestNetworks) }
          :{}),
        activatedNetworks: toggleItemFromSelected(checked, venueId, data, activatedNetworks)
      })
    }
  }

  const handleSubmit = async () => {
    onSubmit(updateContent)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: '{venueName}: Select Networks' }, { venueName })}
      width={isGuestTunnelEnabled ? 1000 : 800}
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

        <EdgeSdLanP2ActivatedNetworksTable
          venueId={venueId}
          isGuestTunnelEnabled={isGuestTunnelEnabled}
          activated={updateContent.activatedNetworks?.[venueId]?.map(item => item.id) ?? []}
          activatedGuest={updateContent.activatedGuestNetworks?.[venueId]?.map(item => item.id) ?? []}
          onActivateChange={handleActivateChange}
          pinNetworkIds={pinNetworkIds}
        />
      </Space>
    </Drawer>
  )
}