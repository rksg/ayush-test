import { useEffect, useState } from 'react'

import { Switch, Tooltip } from 'antd'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { showActionModal }                              from '@acx-ui/components'
import { useGetVenueSettingsQuery, useLazyApListQuery } from '@acx-ui/rc/services'
import { APMeshRole }                                   from '@acx-ui/rc/utils'


export function MeshNetwork () {
  const { $t } = useIntl()
  const params = useParams()
  
  const { data } = useGetVenueSettingsQuery({ params })
  const [apList] = useLazyApListQuery()

  const [isAllowEnableMesh, setIsAllowEnableMesh] = useState(false)
  const [hasMeshAPs, setHasMeshAPs] = useState(false)
  const [meshEnabled, setMeshEnabled] = useState(false)
  const [meshToolTipDisabledText, setMeshToolTipDisabledText] = 
    useState($t({ defaultMessage: 'Not available' }))

  useEffect(() => {
    if(data){
      setMeshEnabled(data.mesh.enabled as boolean)
      const enableDhcpSetting = data && data.dhcpServiceSetting && data.dhcpServiceSetting.enabled
      if(enableDhcpSetting){
        // eslint-disable-next-line max-len
        setMeshToolTipDisabledText($t({ defaultMessage: 'You cannot activate the Mesh Network on this venue because it already has enable DHCP settings' }))
      }
      setIsAllowEnableMesh(enableDhcpSetting as boolean) //TODO: this.rbacService.isRoleAllowed('UpdateMeshButton')
        
      if(meshEnabled){
        checkMeshAPs()
      }
    }
  }, [data])

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
    console.log(hasMeshAPs)
  }

  const toggleMesh = (checked: boolean) => {
    if (checked) {
      showActionModal({
        type: 'confirm',
        title: 'Enable Mesh',
        content: $t({ defaultMessage:
              'If you have Mesh-APs, you will not be able to disable this option.' }),
        okText: 'Enable Mesh',
        cancelText: 'Cancel',
        onOk () { 
          setMeshEnabled(true)
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
      }
    }
  }

  return (
    <div>
      <span>{$t({ defaultMessage: 'Mesh Network' })}</span>
      <Tooltip title={meshToolTipDisabledText}>
        <Switch
          checked={meshEnabled}
          onClick={toggleMesh}
        />
      </Tooltip>
    </div>
  )
}
  