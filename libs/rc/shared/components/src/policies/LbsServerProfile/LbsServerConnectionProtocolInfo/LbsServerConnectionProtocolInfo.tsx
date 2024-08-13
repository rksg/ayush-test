import { Space }                     from 'antd'
import { FormattedMessage, useIntl } from 'react-intl'

import { Tooltip }                  from '@acx-ui/components'
import { LbsServerProfileMessages } from '@acx-ui/rc/utils'

export const LbsServerConnectionProtocolInfo = () => {
  const { $t } = useIntl()

  return (<Space align='start' size={'small'} style={{ width: '600px' }}>
    <FormattedMessage
      defaultMessage={'Connection Protocol: {protocol}   {tooltip}'}
      values={{
        protocol: <b>TLS 1.2</b>,
        tooltip: <Tooltip.Question
          iconStyle={{ width: '20px', height: '14px', marginBottom: '-3px' }}
          title={$t(LbsServerProfileMessages.CONNECTION_PROTOCOL_TOOLTIP)}
          placement='bottom'
        />
      }}
    />
  </Space>)
}