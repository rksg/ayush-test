import { useIntl } from 'react-intl'

import { Descriptions, PasswordInput } from '@acx-ui/components'
import { DateFormatEnum, formatter }   from '@acx-ui/formatter'
import { GatewayDetailsGeneral }       from '@acx-ui/rc/utils'
import { TenantLink }                  from '@acx-ui/react-router-dom'
import { noDataDisplay }               from '@acx-ui/utils'

import * as UI from '../../styledComponents'


export default function GatewayDetailsGeneralContent (props: {
    gatewayDetails: GatewayDetailsGeneral }) {
  const { $t } = useIntl()
  const { gatewayDetails } = props

  const longDurationFormat = formatter('longDurationFormat')
  const dateTimeFormatter = formatter(DateFormatEnum.DateTimeFormatWithSeconds)

  return <Descriptions
    labelStyle={{
      paddingLeft: '8px'
    }}
    labelWidthPercent={40}>
    <Descriptions.Item
      label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
      children={
        gatewayDetails?.venueName
          ? <TenantLink to={`venues/${gatewayDetails?.venueId}/venue-details/overview`}>
            {gatewayDetails?.venueName}
          </TenantLink>
          : noDataDisplay
      }
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Hostname' })}
      children={gatewayDetails?.hostname || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'API Key' })}
      children={gatewayDetails?.apiKey ? <UI.DetailsPassword>
        <PasswordInput
          readOnly
          bordered={false}
          value={gatewayDetails?.apiKey}
        />
      </UI.DetailsPassword> : noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Uptime' })}
      children={longDurationFormat(+(gatewayDetails?.uptimeInSeconds || 0) * 1000, 'long')}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Booted at' })}
      children={dateTimeFormatter(gatewayDetails?.bootedAt || noDataDisplay)}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Processor Temperature' })}
      children={$t({ defaultMessage: '{temperature}' },
        { temperature: gatewayDetails?.temperature
          ? Math.round(Number(gatewayDetails?.temperature)) + ' C'
          : noDataDisplay })}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Created' })}
      children={gatewayDetails?.created || noDataDisplay}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Updated By' })}
      children={gatewayDetails?.updated || noDataDisplay}
    />
  </Descriptions>
}
