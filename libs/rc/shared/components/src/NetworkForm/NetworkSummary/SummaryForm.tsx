import React, { useContext } from 'react'

import { EnvironmentOutlined }     from '@ant-design/icons'
import { Col, Divider, Form, Row } from 'antd'
import _                           from 'lodash'
import { useIntl }                 from 'react-intl'

import { StepsFormLegacy, Subtitle }                from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useMacRegListsQuery, useVenuesListQuery }  from '@acx-ui/rc/services'
import {
  Demo,
  GuestNetworkTypeEnum,
  NetworkSaveData,
  NetworkSummaryExtracData,
  NetworkTypeEnum,
  networkTypes,
  transformDisplayText,
  useConfigTemplate,
  Venue,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { captiveTypes }   from '../contentsMap'
import NetworkFormContext from '../NetworkFormContext'

import { AaaSummaryForm }       from './AaaSummaryForm'
import { DpskSummaryForm }      from './DpskSummaryForm'
import { Hotspot20SummaryForm } from './Hotspot20SummaryForm'
import { OpenSummaryForm }      from './OpenSummaryForm'
import { PortalSummaryForm }    from './PortalSummaryForm'
import { PskSummaryForm }       from './PskSummaryForm'

const defaultPayload = {
  searchString: '',
  pageSize: 10000,
  fields: [
    'name',
    'id'
  ]
}

export function SummaryForm (props: {
  summaryData: NetworkSaveData,
  portalData?: Demo,
  extraData?: NetworkSummaryExtracData,
  isRuckusAiMode?: boolean,
  ruckusAiSummaryTitle?: string
}) {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  // eslint-disable-next-line max-len
  const isRuckusAiMode = (useContext(NetworkFormContext)?.isRuckusAiMode || props.isRuckusAiMode === true)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate
  const { summaryData, portalData, extraData, ruckusAiSummaryTitle } = props
  const params = useParams()
  const { data } = useVenuesListQuery({
    params: { tenantId: params.tenantId, networkId: 'UNKNOWN-NETWORK-ID' },
    payload: {
      ...defaultPayload,
      isTemplate: isTemplate
    }
  })

  const venueList = data?.data.reduce<Record<Venue['id'], Venue>>((map, obj) => {
    map[obj.id] = obj
    return map
  }, {})

  const macRegistrationEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const { data: macRegListOption } = useMacRegListsQuery({
    payload: { pageSize: 10000 }
  }, { skip: !macRegistrationEnabled })

  const getVenues = function () {
    const venues = summaryData.venues
    const rows = []
    if (venues && venues.length > 0) {
      for (const venue of venues) {
        const venueId = venue.venueId || ''
        rows.push(
          <li key={venueId} style={{ margin: '10px 0px' }}>
            <EnvironmentOutlined />
            {venueList && venueList[venueId] ? venueList[venueId].name : venueId}
          </li>
        )
      }
      return rows
    } else {
      return transformDisplayText()
    }
  }

  // @ts-ignore
  return (
    <>
      {_.isEmpty(ruckusAiSummaryTitle) &&
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Summary' })}</StepsFormLegacy.Title>}

      <Row gutter={20}
        style={{
          display: 'grid',
          gridTemplateColumns: isRuckusAiMode ? undefined : '1fr auto 1fr'
        }}>
        <Col flex={1}>
          <Subtitle level={4}>
            {ruckusAiSummaryTitle || $t({ defaultMessage: 'Network Info' })}
          </Subtitle>
          {!isRuckusAiMode && <>
            <Form.Item label={$t({ defaultMessage: 'Network Name:' })}
              children={summaryData.name} />
            {summaryData.name !== summaryData?.wlan?.ssid &&
              <Form.Item label={$t({ defaultMessage: 'SSID:' })}
                children={summaryData?.wlan?.ssid} />
            }
            <Form.Item
              label={$t({ defaultMessage: 'Description:' })}
              style={{ wordBreak: 'break-word' }}
              children={transformDisplayText(summaryData.description)}
            />
          </>
          }
          {summaryData.type !== NetworkTypeEnum.CAPTIVEPORTAL && <Form.Item
            label={$t({ defaultMessage: 'Type:' })}
            children={summaryData.type && $t(networkTypes[summaryData.type])}
          />}
          {summaryData.type === NetworkTypeEnum.CAPTIVEPORTAL && <Form.Item
            label={$t({ defaultMessage: 'Type:' })}
            children={(summaryData.type && $t(networkTypes[summaryData.type]))+' - '+
              (summaryData.guestPortal?.guestNetworkType &&
                 $t(captiveTypes[summaryData.guestPortal?.guestNetworkType]))}
          />}
          {summaryData.type === NetworkTypeEnum.CAPTIVEPORTAL &&
            summaryData.guestPortal &&
            summaryData.guestPortal.guestNetworkType === GuestNetworkTypeEnum.Directory &&
            <Form.Item
              label={$t({ defaultMessage: 'Directory Server:' })}
              children={extraData?.directoryServer?.name ?? ''}
            />}
          {summaryData.type !== NetworkTypeEnum.PSK && summaryData.type !== NetworkTypeEnum.AAA &&
            summaryData.type !== NetworkTypeEnum.CAPTIVEPORTAL &&
            summaryData.type !== NetworkTypeEnum.DPSK &&
            summaryData.type !== NetworkTypeEnum.HOTSPOT20
            && summaryData?.dpskWlanSecurity !== WlanSecurityEnum.WPA23Mixed
          && <Form.Item
            label={$t({ defaultMessage: 'Use RADIUS Server:' })}
            children={
              summaryData.isCloudpathEnabled || summaryData.wlan?.macAddressAuthentication
                ? $t({ defaultMessage: 'Yes' })
                : $t({ defaultMessage: 'No' })
            }
          />
          }
          {!supportRadsec && summaryData.isCloudpathEnabled &&
            <>
              {summaryData.type === NetworkTypeEnum.DPSK &&
                <Form.Item
                  label={$t({ defaultMessage: 'Proxy Service' })}
                  children={summaryData?.enableAuthProxy
                    ? $t({ defaultMessage: 'Enabled' })
                    : $t({ defaultMessage: 'Disabled' })
                  }
                />}
              {!summaryData.wlan?.macRegistrationListId &&
                <Form.Item
                  label={$t({ defaultMessage: 'Authentication Server' })}
                  children={`${summaryData.authRadius?.name}`}
                />}
              {!summaryData.wlan?.macRegistrationListId && summaryData.accountingRadius &&
                <Form.Item
                  label={$t({ defaultMessage: 'Accounting Service' })}
                  children={`${summaryData.accountingRadius?.name}`}
                />}
            </>
          }
          {summaryData.type === NetworkTypeEnum.AAA
          && !summaryData.isCloudpathEnabled && !summaryData.wlan?.macRegistrationListId &&
           <AaaSummaryForm summaryData={summaryData} />
          }
          {summaryData.wlan?.macAddressAuthentication && summaryData.wlan?.macRegistrationListId &&
          <Form.Item
            label={$t({ defaultMessage: 'Mac registration list:' })}
            children={
              `${macRegListOption?.data.find(
                regList => regList.id === summaryData.wlan?.macRegistrationListId
              )?.name}`
            }/>
          }
          {summaryData.type === NetworkTypeEnum.HOTSPOT20 &&
            <Hotspot20SummaryForm summaryData={summaryData} />
          }
          {summaryData.type === NetworkTypeEnum.DPSK &&
            <DpskSummaryForm summaryData={summaryData} />
          }
          {summaryData.type === NetworkTypeEnum.PSK &&
            <PskSummaryForm summaryData={summaryData} />
          }
          {summaryData.type === NetworkTypeEnum.CAPTIVEPORTAL &&
            <PortalSummaryForm summaryData={summaryData} portalData={portalData}/>
          }
          {supportRadsec && summaryData.type === NetworkTypeEnum.OPEN &&
            (summaryData.authRadius && summaryData.wlan?.macAddressAuthentication &&
              !summaryData.wlan?.macRegistrationListId) &&
            <OpenSummaryForm summaryData={summaryData} />
          }
        </Col>
        {!isRuckusAiMode && <>
          <Divider type='vertical' style={{ height: '300px' }} />
          <Col flex={1}>
            <Subtitle level={4}>
              {$t({ defaultMessage: 'Activated in <venuePlural></venuePlural>' })}
            </Subtitle>
            <Form.Item children={getVenues()} />
          </Col>
        </>}

      </Row>
    </>
  )
}
