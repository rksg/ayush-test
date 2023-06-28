
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, SummaryCard }           from '@acx-ui/components'
import { useGetWifiCallingServiceQuery } from '@acx-ui/rc/services'
import { QosPriorityEnum }               from '@acx-ui/rc/utils'

import { wifiCallingQosPriorityLabelMapping } from '../../contentsMap'

const WifiCallingDetailContent = () => {
  const params = useParams()
  const { $t } = useIntl()

  const { data, isLoading } = useGetWifiCallingServiceQuery({ params: params })

  const wifiCallingInfo = [
    {
      title: $t({ defaultMessage: 'Description' }),
      content: data?.description
    },
    {
      title: $t({ defaultMessage: 'Service Name' }),
      content: data?.serviceName
    },
    {
      title: $t({ defaultMessage: 'Qos Priority' }),
      content: data?.qosPriority &&
        $t(wifiCallingQosPriorityLabelMapping[data.qosPriority as QosPriorityEnum])
    },
    {
      title: $t({ defaultMessage: 'Evolved Packet Data Gateway (ePDG)' }),
      content: <>
        {data?.epdgs?.map(epdg => {
          const ipString = epdg.ip ? `(${epdg.ip})` : ''
          return <div key={`${epdg.domain}`}>{epdg.domain} {ipString}</div>
        })}
      </>
    }
  ]

  return <Loader states={[{ isLoading }]}>
    <SummaryCard data={wifiCallingInfo} colPerRow={6} />
  </Loader>
}

export default WifiCallingDetailContent
