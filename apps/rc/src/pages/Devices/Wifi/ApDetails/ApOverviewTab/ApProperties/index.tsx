import { useState } from 'react'

import { Divider, Form } from 'antd'
import { useIntl }       from 'react-intl'

import {
  Loader,
  Card,
  Subtitle
} from '@acx-ui/components'
import { ApVenueStatusEnum } from '@acx-ui/rc/utils'
import { TenantLink }        from '@acx-ui/react-router-dom'

import { ApDetailsDrawer } from './ApDetailsDrawer'
import * as UI             from './styledComponents'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ApProperties (props: { apViewModelQuery: any, apDetailsQuery: any }) {
  const { $t } = useIntl()
  const [visible, setVisible] = useState(false)
  const { apViewModelQuery, apDetailsQuery } = props
  const currentAP = apViewModelQuery.data
  const apDetails = apDetailsQuery.data
  const onMoreAction = () => {
    setVisible(true)
  }
  return (
    <Loader states={[apViewModelQuery, apDetailsQuery]}>
      <Card title={$t({ defaultMessage: 'AP Properties' })}
        action={{
          actionName: $t({ defaultMessage: 'More' }),
          onActionClick: onMoreAction
        }}
      >
        <UI.Container>
          <Form
            labelCol={{ span: 10 }}
            labelAlign='left'
          >
            <Form.Item
              label={$t({ defaultMessage: 'Venue' })}
              children={
                <TenantLink to={`/venues/${currentAP?.venueId}/venue-details/overview`}>
                  {currentAP?.venueName}
                </TenantLink>}
            />
            <Form.Item
              label={$t({ defaultMessage: 'AP Group' })}
              children={
                currentAP?.deviceGroupName || $t({ defaultMessage: 'None' })
              }
            />
            <Divider style={{ margin: '20px 0' }}/>
            {
              currentAP?.deviceStatusSeverity === ApVenueStatusEnum.OPERATIONAL ?
                (
                  <>
                    <Form.Item
                      label={$t({ defaultMessage: 'Uptime' })}
                      children={currentAP?.uptime}
                    />
                    <Form.Item
                      label={$t({ defaultMessage: 'Last Seen' })}
                      children={currentAP?.lastSeenTime}
                    />
                    <Form.Item
                      label={$t({ defaultMessage: 'Wireless Radio' })}
                    />
                    <UI.TextHeader>
                      <label></label>
                      <label><span>RF</span><span>Channel</span></label>
                      <label><span>RF</span><span>Bandwidth</span></label>
                      <label><span>TX Power</span></label>
                    </UI.TextHeader>
                    {
                      currentAP?.channel24 &&
                    (
                      <UI.TextNumber>
                        <label><Subtitle level={5}>{ '2.4 GHz' }</Subtitle></label>
                        <span>{currentAP.channel24.channel || '--'}</span>
                        <span>{currentAP.channel24.operativeChannelBandwidth || '--'}</span>
                        <span>{currentAP.channel24.txPower || '--'}</span>
                      </UI.TextNumber>
                    )
                    }
                    {
                      currentAP?.channel50 &&
                    (
                      <UI.TextNumber>
                        <label><Subtitle level={5}>{ '5 GHz' }</Subtitle></label>
                        <span>{currentAP.channel50.channel || '--'}</span>
                        <span>{currentAP.channel50.operativeChannelBandwidth || '--'}</span>
                        <span>{currentAP.channel50.txPower || '--'}</span>
                      </UI.TextNumber>
                    )
                    }
                    {
                      currentAP?.channelL50 &&
                    (
                      <UI.TextNumber>
                        <label><Subtitle level={5}>{ 'LO 5 GHz' }</Subtitle></label>
                        <span>{currentAP.channelL50.channel || '--'}</span>
                        <span>{currentAP.channelL50.operativeChannelBandwidth || '--'}</span>
                        <span>{currentAP.channelL50.txPower || '--'}</span>
                      </UI.TextNumber>
                    )
                    }
                    {
                      currentAP?.channelU50 &&
                    (
                      <UI.TextNumber>
                        <label><Subtitle level={5}>{ 'HI 5 GHz' }</Subtitle></label>
                        <span>{currentAP.channelU50.channel || '--'}</span>
                        <span>{currentAP.channelU50.operativeChannelBandwidth || '--'}</span>
                        <span>{currentAP.channelU50.txPower || '--'}</span>
                      </UI.TextNumber>
                    )
                    }
                    {
                      currentAP?.channel60 &&
                    (
                      <UI.TextNumber>
                        <label><Subtitle level={5}>{ '6 GHz' }</Subtitle></label>
                        <span>{currentAP.channel60.channel || '--'}</span>
                        <span>{currentAP.channel60.operativeChannelBandwidth || '--'}</span>
                        <span>{currentAP.channel60.txPower || '--'}</span>
                      </UI.TextNumber>
                    )
                    }
                  </>
                ) : <UI.NoOnlineInfo>
                  {$t({ defaultMessage: 'No Online information' })}
                </UI.NoOnlineInfo>
            }
            {
              currentAP?.apStatusData?.cellularInfo &&
              (
                <>
                  <Form.Item
                    label={$t({ defaultMessage: 'Cellular Radio' })}
                    style={{ marginBottom: '0px' }}
                  />
                  <Form.Item
                    label={$t({ defaultMessage: 'Active SIM' })}
                    style={{ marginLeft: '10px', marginBottom: '0px' }}
                    children={
                      currentAP.apStatusData.cellularInfo.cellularActiveSim || '--'
                    }
                  />
                  <Form.Item
                    label={$t({ defaultMessage: 'Connection Status' })}
                    style={{ marginLeft: '10px', marginBottom: '0px' }}
                    children={
                      currentAP.apStatusData.cellularInfo.cellularConnectionStatus || '--'
                    }
                  />
                  <Form.Item
                    label={$t({ defaultMessage: 'Signal Strength' })}
                    style={{ marginLeft: '10px' }}
                    children={
                      currentAP.apStatusData.cellularInfo.cellularSignalStrength || '--'
                    }
                  />
                </>
              )
            }
          </Form>
        </UI.Container>
      </Card>
      <ApDetailsDrawer
        visible={visible}
        setVisible={setVisible}
        currentAP={currentAP}
        apDetails={apDetails}
      />
    </Loader>
  )
}

