import { useEffect, useState } from 'react'

import { Typography, Space, FormInstance }                from 'antd'
import { isNil, pick, remove, cloneDeep, unionBy, unset } from 'lodash'
import { useIntl }                                        from 'react-intl'

import { Drawer }                                                            from '@acx-ui/components'
import { EdgeSdLanP2ActivatedNetworksTable, showSdLanGuestFwdConflictModal } from '@acx-ui/rc/components'
import { Network, NetworkTypeEnum, EdgeMvSdLanFormNetwork }                  from '@acx-ui/rc/utils'

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

interface NetworksDrawerProps {
  visible: boolean,
  onClose: () => void,
  venueId: string,
  venueName?: string,
  formRef: FormInstance
}

export const NetworksDrawer = (props: NetworksDrawerProps) => {
  const { $t } = useIntl()
  const {
    visible,
    onClose,
    venueId,
    venueName,
    formRef
  } = props

  const [updateContent, setUpdateContent] = useState<Record<string, EdgeMvSdLanFormNetwork>>({})

  const isGuestTunnelEnabled = formRef.getFieldValue('isGuestTunnelEnabled')

  useEffect(() => {
    if (visible) {
    // eslint-disable-next-line max-len
      const activatedNetworks = (formRef.getFieldValue('activatedNetworks') ?? {}) as EdgeMvSdLanFormNetwork
      // eslint-disable-next-line max-len
      const activatedGuestNetworks = (formRef.getFieldValue('activatedGuestNetworks') ?? {}) as EdgeMvSdLanFormNetwork

      setUpdateContent({
        activatedNetworks,
        activatedGuestNetworks
      })
    }
  }, [visible])

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
      activatedGuest: checked,
      tunneledWlans: activatedNetworks,
      tunneledGuestWlans: activatedGuestNetworks,
      onOk: (impactVenueIds: string[]) => {
        let newSelectedNetworks = activatedGuestNetworks
        if (impactVenueIds.length !== 0) {
          impactVenueIds.forEach((impactVenueId) => {
          // eslint-disable-next-line max-len
            newSelectedNetworks = toggleItemFromSelected(checked, impactVenueId, networkData, activatedGuestNetworks)
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

    // eslint-disable-next-line max-len
    const affectedNetworks = (fieldName === 'activatedNetworks' ? activatedNetworks : activatedGuestNetworks)
    const newSelected = toggleItemFromSelected(checked, venueId, data, affectedNetworks)

    if (isGuestTunnelEnabled
      && (fieldName === 'activatedNetworks' || (fieldName === 'activatedGuestNetworks' && checked))
      && data.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL ) {

      if (fieldName === 'activatedNetworks') {
        const updateData = {
          [fieldName]: newSelected,
          activatedGuestNetworks: activatedGuestNetworks
        }

        // vlan pooling enabled cannot be a guest network
        const isVlanPooling = !isNil(data.vlanPool)
        if (!isVlanPooling || (isVlanPooling && !checked)) {
          // eslint-disable-next-line max-len
          updateData['activatedGuestNetworks'] = toggleItemFromSelected(checked, venueId, data, activatedGuestNetworks)
        }

        // the state of 'Forward the guest traffic to DMZ' (ON/OFF) on the same network at different venues needs to be same.
        // but deactivate network no need to check conflict.
        if (checked) {
          checkGuestFwdConflict(data, checked, updateData)
        } else {
          setUpdateContent(updateData)
        }
      } else {
        // eslint-disable-next-line max-len
        const newSelectedNetworks = toggleItemFromSelected(checked, venueId, data, activatedNetworks)

        // activatedGuestNetworks
        checkGuestFwdConflict(data, checked, {
          [fieldName]: newSelected,
          activatedNetworks: newSelectedNetworks
        })
      }
    } else {
      if (fieldName === 'activatedGuestNetworks') {
        // the state of 'Forward the guest traffic to DMZ' (ON/OFF) on the same network at different venues needs to be same
        checkGuestFwdConflict(data, checked, {
          ...updateContent,
          [fieldName]: newSelected
        })
      } else {
        setUpdateContent({
          ...updateContent,
          [fieldName]: newSelected
        })
      }
    }
  }

  const handleSubmit = async () => {
    Object.keys(updateContent).forEach(d => {
      formRef.setFieldValue(d, updateContent[d])
    })
    formRef.validateFields(['activatedNetworks'])
    onClose()
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
      <Space direction='vertical'>
        <Typography.Paragraph >
          { $t(messageMappings.drawer_table_description) }
        </Typography.Paragraph>

        <EdgeSdLanP2ActivatedNetworksTable
          venueId={venueId}
          isGuestTunnelEnabled={isGuestTunnelEnabled}
          activated={updateContent.activatedNetworks?.[venueId]?.map(item => item.id) ?? []}
          // eslint-disable-next-line max-len
          activatedGuest={updateContent.activatedGuestNetworks?.[venueId]?.map(item => item.id) ?? []}
          // mvActivatedGuestNetworks={mvActivatedGuestNetworks}
          onActivateChange={handleActivateChange}
        />
      </Space>
    </Drawer>
  )
}