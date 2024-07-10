import { Typography, Space, FormInstance }         from 'antd'
import { isNil, pick, remove, cloneDeep, unionBy } from 'lodash'
import { useIntl }                                 from 'react-intl'

import { Drawer }                            from '@acx-ui/components'
import { EdgeSdLanP2ActivatedNetworksTable } from '@acx-ui/rc/components'
import { Network, NetworkTypeEnum }          from '@acx-ui/rc/utils'

import type { EdgeMvSdLanFormNetwork } from '../index'

const toggleItemFromSelected = (
  checked: boolean,
  data: Network,
  selectedNetworks: EdgeMvSdLanFormNetwork | undefined
) => {
  let newSelected
  if (checked) {
    newSelected = unionBy(selectedNetworks,
      [pick(data, ['id', 'name'])], 'id')
  } else {
    newSelected = [...selectedNetworks!]
    remove(newSelected, item => item.id === data.id)
  }
  return newSelected
}


interface NetworksDrawerProps {
  visible: boolean,
  onClose: () => void,
  venueId: string,
  venueName: string,
  formRef: FormInstance,
}

export const NetworksDrawer = (props: NetworksDrawerProps) => {
  const {
    visible,
    onClose,
    venueName,
    formRef,
    ...otherProps
  } = props
  const { venueId } = otherProps

  const { $t } = useIntl()
  const isGuestTunnelEnabled = formRef.getFieldValue('isGuestTunnelEnabled')
  // eslint-disable-next-line max-len
  const activatedNetworks = (formRef.getFieldValue('activatedNetworks') ?? {}) as EdgeMvSdLanFormNetwork
  // eslint-disable-next-line max-len
  const activatedGuestNetworks = (formRef.getFieldValue('activatedGuestNetworks') ?? {}) as EdgeMvSdLanFormNetwork

  const handleActivateChange = (
    fieldName: string,
    data: Network,
    checked: boolean
  ) => {
    const changedData = pick(data, ['id', 'name'])

    // eslint-disable-next-line max-len
    const affectedNetworks = fieldName === 'activatedNetworks' ? activatedNetworks : activatedGuestNetworks
    let newSelected = cloneDeep(affectedNetworks)
    if (checked) newSelected = affectedNetworks[venueId].concat([changedData])
    else remove(newSelected[venueId], i => i.id === changedData.id)

    if (isGuestTunnelEnabled
      && (fieldName === 'activatedNetworks' || (fieldName === 'activatedGuestNetworks' && checked))
      && data.nwSubType === NetworkTypeEnum.CAPTIVEPORTAL ) {

      if (fieldName === 'activatedNetworks') {
        const updateContent = {
          [fieldName]: newSelected
        } as Record<string, EdgeMvSdLanFormNetwork>

        // vlan pooling enabled cannot be a guest network
        const isVlanPooling = !isNil(data.vlanPool)
        if (!isVlanPooling || (isVlanPooling && !checked)) {
          // eslint-disable-next-line max-len
          updateContent['activatedGuestNetworks'] = toggleItemFromSelected(checked, data, activatedGuestNetworks)
        }

        formRef.setFieldsValue(updateContent)
      } else {
        const newSelectedNetworks = toggleItemFromSelected(checked, data, activatedNetworks)
        formRef.setFieldsValue({
          [fieldName]: newSelected,
          activatedNetworks: newSelectedNetworks
        })
      }
    } else {
      formRef.setFieldValue(fieldName, newSelected)
    }
  }

  return (
    <Drawer
      title={$t({ defaultMessage: '{venueName}: Select Networks' }, { venueName })}
      width={500}
      visible={visible}
      onClose={onClose}
    >
      <Space>
        <Typography.Paragraph >
          {
            // eslint-disable-next-line max-len
            $t({ defaultMessage: 'Enable the networks that will tunnel the traffic to the selected cluster:' })
          }
        </Typography.Paragraph>
        <EdgeSdLanP2ActivatedNetworksTable
          venueId={venueId}
          isGuestTunnelEnabled={isGuestTunnelEnabled}
          activated={activatedNetworks[venueId]?.map(item => item.id) ?? []}
          activatedGuest={activatedGuestNetworks[venueId]?.map(item => item.id) ?? []}
          onActivateChange={handleActivateChange}
        />
      </Space>
    </Drawer>
  )
}
