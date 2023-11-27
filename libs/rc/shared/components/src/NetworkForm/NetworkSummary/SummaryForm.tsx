import React from 'react'

import { EnvironmentOutlined }     from '@ant-design/icons'
import { Col, Divider, Form, Row } from 'antd'
import { useIntl }                 from 'react-intl'

import { StepsFormLegacy, Subtitle }                                                             from '@acx-ui/components'
import { Features, useIsTierAllowed }                                                            from '@acx-ui/feature-toggle'
import { useMacRegListsQuery, useVenuesListQuery }                                               from '@acx-ui/rc/services'
import { Demo, NetworkSaveData, NetworkTypeEnum, transformDisplayText, Venue, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { useParams }                                                                             from '@acx-ui/react-router-dom'

import { captiveTypes, networkTypes } from '../contentsMap'

import { AaaSummaryForm }    from './AaaSummaryForm'
import { DpskSummaryForm }   from './DpskSummaryForm'
import { PortalSummaryForm } from './PortalSummaryForm'
import { PskSummaryForm }    from './PskSummaryForm'

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
  portalData?: Demo
}) {
  const { $t } = useIntl()
  const { summaryData, portalData } = props
  const params = useParams()
  const { data } = useVenuesListQuery({ params:
    { tenantId: params.tenantId, networkId: 'UNKNOWN-NETWORK-ID' }, payload: defaultPayload })

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
      <StepsFormLegacy.Title>{ $t({ defaultMessage: 'Summary' }) }</StepsFormLegacy.Title>
      <Row gutter={20}>
        <Col flex={1}>
          <Subtitle level={4}>
            { $t({ defaultMessage: 'Network Info' }) }
          </Subtitle>
          <Form.Item label={$t({ defaultMessage: 'Network Name:' })} children={summaryData.name} />
          {summaryData.name !== summaryData?.wlan?.ssid &&
            <Form.Item label={$t({ defaultMessage: 'SSID:' })} children={summaryData?.wlan?.ssid} />
          }
          <Form.Item
            label={$t({ defaultMessage: 'Description:' })}
            children={transformDisplayText(summaryData.description)}
          />
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
          {summaryData.type !== NetworkTypeEnum.PSK && summaryData.type !== NetworkTypeEnum.AAA &&
            summaryData.type!==NetworkTypeEnum.CAPTIVEPORTAL
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
          {summaryData.type === NetworkTypeEnum.DPSK
          && summaryData.isCloudpathEnabled
            && <>
              <Form.Item
                label={$t({ defaultMessage: 'Proxy Service' })}
                children={summaryData?.enableAuthProxy
                  ? $t({ defaultMessage: 'Enabled' })
                  : $t({ defaultMessage: 'Disabled' })
                }
              />
              {summaryData.accountingRadius &&
                <Form.Item
                  label={$t({ defaultMessage: 'Accounting Service' })}
                  children={`${summaryData.accountingRadius?.name}`}
                />
              }
            </>
          }
          {summaryData.isCloudpathEnabled && !summaryData.wlan?.macRegistrationListId &&
            <>
              <Form.Item
                label={$t({ defaultMessage: 'Authentication Server' })}
                children={`${summaryData.authRadius?.name}`}
              />
              {summaryData.accountingRadius &&
                <Form.Item
                  label={$t({ defaultMessage: 'Accounting Service' })}
                  children={`${summaryData.accountingRadius?.name}`}
                />
              }
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
          {summaryData.type === NetworkTypeEnum.DPSK &&
            <DpskSummaryForm summaryData={summaryData} />
          }
          {summaryData.type === NetworkTypeEnum.PSK &&
            <PskSummaryForm summaryData={summaryData} />
          }
          {summaryData.type === NetworkTypeEnum.CAPTIVEPORTAL &&
            <PortalSummaryForm summaryData={summaryData} portalData={portalData}/>
          }
        </Col>
        <Divider type='vertical' style={{ height: '300px' }}/>
        <Col flex={1}>
          <Subtitle level={4}>
            { $t({ defaultMessage: 'Activated in venues' }) }
          </Subtitle>
          <Form.Item children={getVenues()} />
        </Col>
      </Row>
    </>
  )
}
