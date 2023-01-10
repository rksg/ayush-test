import { useContext, useRef } from 'react'

import { Tooltip } from 'antd'
import { isEmpty } from 'lodash'
import { useDrag } from 'react-dnd'

import { DeviceOutlined, SignalUp }                                        from '@acx-ui/icons'
import { FloorplanContext, NetworkDevice, NetworkDeviceType, RougeApInfo } from '@acx-ui/rc/utils'
import { getIntl }                                                         from '@acx-ui/utils'

import { NetworkDeviceContext } from '..'

import * as UI                                                       from './styledComponent'
import { calculateApColor, calculateDeviceColor, getSnrDisplayInfo } from './utils'



export function NetworkDeviceMarker ({
  galleryMode,
  contextAlbum,
  context,
  device,
  forbidDrag = false,
  showRougeAp = false
}:{ galleryMode: boolean,
    contextAlbum: boolean,
    context: FloorplanContext,
    device: NetworkDevice,
    forbidDrag?: boolean,
    showRougeAp?: boolean
}) {

  const markerContainerRef = useRef<HTMLDivElement>(null)
  const deviceContext = useContext(NetworkDeviceContext) as Function

  const [{ isDragging }, drag] = useDrag(() => ({
    canDrag: !forbidDrag && !showRougeAp,
    type: 'device',
    item: { device, markerRef: markerContainerRef },
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    }),
    end: (item, monitor) => {
      const didDrop = monitor.didDrop()
      if (!didDrop) {
        // device unplaced
        deviceContext(item.device)
      }
    }
  }), [device, forbidDrag])

  let className = 'device-container'

  if (!isEmpty(context))
    className += ' context-' + context

  if (galleryMode)
    className += ' gallery'

  if (contextAlbum)
    className += ' context-Album'

  const allVenueRougeApAttr: RougeApInfo=
   calculateApColor(device?.deviceStatus, showRougeAp, context, device)

  return <div ref={markerContainerRef}>
    { (showRougeAp && device?.rogueCategory) && <UI.RougeApContainer className={`rogue-snr
      ${device.rogueCategoryType?.toLowerCase() || ' malicious'}
       ${getSnrDisplayInfo(device?.snr as number).cssClass}`}
    style={
      {
        top: 'calc(' + device?.position?.yPercent + '%)',
        left: 'calc(' + device?.position?.xPercent + '%)'
      }
    }>
    </UI.RougeApContainer> }
    <Tooltip
      title={(showRougeAp && device?.rogueCategory) ?
        <RougeApTooltip rougeApInfo={
          allVenueRougeApAttr
        }/>
        : device?.name || device?.switchName || device?.serialNumber
      }>
      <UI.DeviceContainer
        ref={drag}
        className={className}
        style={
          {
            top: 'calc(' + device?.position?.yPercent + '%)',
            left: 'calc(' + device?.position?.xPercent + '%)',
            opacity: device?.isActive ? (isDragging ? 0.5 : 1) : 0.3
          }
        }>
        <div className={`marker ${calculateDeviceColor(device, context, showRougeAp)}`}
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
          {
            !contextAlbum && (
              device?.networkDeviceType === NetworkDeviceType.switch
                ? <DeviceOutlined/>
                : <SignalUp />)
          } </div>
        {
          allVenueRougeApAttr?.allVenueRougeApTooltipAttr?.totalRogueNumber &&
          <UI.RougeApCountBadge
            data-testid='rougeApBadge'
            className={`mark-number-rogue
            ${device?.rogueCategoryType?.toLowerCase() || ' malicious'}`}>
            {allVenueRougeApAttr?.allVenueRougeApTooltipAttr?.totalRogueNumber}
          </UI.RougeApCountBadge>
        }
      </UI.DeviceContainer>
    </Tooltip>
  </div>
}

export function RougeApTooltip ({ rougeApInfo }:{
  rougeApInfo: RougeApInfo
}){

  const { $t } = getIntl()

  const { allVenueRougeApTooltipAttr, specificRougeApTooltipAttr } = rougeApInfo
  return <div>
    {
      rougeApInfo?.allrougeApTooltipRequired
        ? <div>
          <p><span style={{
            fontWeight: 'bold'
          }}> {allVenueRougeApTooltipAttr?.totalRogueNumber} </span>
          <span> {$t({ defaultMessage: 'rogues' })} </span>
          {$t({ defaultMessage: 'detected by' })} (<span className='bold'>${
            allVenueRougeApTooltipAttr?.deviceName}</span>):
          </p>
          {
            allVenueRougeApTooltipAttr?.categoryNames.map((category, idx) => {
              return <p className='context'><UI.RougeApIcon className={category}></UI.RougeApIcon>
                <span style={{
                  fontWeight: 'bold',
                  marginLeft: '4px'
                }}>
                  {(allVenueRougeApTooltipAttr?.categoryNums as number[])[idx] as number}
                </span>
                {` ${category}`} <span> {$t({ defaultMessage: 'rogue APs' })}</span>
              </p>
            })
          }
        </div>
        : <div>
          {
            <p><div>{$t({ defaultMessage: 'Detecting AP:' })}
              {specificRougeApTooltipAttr?.deviceName}</div>
            <div>{$t({ defaultMessage: 'MAC Address: $ ' })}
              {specificRougeApTooltipAttr?.macAddress}</div>
            <div>{$t({ defaultMessage: 'SNR: ' })} {specificRougeApTooltipAttr?.snr}
              {$t({ defaultMessage: ' dB' })}
              <UI.SpecificRougeAp className='wifi-signal-snr'>
                <div className={`bar bar0 ${(
                  (specificRougeApTooltipAttr?.activatedBarIndex as number) <= 0)
                  ? 'activated' : ''}`}></div>
                <div className={`bar bar1 ${(
                  (specificRougeApTooltipAttr?.activatedBarIndex as number) <= 0)
                  ? 'activated' : ''}`}></div>
                <div className={`bar bar2 ${(
                  (specificRougeApTooltipAttr?.activatedBarIndex as number) <= 0)
                  ? 'activated' : ''}`}></div>
                <div className={`bar bar3 ${(
                  (specificRougeApTooltipAttr?.activatedBarIndex as number) <= 0)
                  ? 'activated' : ''}`}></div>
                <div className={`bar bar4 ${(
                  (specificRougeApTooltipAttr?.activatedBarIndex as number) <= 0)
                  ? 'activated' : ''}`}></div>
              </UI.SpecificRougeAp>
            </div></p>
          }
        </div>
    }
  </div>
}