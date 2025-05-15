import { Descriptions, Subtitle } from '@acx-ui/components'
import { getOsTypeIcon }          from '@acx-ui/rc/utils'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import { useApWiredClientContext } from '../ApWiredClientContextProvider'

import * as UI from './styledComponents'


const ApWiredClientOverviewTab = () => {
  const { $t } = getIntl()

  const { clientInfo } = useApWiredClientContext()


  return (<>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Client Details' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'MAC Address' })}
        children={clientInfo?.macAddress || noDataDisplay}
      />
      <Descriptions.Item
        label={$t({ defaultMessage: 'OS' })}
        children={clientInfo?.osType ? <UI.OsType size={4}>
          {getOsTypeIcon(clientInfo?.osType || '')}
          {clientInfo?.osType}
        </UI.OsType> : noDataDisplay}
      />
    </Descriptions>
    <Subtitle level={4}>
      {$t({ defaultMessage: 'Connection' })}
    </Subtitle>
    <Descriptions labelWidthPercent={50}>
      <Descriptions.Item
        label={$t({ defaultMessage: 'IP Address' })}
        children={clientInfo?.ipAddress || noDataDisplay}
      />

    </Descriptions>
  </>)

}

export default ApWiredClientOverviewTab