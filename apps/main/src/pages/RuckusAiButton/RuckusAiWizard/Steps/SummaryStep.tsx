import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { cssStr }                        from '@acx-ui/components'
import { NetworkTypeEnum, networkTypes } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

// Need to confirm the new UX with the PLM
export function SummaryStep (props: {
  payload: string
}) {
  const { $t } = useIntl()
  const data = props.payload ? JSON.parse(props.payload) : {}

  const getNetworkTypeDescription = (type: NetworkTypeEnum) => {
    return $t(networkTypes[type]) || 'Unknown Type'
  }

  return <div style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{
      flex: '0 1 auto',
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

      <UI.SummaryContainer>
        <Form.Item
          label={
            <UI.SummaryContainerHeader>
              {$t({ defaultMessage: 'Wireless Networks' })}
            </UI.SummaryContainerHeader>
          }
          style={{ marginBottom: '0px' }}
          children={<ul style={{ marginBottom: '0px' }}>
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data?.wlan?.map((item: any, index: number) => (
                <li key={index}>
                  {`${item['SSID Name']} with ${getNetworkTypeDescription(item['SSID Type'])}`}</li>
              ))}
          </ul>
          }
        />
      </UI.SummaryContainer>

      {data.vlan && data.vlan.length > 0 && <UI.SummaryContainer>
        <Form.Item
          label={
            <UI.SummaryContainerHeader>
              {$t({ defaultMessage: 'Switch Configuration' })}
            </UI.SummaryContainerHeader>
          }
          style={{ marginBottom: '0px' }}
          children={<ul style={{ marginBottom: '0px' }}>
            {// eslint-disable-next-line @typescript-eslint/no-explicit-any
              data?.vlan?.map((item: any, index: number) => (
                <li key={index}>{`${item['VLAN Name']} @ VLAN  ${item['VLAN ID']}`}</li>
              ))}
          </ul>}
        />
      </UI.SummaryContainer>
      }

    </div>
  </div>
}
