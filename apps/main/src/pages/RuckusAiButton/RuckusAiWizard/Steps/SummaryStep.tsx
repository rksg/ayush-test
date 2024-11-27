import { useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { cssStr }                        from '@acx-ui/components'
import { NetworkTypeEnum, networkTypes } from '@acx-ui/rc/utils'

import * as UI                            from './styledComponents'
import { NetworkSummaryPage }             from './SummaryPages/NetworkSummaryPage'
import { SwitchConfigurationSummaryPage } from './SummaryPages/SwitchConfigurationSummaryPage'

export function SummaryStep (props: {
  payload: string
}) {
  const { $t } = useIntl()
  const data = props.payload ? JSON.parse(props.payload) : {}
  const [summaryId, setSummaryId] = useState('' as string)
  const [summaryType, setSummaryType] = useState('' as string)
  const [summaryTitle, setSummaryTitle] = useState('' as string)

  const getNetworkTypeDescription = (type: NetworkTypeEnum) => {
    return $t(networkTypes[type]) || 'Unknown Type'
  }

  return <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <UI.SummaryHeader>
        {$t({ defaultMessage: 'Summary' })}
      </UI.SummaryHeader>
      <UI.SummaryDescription>
        { // eslint-disable-next-line max-len
          $t({ defaultMessage: 'We have completed the setup for your network. Below is a summary. Would you like me to create these configurations and apply them to the <venueSingular></venueSingular> ' })}
        &nbsp;
        <b style={{ color: cssStr('--acx-primary-black') }}>
          {data?.venue?.venueName}
        </b>?
      </UI.SummaryDescription>

      <UI.SummarySplitContainer>
        {/* Left Box */}
        <UI.SummaryBox>
          {/* Wireless Networks */}
          <UI.SummaryContainer>
            <Form.Item
              label={
                <UI.SummaryContainerHeader>
                  {$t({ defaultMessage: 'Wireless Networks' })}
                </UI.SummaryContainerHeader>
              }
              style={{ marginBottom: '0px' }}
              children={<UI.SummaryUl>
                { // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data?.wlan?.map((item: any, index: number) => {
                    const { id, 'SSID Name': ssidName, 'SSID Type': ssidType } = item
                    const title = `${ssidName} with ${getNetworkTypeDescription(ssidType)}`
                    return (
                      <UI.SummaryLi
                        key={index}
                        onClick={() => {
                          const sid = `${id}?type=${ssidType}`
                          setSummaryId(sid)
                          setSummaryType('Network')
                          setSummaryTitle(title)
                        }}
                      > {title}
                      </UI.SummaryLi>
                    )
                  })}
              </UI.SummaryUl>
              }
            />
          </UI.SummaryContainer>

          {/* Switch Configuration VLAN */}
          {data.vlan && data.vlan.length > 0 && <UI.SummaryContainer>
            <Form.Item
              label={
                <UI.SummaryContainerHeader>
                  {$t({ defaultMessage: 'Switch Configuration' })}
                </UI.SummaryContainerHeader>
              }
              style={{ marginBottom: '0px' }}
              children={<UI.SummaryUl>
                {// eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data?.vlan?.map((item: any, index: number) => {
                    const { id, 'VLAN Name': vlanName, 'VLAN ID': vlanId } = item
                    const title = `${vlanName} @ VLAN  ${vlanId}`
                    return <UI.SummaryLi key={index}
                      onClick={() => {
                        setSummaryId(id)
                        setSummaryType('SwitchConfiguration')
                        setSummaryTitle(title)
                      }}>
                      {title}
                    </UI.SummaryLi>
                  })}
              </UI.SummaryUl>}
            />
          </UI.SummaryContainer>
          }
        </UI.SummaryBox>
        <UI.SummaryDivider />

        {/* Right Box */}
        <UI.SummaryBox>
          {summaryType === 'Network' && <UI.SummaryContainer>
            <NetworkSummaryPage summaryId={summaryId} summaryTitle={summaryTitle} />
          </UI.SummaryContainer>}

          {summaryType === 'SwitchConfiguration' && <UI.SummaryContainer>
            <SwitchConfigurationSummaryPage summaryId={summaryId} summaryTitle={summaryTitle}/>
          </UI.SummaryContainer>}

        </UI.SummaryBox>
      </UI.SummarySplitContainer>

    </div>
  </div>
}
