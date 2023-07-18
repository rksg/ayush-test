import React from 'react'

import ProxyArp from './ProxyArp'
import VLANPool from './VLANPool'


interface VLANOfNetworkMoreSettingsFormProps {
  enableVlanPooling: boolean
  enableVxLan: boolean
  isPortalDefaultVLANId: boolean
  showDynamicWlan: boolean
}

function VLANOfNetworkMoreSettingsForm (
  { enableVlanPooling,
    enableVxLan,
    isPortalDefaultVLANId,
    showDynamicWlan
  }: VLANOfNetworkMoreSettingsFormProps) {

  return (
    <>
      <VLANPool
        enableVxLan={enableVxLan}
        enableVlanPooling={enableVlanPooling}
        isPortalDefaultVLANId={isPortalDefaultVLANId}
        showDynamicWlan={showDynamicWlan}
      />
      <ProxyArp disabledOfSwitch={enableVxLan} />
    </>
  )
}

export default VLANOfNetworkMoreSettingsForm
