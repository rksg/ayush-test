import React, { useContext, useRef } from 'react'

import { Badge, Tooltip } from 'antd'
import { isEmpty }        from 'lodash'
import { useDrag }        from 'react-dnd'

import { deviceCategoryColors } from '@acx-ui/components'
import {
  DeviceOutlined, SignalBad, SignalExcellent, SignalGood, SignalPoor,
  SignalUp
} from '@acx-ui/icons'
import { FloorplanContext, NetworkDevice, NetworkDeviceType, RogueApInfo } from '@acx-ui/rc/utils'
import { getIntl }                                                         from '@acx-ui/utils'

import { NetworkDeviceContext } from '..'

import * as UI                                                                      from './styledComponents'
import { useApMeshDevice }                                                          from './useApMeshDevice'
import { calculateApColor, calculateDeviceColor, getDeviceName, getSnrDisplayInfo } from './utils'

const renderSignal = (snr: number) => {
  if (snr <= 10) return <SignalBad fill={'white'} stroke={'white'} width={12} height={12} />

  const value = Math.floor(snr / 10)
  if (value >= 4) {
    return <SignalExcellent fill={'white'} stroke={'white'} width={12} height={12} />
  }
  if (value >= 3) {
    return <SignalGood fill={'white'} stroke={'white'} width={12} height={12} />
  }
  if (value >= 2) {
    return <SignalPoor fill={'white'} stroke={'white'} width={12} height={12} />
  }

  return <SignalBad fill={'white'} stroke={'white'} width={12} height={12} />
}


export function NetworkDeviceMarker ({
  galleryMode,
  contextAlbum,
  context,
  device,
  forbidDrag = false,
  showRogueAp = false,
  perRogueApModel = false
}:{ galleryMode: boolean,
    contextAlbum: boolean,
    context: FloorplanContext,
    device: NetworkDevice,
    forbidDrag?: boolean,
    showRogueAp?: boolean,
    perRogueApModel?: boolean
}) {

  const markerContainerRef = useRef<HTMLDivElement>(null)
  const deviceContext = useContext(NetworkDeviceContext) as Function
  const {
    isApMeshEnabled,
    getApMeshRoleTooltip,
    getApMeshRoleIcon
  } = useApMeshDevice(device)

  const [{ isDragging }, drag] = useDrag(() => ({
    canDrag: !forbidDrag && !showRogueAp,
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

  const allVenueRogueApAttr: RogueApInfo=
   calculateApColor(device?.deviceStatus, showRogueAp, context, device)

  const getDeviceTooltip = () => {
    if (perRogueApModel) {
      return <RogueApLocationTooltip rogueApLocationInfo={device} />
    }
    if (showRogueAp && device?.rogueCategory) {
      return <RogueApTooltip rogueApInfo={allVenueRogueApAttr}/>
    }

    if (isApMeshEnabled) return getApMeshRoleTooltip()

    return getDeviceName(device)
  }

  return <div ref={markerContainerRef}>
    { (showRogueAp && device?.rogueCategory) && <UI.RogueApContainer className={`rogue-snr
      ${device.rogueCategoryType?.toLowerCase() || ' malicious'}
       ${getSnrDisplayInfo(device?.snr as number).cssClass}`}
    style={
      {
        top: 'calc(' + device?.position?.yPercent + '%)',
        left: 'calc(' + device?.position?.xPercent + '%)'
      }
    }>
    </UI.RogueApContainer> }
    <Tooltip
      title={getDeviceTooltip()}>
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
        <div className={`marker ${calculateDeviceColor(device, context, showRogueAp)}`}
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
        {isApMeshEnabled && getApMeshRoleIcon()}
        {
          allVenueRogueApAttr?.allVenueRogueApTooltipAttr?.totalRogueNumber && !perRogueApModel &&
          <UI.RogueApCountBadge
            data-testid='rogueApBadge'
            className={`mark-number-rogue
            ${device?.rogueCategoryType?.toLowerCase() || ' malicious'}`}>
            {allVenueRogueApAttr?.allVenueRogueApTooltipAttr?.totalRogueNumber}
          </UI.RogueApCountBadge>
        }
      </UI.DeviceContainer>
    </Tooltip>
  </div>
}

export function RogueApTooltip ({ rogueApInfo }:{
  rogueApInfo: RogueApInfo
}){

  const { $t } = getIntl()

  const { allVenueRogueApTooltipAttr, specificRogueApTooltipAttr } = rogueApInfo

  const rogueTypeColors = {
    malicious: deviceCategoryColors.Malicious,
    ignored: deviceCategoryColors.Ignored,
    unclassified: deviceCategoryColors.Unclassified,
    known: deviceCategoryColors.Known
  }

  function getRogueApColor (rogueType: string) {
    return `var(${rogueTypeColors[rogueType as keyof typeof rogueTypeColors]})`
  }

  return <div>
    {
      rogueApInfo?.allrogueApTooltipRequired
        ? <div>
          <p>
            {$t({ defaultMessage: '{number} rogues detected by ({deviceName}):' },
              { number: <b>{allVenueRogueApTooltipAttr?.totalRogueNumber}</b>,
                deviceName: <b>{allVenueRogueApTooltipAttr?.deviceName}</b> })}
          </p>
          {
            allVenueRogueApTooltipAttr?.categoryNames.map((category, idx) => {
              const badgeText = <span style={{ color: 'var(--acx-primary-white)' }}>
                { $t({ defaultMessage: '{number} {category} rogue APs' },
                  { number: <b>{
                    (allVenueRogueApTooltipAttr?.categoryNums as number[])[idx]
                  }
                  </b>,category }) }</span>

              return <p className='context'><Badge color={getRogueApColor(category)}
                text={badgeText}></Badge>
              </p>
            })
          }
        </div>
        : <div>
          {
            <p><div>{$t({ defaultMessage: 'Detecting AP:' })}
              {specificRogueApTooltipAttr?.deviceName}</div>
            <div>{$t({ defaultMessage: 'MAC Address: $ ' })}
              {specificRogueApTooltipAttr?.macAddress}</div>
            <div>{$t({ defaultMessage: 'SNR: ' })} {specificRogueApTooltipAttr?.snr}
              {$t({ defaultMessage: ' dB' })}
              <UI.SpecificRogueAp className='wifi-signal-snr'>
                <div className={`bar bar0 ${(
                  (specificRogueApTooltipAttr?.activatedBarIndex as number) <= 0)
                  ? 'activated' : ''}`}></div>
                <div className={`bar bar1 ${(
                  (specificRogueApTooltipAttr?.activatedBarIndex as number) <= 0)
                  ? 'activated' : ''}`}></div>
                <div className={`bar bar2 ${(
                  (specificRogueApTooltipAttr?.activatedBarIndex as number) <= 0)
                  ? 'activated' : ''}`}></div>
                <div className={`bar bar3 ${(
                  (specificRogueApTooltipAttr?.activatedBarIndex as number) <= 0)
                  ? 'activated' : ''}`}></div>
                <div className={`bar bar4 ${(
                  (specificRogueApTooltipAttr?.activatedBarIndex as number) <= 0)
                  ? 'activated' : ''}`}></div>
              </UI.SpecificRogueAp>
            </div></p>
          }
        </div>
    }
  </div>
}

export function RogueApLocationTooltip ({ rogueApLocationInfo }:{
  rogueApLocationInfo: NetworkDevice
}){
  const { $t } = getIntl()

  return <div style={{ fontSize: '11px' }}>
    <div>{$t({ defaultMessage: 'Detecting AP:' })} {rogueApLocationInfo.name}<br /></div>
    <div>{$t({ defaultMessage: 'MAC Address:' })} {rogueApLocationInfo.macAddress}<br /></div>
    {/* eslint-disable-next-line max-len */}
    <div style={{ display: 'flex', justifyItems: 'center' }}>
      {/* eslint-disable-next-line max-len */}
      {$t({ defaultMessage: 'SNR:' })} {rogueApLocationInfo.snr} dB {renderSignal(rogueApLocationInfo.snr ?? 0)}
    </div>
  </div>
}
