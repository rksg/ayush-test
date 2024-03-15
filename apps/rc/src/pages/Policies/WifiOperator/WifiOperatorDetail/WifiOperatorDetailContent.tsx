import { useContext, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { Loader, SummaryCard }     from '@acx-ui/components'
import { useGetWifiOperatorQuery } from '@acx-ui/rc/services'
import { useParams }               from '@acx-ui/react-router-dom'

import { WifiOperatorDetailContext } from './WifiOperatorDetailView'


const WifiOperatorDetailContent = () => {
  const { $t } = useIntl()

  const { data , isLoading } = useGetWifiOperatorQuery({
    params: useParams()
  })

  const { setFiltersId, setPolicyName } = useContext(WifiOperatorDetailContext)

  useEffect(() => {
    if (data){
      const policyIdList = data ? [data.id] : ['UNDEFINED']
      setFiltersId(policyIdList)
      setPolicyName(data.name ?? '')
    }
  }, [data])

  const wifiOperatorInfo = [
    {
      title: $t({ defaultMessage: 'Domain' }),
      content: () => data?.domainNames.map((item) => <div key={item}>{item}</div>),
      visible: Boolean(data)
    },
    {
      title: $t({ defaultMessage: 'Friendly Name' }),
      content: `${data?.friendlyNames.length}`,
      visible: Boolean(data)
    }
  ]

  return <Loader states={[{ isLoading }]}>
    <SummaryCard data={wifiOperatorInfo} />
  </Loader>
}

export default WifiOperatorDetailContent