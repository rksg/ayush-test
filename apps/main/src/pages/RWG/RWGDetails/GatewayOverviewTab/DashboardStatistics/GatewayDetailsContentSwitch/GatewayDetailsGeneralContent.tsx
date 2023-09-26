import { useIntl } from 'react-intl'

import { Descriptions }              from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { GatewayDetailsGeneral }     from '@acx-ui/rc/utils'
import { TenantLink }                from '@acx-ui/react-router-dom'


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
      label={$t({ defaultMessage: 'Venue' })}
      children={
        <TenantLink to={'/'}>
          {gatewayDetails?.venueName}
        </TenantLink>
      }
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Hostname' })}
      children={gatewayDetails?.hostname}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Username' })}
      children={gatewayDetails?.username}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Password' })}
      children={gatewayDetails?.password}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Uptime' })}
      children={longDurationFormat(gatewayDetails?.uptimeInSeconds, 'long')}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Booted at' })}
      children={dateTimeFormatter(gatewayDetails?.bootedAt)}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Processor Temperature' })}
      children={$t({ defaultMessage: '{temperature} C' },
        { temperature: Math.round(Number(gatewayDetails?.temperature)) })}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Created' })}
      children={gatewayDetails?.created}
    />
    <Descriptions.Item
      label={$t({ defaultMessage: 'Updated By' })}
      children={gatewayDetails?.updated}
    />
  </Descriptions>
}