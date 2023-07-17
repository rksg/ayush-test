import ProxyArp from './ProxyArp'
import VLANPool from './VLANPool'


interface VLANOfNetworkMoreSettingsFormProps {
  enableVlanPooling: boolean
  enableVxLan: boolean
  isPortalDefaultVLANId: boolean
  showDynamicWlan: boolean
}

export default function VLANOfNetworkMoreSettingsForm (
  { enableVlanPooling,
    enableVxLan,
    isPortalDefaultVLANId,
    showDynamicWlan
  }: VLANOfNetworkMoreSettingsFormProps) {

  return (
    <>
      <VLANPool
        data-testid='VLANPool'
        enableVxLan={enableVxLan}
        enableVlanPooling={enableVlanPooling}
        isPortalDefaultVLANId={isPortalDefaultVLANId}
        showDynamicWlan={showDynamicWlan}
      />
      <ProxyArp
        data-testid='ProxyArp'
        enableVxLan={enableVxLan}
      />
    </>
  )
}
