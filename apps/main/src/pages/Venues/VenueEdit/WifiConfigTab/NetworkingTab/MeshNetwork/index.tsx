import { useContext, useEffect, useState } from 'react'

import { Form, Switch, Tooltip } from 'antd'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { Loader, showActionModal, showToast } from '@acx-ui/components'
import {
  useLazyApListQuery,
  useGetVenueSettingsQuery,
  useUpdateVenueMeshMutation
} from '@acx-ui/rc/services'
import { APMeshRole } from '@acx-ui/rc/utils'

import { VenueEditContext } from '../../../index'

export function MeshNetwork () {
  const { $t } = useIntl()
  const params = useParams()

  const {
    editContextData,
    setEditContextData,
    editNetworkingContextData,
    setEditNetworkingContextData
  } = useContext(VenueEditContext)

  const [apList] = useLazyApListQuery()
  const [updateVenueMesh, { isLoading: isUpdatingVenueMesh }] = useUpdateVenueMeshMutation()

  const defaultToolTip = $t({ defaultMessage: 'Not available' })
  const [isAllowEnableMesh, setIsAllowEnableMesh] = useState(true)
  const [hasMeshAPs, setHasMeshAPs] = useState(false)
  const [meshEnabled, setMeshEnabled] = useState(false)
  const [meshToolTipDisabledText, setMeshToolTipDisabledText] = useState(defaultToolTip)

  const { data } = useGetVenueSettingsQuery({ params })

  useEffect(() => {
    if(data){
      setMeshEnabled(data.mesh?.enabled as boolean)
      const enableDhcpSetting = data && data.dhcpServiceSetting && data.dhcpServiceSetting?.enabled
      if(enableDhcpSetting){
        // eslint-disable-next-line max-len
        setMeshToolTipDisabledText($t({ defaultMessage: 'You cannot activate the Mesh Network on this venue because it already has enable DHCP settings' }))
      }else{
        setMeshToolTipDisabledText('')
      }
      setIsAllowEnableMesh(!enableDhcpSetting as boolean) //TODO: this.rbacService.isRoleAllowed('UpdateMeshButton')

      if(data.mesh?.enabled){
        checkMeshAPs()
      }
    }
  }, [data, isAllowEnableMesh])

  const checkMeshAPs = async () => {
    const payload = {
      entityType: 'apsList',
      fields: ['serialNumber', 'meshRole'],
      filters: {
        venueId: [params.venueId],
        meshRole: [APMeshRole.MAP, APMeshRole.EMAP]
      },
      pageSize: 1
    }
    const { data } = await apList({ params, payload }, true)
    if(data?.data && data?.data.length > 0){
      setHasMeshAPs(true)
    }
  }

  const handleUpdateMeshSetting = async (check: boolean) => {
    try {
      await updateVenueMesh({ params, payload: { enabled: check } })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const toggleMesh = (checked: boolean) => {
    if (checked) {
      showActionModal({
        type: 'confirm',
        content: $t({ defaultMessage:
              'If you have Mesh-APs, you will not be able to disable this option.' }),
        okText: $t({ defaultMessage: 'Enable Mesh' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
        onOk () {
          setMeshEnabled(true)
          setEditContextData && setEditContextData({
            ...editContextData,
            unsavedTabKey: 'networking',
            tabTitle: $t({ defaultMessage: 'Networking' }),
            isDirty: true
          })
          setEditNetworkingContextData && setEditNetworkingContextData({
            ...editNetworkingContextData,
            meshData: { mesh: true },
            updateMesh: handleUpdateMeshSetting
          })
        },
        onCancel () {}
      })
    } else {
      if (hasMeshAPs) {
        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Error' }),
          content:
              $t({ defaultMessage: 'You cannot set Mesh off because you have connected Mesh APs' })
        })
      } else {
        setMeshEnabled(false)
        setEditContextData && setEditContextData({
          ...editContextData,
          unsavedTabKey: 'networking',
          tabTitle: $t({ defaultMessage: 'Networking' }),
          isDirty: true
        })
        setEditNetworkingContextData && setEditNetworkingContextData({
          ...editNetworkingContextData,
          meshData: { mesh: false },
          updateMesh: handleUpdateMeshSetting
        })
      }
    }
  }

  return (<Loader states={[{
    isLoading: !data || meshToolTipDisabledText === defaultToolTip,
    isFetching: isUpdatingVenueMesh
  }]}>
    <Form.Item
      label={$t({ defaultMessage: 'Mesh Network' })}
      valuePropName='checked'
      initialValue={meshEnabled}
      children={<Tooltip title={meshToolTipDisabledText}>
        <Switch
          data-testid='mesh-switch'
          checked={meshEnabled}
          disabled={!isAllowEnableMesh}
          onClick={toggleMesh}
        />
      </Tooltip>}
    />
  </Loader>
  )
}
