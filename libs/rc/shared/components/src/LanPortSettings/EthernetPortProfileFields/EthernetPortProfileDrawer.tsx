import { useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer }                                                                from '@acx-ui/components'
import { EthernetPortProfileViewData, hasPolicyPermission, PolicyOperation, PolicyType } from '@acx-ui/rc/utils'

import { AddEthernetPortProfile } from '../../policies/EthernetPortProfile/AddEthernetPortProfile'

import EthernetPortProfileDetailsDrawer from './EthernetPortProfileDetailsDrawer'

export default function EthernetPortProfileDrawer (props:{
  updateInstance: (createId:string) => void,
  disabled?: boolean,
  addBtnVisible?: boolean,
  currentEthernetPortData?: EthernetPortProfileViewData
}) {
  const { updateInstance, currentEthernetPortData, disabled, addBtnVisible=true }=props
  const { $t } = useIntl()
  const onClose = () => {
    setFormVisible(false)
  }
  const [formVisible, setFormVisible]=useState(false)
  const [detailVisible, setDetailVisible]=useState(false)
  const getContent = <AddEthernetPortProfile
    isEmbedded={true}
    onClose={()=>{
      onClose()
    }}
    updateInstance={updateInstance}
  />

  return (
    <>
      <Space split={addBtnVisible && '|'} >
        <Button type='link'
          onClick={()=>setDetailVisible(true)}>
          {$t({ defaultMessage: 'Profile Details' })}
        </Button>
        {addBtnVisible && hasPolicyPermission(
          { type: PolicyType.ETHERNET_PORT_PROFILE, oper: PolicyOperation.CREATE }) &&
        <Button type='link'
          onClick={()=>setFormVisible(true)}
          disabled={disabled}>
          {$t({ defaultMessage: 'Add Profile' })}
        </Button>}
      </Space>
      <EthernetPortProfileDetailsDrawer
        title={$t(
          { defaultMessage: 'Ethernet Port Details:{name}' },
          { name: currentEthernetPortData?.name }
        )}
        visible={detailVisible}
        setVisible={()=>setDetailVisible(false)}
        ethernetPortProfileData={currentEthernetPortData}
      />
      <Drawer
        title={$t({ defaultMessage: 'Add Ethernet Port Profile' })}
        visible={formVisible}
        children={getContent}
        onClose={()=>setFormVisible(false)}
        width={600}
        bodyStyle={{ width: '1000px' }}
      />
    </>
  )
}
