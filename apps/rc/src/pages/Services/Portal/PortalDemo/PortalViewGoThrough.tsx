import { Demo } from '@acx-ui/rc/utils'


import PortalButtonContent from './PortalContent/PortalButtonContent'
export default function PortalViewGoThrough (props:{
  demoValue: Demo,
  isPreview?:boolean,
  updateBtn?: (value: { url?: string, size?: number, show?: boolean,
    color?:string, text?:string }) => void
}) {
  const { demoValue, updateBtn, isPreview } = props
  return (
    <PortalButtonContent
      demoValue={demoValue}
      isPreview={isPreview}
      updateButton={(data)=>updateBtn?.(data)}
    >{'Connect To Wi-Fi'}</PortalButtonContent>
  )
}

