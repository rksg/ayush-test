import { useState } from 'react'

import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import {
  Loader,
  Card,
  Subtitle,
  Descriptions
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  ApDetails,
  ApVenueStatusEnum,
  ApViewModel,
  RadioProperties,
  useApContext
} from '@acx-ui/rc/utils'
import { TenantLink }                                from '@acx-ui/react-router-dom'
import { noDataDisplay, isApFwVersionLargerThan711 } from '@acx-ui/utils'

import { ApDetailsDrawer } from './ApDetailsDrawer'
import * as UI             from './styledComponents'

export function ApProperties (props:{
  currentAP: ApViewModel, apDetails: ApDetails, isLoading: boolean
}) {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const { currentAP, apDetails, isLoading } = props
  const isApTxPowerToggleEnabled = useIsSplitOn(Features.AP_TX_POWER_TOGGLE)
  const supportR370 = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  const { supportAggressiveTxPower } = useApContext()
  const onMoreAction = () => {
    setVisible(true)
  }


  const getTxPowerDisplayInfo = (currentAP: ApViewModel, channel: RadioProperties) => {
    if (isApTxPowerToggleEnabled) {
      const txPower = ((isApFwVersionLargerThan711(currentAP?.fwVersion) &&
      (!supportR370 || supportAggressiveTxPower))? channel?.actualTxPower : channel?.txPower)

      return txPower !== undefined && txPower !== null ? txPower : noDataDisplay
    }
    return channel?.txPower || noDataDisplay
  }

  return (
    <Loader states={[{ isLoading }]}>
      <Card title={$t({ defaultMessage: 'AP Properties' })}
        action={{
          actionName: $t({ defaultMessage: 'More' }),
          onActionClick: onMoreAction
        }}
      >
        <UI.Container>
          <Descriptions labelWidthPercent={50}>
            <Descriptions.Item
              label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
              children={
                <TenantLink to={`/venues/${currentAP?.venueId}/venue-details/overview`}>
                  {currentAP?.venueName}
                </TenantLink>}
            />
            <Descriptions.Item
              label={$t({ defaultMessage: 'AP Group' })}
              children={
                currentAP?.deviceGroupName || $t({ defaultMessage: 'None' })
              }
            />
          </Descriptions>
          <Divider/>
          <Descriptions labelWidthPercent={50}>
            {
              currentAP?.deviceStatusSeverity === ApVenueStatusEnum.OPERATIONAL ?
                (
                  <>
                    <Descriptions.Item
                      label={$t({ defaultMessage: 'Uptime' })}
                      children={currentAP?.uptime}
                    />
                    <Descriptions.Item
                      label={$t({ defaultMessage: 'Last Seen' })}
                      children={currentAP?.lastSeenTime}
                    />
                    <Descriptions.Item
                      label={$t({ defaultMessage: 'Wireless Radio' })}
                      children=''
                    />
                    <Descriptions.Item
                      children={<Descriptions.NoLabel>
                        <UI.TextHeader>
                          <label></label>
                          <label>
                            <span>{$t({ defaultMessage: 'RF' })}</span>
                            <span>{$t({ defaultMessage: 'Channel' })}</span>
                          </label>
                          <label>
                            <span>{$t({ defaultMessage: 'RF' })}</span>
                            <span>{$t({ defaultMessage: 'Bandwidth' })}</span>
                          </label>
                          <label>
                            <span>{$t({ defaultMessage: 'TX Power' })}</span>
                          </label>
                        </UI.TextHeader>
                        {
                          currentAP?.channel24 &&
                        (
                          <UI.TextNumber>
                            <label><Subtitle level={5}>{ '2.4 GHz' }</Subtitle></label>
                            <span>{currentAP.channel24.channel || noDataDisplay}</span>
                            <span>
                              {currentAP.channel24.operativeChannelBandwidth || noDataDisplay}
                            </span>
                            <span>{getTxPowerDisplayInfo(currentAP, currentAP.channel24)}</span>
                          </UI.TextNumber>
                        )
                        }
                        {
                          currentAP?.channel50 &&
                        (
                          <UI.TextNumber>
                            <label><Subtitle level={5}>{ '5 GHz' }</Subtitle></label>
                            <span>{currentAP.channel50.channel || noDataDisplay}</span>
                            <span>
                              {currentAP.channel50.operativeChannelBandwidth || noDataDisplay}
                            </span>
                            <span>{getTxPowerDisplayInfo(currentAP, currentAP.channel50)}</span>
                          </UI.TextNumber>
                        )
                        }
                        {
                          currentAP?.channelL50 &&
                        (
                          <UI.TextNumber>
                            <label><Subtitle level={5}>{ 'LO 5 GHz' }</Subtitle></label>
                            <span>{currentAP.channelL50.channel || noDataDisplay}</span>
                            <span>
                              {currentAP.channelL50.operativeChannelBandwidth || noDataDisplay}
                            </span>
                            <span>{getTxPowerDisplayInfo(currentAP, currentAP.channelL50)}</span>
                          </UI.TextNumber>
                        )
                        }
                        {
                          currentAP?.channelU50 &&
                        (
                          <UI.TextNumber>
                            <label><Subtitle level={5}>{ 'HI 5 GHz' }</Subtitle></label>
                            <span>{currentAP.channelU50.channel || noDataDisplay}</span>
                            <span>
                              {currentAP.channelU50.operativeChannelBandwidth || noDataDisplay}
                            </span>
                            <span>{getTxPowerDisplayInfo(currentAP, currentAP.channelU50)}</span>
                          </UI.TextNumber>
                        )
                        }
                        {
                          currentAP?.channel60 &&
                        (
                          <UI.TextNumber>
                            <label><Subtitle level={5}>{ '6 GHz' }</Subtitle></label>
                            <span>{currentAP.channel60.channel || noDataDisplay}</span>
                            <span>
                              {currentAP.channel60.operativeChannelBandwidth || noDataDisplay}
                            </span>
                            <span>{getTxPowerDisplayInfo(currentAP, currentAP.channel60)}</span>
                          </UI.TextNumber>
                        )
                        }
                      </Descriptions.NoLabel>}
                    />
                  </>
                ) : <Descriptions.Item children={<Descriptions.NoLabel><UI.NoOnlineInfo>
                  {$t({ defaultMessage: 'No Online information' })}
                </UI.NoOnlineInfo></Descriptions.NoLabel>} />
            }
            {
              currentAP?.apStatusData?.cellularInfo &&
              (
                <>
                  <Descriptions.Item
                    label={$t({ defaultMessage: 'Cellular Radio' })}
                    style={{ marginBottom: '0px' }}
                    children=''
                  />
                  <Descriptions.Item
                    label={$t({ defaultMessage: 'Active SIM' })}
                    style={{ marginLeft: '10px', marginBottom: '0px' }}
                    children={
                      currentAP.apStatusData.cellularInfo.cellularActiveSim || noDataDisplay
                    }
                  />
                  <Descriptions.Item
                    label={$t({ defaultMessage: 'Connection Status' })}
                    style={{ marginLeft: '10px', marginBottom: '0px' }}
                    children={
                      currentAP.apStatusData.cellularInfo.cellularConnectionStatus || noDataDisplay
                    }
                  />
                  <Descriptions.Item
                    label={$t({ defaultMessage: 'Signal Strength' })}
                    style={{ marginLeft: '10px' }}
                    children={
                      currentAP.apStatusData.cellularInfo.cellularSignalStrength || noDataDisplay
                    }
                  />
                </>
              )
            }
          </Descriptions>
        </UI.Container>
      </Card>
      {
        visible && (<ApDetailsDrawer
          visible={visible}
          setVisible={setVisible}
          currentAP={currentAP as ApViewModel}
          apDetails={apDetails as ApDetails}
        />)
      }
    </Loader>
  )
}

