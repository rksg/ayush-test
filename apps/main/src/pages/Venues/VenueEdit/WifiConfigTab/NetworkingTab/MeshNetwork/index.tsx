import { useEffect, useState } from 'react'

import { Switch, Tooltip } from 'antd'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { showActionModal, Subtitle } from '@acx-ui/components'
import { 
  useLazyApListQuery,
  useGetVenueSettingsQuery,
  useUpdateVenueMeshMutation
} from '@acx-ui/rc/services'
import { APMeshRole } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export function MeshNetwork () {
  const { $t } = useIntl()
  const params = useParams()
  
  const [apList] = useLazyApListQuery()
  const [updateVenueMesh] = useUpdateVenueMeshMutation()

  const [isAllowEnableMesh, setIsAllowEnableMesh] = useState(true)
  const [hasMeshAPs, setHasMeshAPs] = useState(false)
  const [meshEnabled, setMeshEnabled] = useState(false)
  const [meshToolTipDisabledText, setMeshToolTipDisabledText] = 
    useState($t({ defaultMessage: 'Not available' }))
  
  const { data } = useGetVenueSettingsQuery({ params })

  useEffect(() => {
    if(data){
      setMeshEnabled(data.mesh.enabled as boolean)
      const enableDhcpSetting = data && data.dhcpServiceSetting && data.dhcpServiceSetting.enabled
      if(enableDhcpSetting){
        // eslint-disable-next-line max-len
        setMeshToolTipDisabledText($t({ defaultMessage: 'You cannot activate the Mesh Network on this venue because it already has enable DHCP settings' }))
      }else{
        setMeshToolTipDisabledText('')
      }
      setIsAllowEnableMesh(!enableDhcpSetting as boolean) //TODO: this.rbacService.isRoleAllowed('UpdateMeshButton')
        
      if(data.mesh.enabled){
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

  const toggleMesh = (checked: boolean) => {
    if (checked) {
      showActionModal({
        type: 'confirm',
        content: $t({ defaultMessage:
              'If you have Mesh-APs, you will not be able to disable this option.' }),
        okText: 'Enable Mesh',
        cancelText: 'Cancel',
        onOk () { 
          setMeshEnabled(true)
          updateVenueMesh({
            params,
            payload: {
              mesh: checked
            }
          })
        },
        onCancel () {}
      })
    } else {
      if (hasMeshAPs) {
        showActionModal({
          type: 'error',
          title: 'Error',
          content: 
              $t({ defaultMessage: 'You cannot set Mesh off because you have connected Mesh APs' })
        })
      } else {
        setMeshEnabled(false)
        updateVenueMesh({
          params,
          payload: {
            mesh: checked
          }
        })
      }
    }
  }

  return (
    <>
      <Subtitle level={3}>{$t({ defaultMessage: 'Mesh Network' })}</Subtitle>
      <UI.FieldLabel width='125px'>
        {$t({ defaultMessage: 'Mesh Network' })}
        <UI.FieldLabel width='30px'>
          <Tooltip title={meshToolTipDisabledText}>
            <Switch
              checked={meshEnabled}
              disabled={!isAllowEnableMesh}
              onClick={toggleMesh}
              style={{ marginTop: isAllowEnableMesh? '5px' : '0' }}
            />
          </Tooltip>
        </UI.FieldLabel>
      </UI.FieldLabel>
    </>
  )
}
  