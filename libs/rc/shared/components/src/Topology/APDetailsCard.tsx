import { Badge, Button, Divider, Space } from 'antd'
import { useIntl }                       from 'react-intl'

import { IncidentsBySeverityData, useIncidentToggles, useIncidentsBySeverityQuery } from '@acx-ui/analytics/components'
import { Card, Descriptions, getDefaultEarliestStart, Loader, Subtitle, Tooltip }   from '@acx-ui/components'
import { Features, useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                                from '@acx-ui/formatter'
import { CloseSymbol, LeafSolidIcon }                                               from '@acx-ui/icons'
import {
  ApDeviceStatusEnum,
  APMeshRole,
  APView,
  ApViewModel,
  PowerSavingStatusEnum,
  SwitchStatusEnum,
  transformApStatus,
  getPowerSavingStatusEnabledApStatus,
  transformTitleCase,
  RadioProperties,
  useApContext
} from '@acx-ui/rc/utils'
import { useLocation }                                              from '@acx-ui/react-router-dom'
import { isApFwVersionLargerThan711, noDataDisplay, useDateFilter } from '@acx-ui/utils'
import type { AnalyticsFilter }                                     from '@acx-ui/utils'

import IncidentStackedBar              from './IncidentStackedBar'
import * as UI                         from './styledComponents'
import { getDeviceColor, getMeshRole } from './utils'

export function APDetailsCard (props: {
    apDetail: ApViewModel,
    isLoading: boolean,
    onClose: () => void
  }) {
  const { apDetail, isLoading, onClose } = props
  const { $t } = useIntl()
  const toggles = useIncidentToggles()
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { dateFilter } = useDateFilter({ showResetMsg, earliestStart: getDefaultEarliestStart() })
  const location = useLocation()

  const filters = {
    ...dateFilter,
    filter: {
      networkNodes: [[
        { type: 'zone', name: apDetail?.venueId },
        { type: 'AP', name: apDetail?.apMac as string }
      ]],
      switchNodes: [[]]
    }
  } as AnalyticsFilter

  const incidentData = useIncidentsBySeverityQuery({ ...filters, toggles }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    }),
    skip: !apDetail?.venueId || !apDetail?.apMac
  })

  const apName = apDetail?.name
    || apDetail?.apMac
    || $t({ defaultMessage: 'Unknown' }) // for unknown device

  const isSupportPowerSavingMode = useIsSplitOn(Features.WIFI_POWER_SAVING_MODE_TOGGLE)
  const isApTxPowerToggleEnabled = useIsSplitOn(Features.AP_TX_POWER_TOGGLE)
  const supportR370 = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  const { supportAggressiveTxPower } = useApContext()

  const getTxPowerDisplayInfo = (currentAP: ApViewModel, channel: RadioProperties) => {
    if (isApTxPowerToggleEnabled) {
      const txPower = ((isApFwVersionLargerThan711(currentAP?.fwVersion) &&
      (!supportR370 || supportAggressiveTxPower))? channel?.actualTxPower : channel?.txPower)

      return txPower !== undefined && txPower !== null ? txPower : noDataDisplay
    }
    return channel?.txPower || noDataDisplay
  }

  return <Card><Card.Title>
    <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
      <UI.NodeTitle
        state={{ from: location.pathname }}
        // eslint-disable-next-line max-len
        to={`/devices/wifi/${apDetail?.serialNumber}/details/overview`}>
        {apName}
        {isSupportPowerSavingMode && getPowerSavingStatusEnabledApStatus(
          apDetail?.deviceStatus as ApDeviceStatusEnum,
          apDetail?.powerSavingStatus as PowerSavingStatusEnum) &&
          <Tooltip zIndex={9999}
            title={$t(
              { defaultMessage: 'Device is controlled by Energy Saving AI. '
                + 'Radio may not be broadcasting.' }
            )}
            placement='top'
          >
            <LeafSolidIcon width={12} height={12} style={{ marginLeft: '4px' }} />
          </Tooltip>
        }
      </UI.NodeTitle>
      <Button
        size='small'
        type='link'
        onClick={onClose}
        icon={<CloseSymbol />}
        data-testid='closeNodeTooltip' />
    </Space>
  </Card.Title>
  <Loader states={[
    { isLoading }
  ]}>
    <Descriptions labelWidthPercent={50} contentStyle={{ alignItems: 'center' }}>
      {/* model  */}
      <Descriptions.Item
        label={$t({ defaultMessage: 'AP Model' })}
        children={apDetail?.model || noDataDisplay} />

      {/* MAC address  */}
      <Descriptions.Item
        label={$t({ defaultMessage: 'MAC Address' })}
        children={apDetail?.apMac || noDataDisplay} />

      {/* IP Address  */}
      <Descriptions.Item
        label={$t({ defaultMessage: 'IP Address' })}
        children={apDetail?.IP || noDataDisplay} />

      {/* Status  */}
      <Descriptions.Item
        label={$t({ defaultMessage: 'Status' })}
        children={
          <Badge
            key={apDetail?.apMac + 'status'}
            color={getDeviceColor(apDetail?.deviceStatus as SwitchStatusEnum)}
            text={transformApStatus(useIntl(),
              apDetail?.deviceStatus as ApDeviceStatusEnum,
              APView.AP_OVERVIEW_PAGE).message} // passing AP_OVERVIEW_PAGE to get single AP status message
          />
        } />

      {/* Incidents */}
      <Descriptions.Item
        label={$t({ defaultMessage: 'Incidents (Last 24 hrs)' })}
        contentStyle={{
          alignSelf: 'center',
          display: 'inline-flex'
        }}
        children={
          incidentData?.data &&
          <IncidentStackedBar
            incidentData={incidentData?.data}
            isLoading={incidentData?.isLoading}
            category='AP Incidents'
          />
        }
      />

      {/* Health  */}
      <Descriptions.Item
        label={$t({ defaultMessage: 'Health' })}
        children={(apDetail?.healthStatus)
          ? transformTitleCase(apDetail.healthStatus)
          : noDataDisplay} />

      {/* Wireless Radio  */}
      <Descriptions.Item
        label={$t({ defaultMessage: 'Wireless Radio' })}
        children={''} />
      <Descriptions.Item
        children={<Descriptions.NoLabel>
          <UI.WirelessRadioTableContainer><UI.TextHeader>
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
            apDetail?.channel24 &&
              (
                <UI.TextNumber>
                  <label><Subtitle level={5}>{ '2.4 GHz' }</Subtitle></label>
                  <span>{apDetail.channel24.channel || noDataDisplay}</span>
                  <span>{apDetail.channel24.operativeChannelBandwidth || noDataDisplay}</span>
                  <span>{getTxPowerDisplayInfo(apDetail, apDetail.channel24)}</span>
                </UI.TextNumber>
              )
          }
          {
            apDetail?.channel50 &&
              (
                <UI.TextNumber>
                  <label><Subtitle level={5}>{ '5 GHz' }</Subtitle></label>
                  <span>{apDetail.channel50.channel || noDataDisplay}</span>
                  <span>{apDetail.channel50.operativeChannelBandwidth || noDataDisplay}</span>
                  <span>{getTxPowerDisplayInfo(apDetail, apDetail.channel50)}</span>
                </UI.TextNumber>
              )
          }
          {
            apDetail?.channelL50 &&
              (
                <UI.TextNumber>
                  <label><Subtitle level={5}>{ 'LO 5 GHz' }</Subtitle></label>
                  <span>{apDetail.channelL50.channel || noDataDisplay}</span>
                  <span>{apDetail.channelL50.operativeChannelBandwidth || noDataDisplay}</span>
                  <span>{getTxPowerDisplayInfo(apDetail, apDetail.channelL50)}</span>
                </UI.TextNumber>
              )
          }
          {
            apDetail?.channelU50 &&
              (
                <UI.TextNumber>
                  <label><Subtitle level={5}>{ 'HI 5 GHz' }</Subtitle></label>
                  <span>{apDetail.channelU50.channel || noDataDisplay}</span>
                  <span>{apDetail.channelU50.operativeChannelBandwidth || noDataDisplay}</span>
                  <span>{getTxPowerDisplayInfo(apDetail, apDetail.channelU50)}</span>
                </UI.TextNumber>
              )
          }
          {
            apDetail?.channel60 &&
              (
                <UI.TextNumber>
                  <label><Subtitle level={5}>{ '6 GHz' }</Subtitle></label>
                  <span>{apDetail.channel60.channel || noDataDisplay}</span>
                  <span>{apDetail.channel60.operativeChannelBandwidth || noDataDisplay}</span>
                  <span>{getTxPowerDisplayInfo(apDetail, apDetail.channel60)}</span>
                </UI.TextNumber>
              )
          }
          </UI.WirelessRadioTableContainer>
        </Descriptions.NoLabel>}
      />

      {/* Clients count  */}
      <Descriptions.Item
        label={$t({ defaultMessage: 'Clients Connected' })}
        children={apDetail?.clients || noDataDisplay} />

      {/* Last seen for offline devices */
        apDetail?.lastSeenTime &&
      <Descriptions.Item
        label={$t({ defaultMessage: 'Last Seen' })}
        children={formatter(DateFormatEnum.DateTimeFormat)(apDetail?.lastSeenTime)} />
      }

    </Descriptions>
    <Divider />
    {/* Mesh Role  */}
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Mesh Role' })}
        children={
          getMeshRole(apDetail?.meshRole as APMeshRole || noDataDisplay)
        }
      />
    </Descriptions>
    {/* Connected APs  */}
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'Connected APs' })}
        children={apDetail?.downlinkCount || noDataDisplay}
      />
    </Descriptions>

  </Loader>
  </Card>
}

