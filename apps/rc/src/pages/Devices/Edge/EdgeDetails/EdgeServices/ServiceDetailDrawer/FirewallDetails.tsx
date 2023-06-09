import { useIntl } from 'react-intl'

import { Loader, Subtitle }                             from '@acx-ui/components'
import { EdgeFirewallGroupedStatsTables }               from '@acx-ui/rc/components'
import { useGetEdgeFirewallQuery, useGetEdgeListQuery } from '@acx-ui/rc/services'
import { EdgeService }                                  from '@acx-ui/rc/utils'

interface FirewallDetailsProps {
  serviceData: EdgeService;
}

export const FirewallDetails = (props: FirewallDetailsProps) => {
  const { $t } = useIntl()
  const { serviceData } = props
  const { edgeId, serviceId } = serviceData

  // get edge data by edgeId
  const { edgeData, ...reqStates } = useGetEdgeListQuery({
    payload: {
      fields: [
        'serialNumber',
        'venueId'
      ],
      filters: { serialNumber: [edgeId] }
    } }, {
    selectFromResult: ({ data, isLoading }) => ({
      edgeData: data?.data[0],
      isLoading
    })
  })

  // get firewall by firewallId
  const {
    data: edgeFirewallData,
    isLoading: isFWInfoLoading
  } = useGetEdgeFirewallQuery({ params: { serviceId } })

  return <Loader states={[reqStates, { isLoading: isFWInfoLoading }]}>
    <Subtitle level={3}>
      { $t({ defaultMessage: 'Firewall Details' }) }
    </Subtitle>
    <EdgeFirewallGroupedStatsTables
      edgeData={edgeData!}
      edgeFirewallData={edgeFirewallData!}
    />
  </Loader>
}