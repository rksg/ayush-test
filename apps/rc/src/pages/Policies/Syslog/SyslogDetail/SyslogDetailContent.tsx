import { useContext, useEffect } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, SummaryCard }     from '@acx-ui/components'
import { useGetSyslogPolicyQuery } from '@acx-ui/rc/services'
import {
  FacilityEnum,
  FlowLevelEnum
} from '@acx-ui/rc/utils'

import { facilityLabelMapping, flowLevelLabelMapping } from '../../contentsMap'

import { SyslogDetailContext } from './SyslogDetailView'

const SyslogDetailContent = () => {
  const { $t } = useIntl()

  const { data, isLoading } = useGetSyslogPolicyQuery({
    params: useParams()
  })

  const { setFiltersId, setPolicyName } = useContext(SyslogDetailContext)

  useEffect(() => {
    if (data){
      const venueIdList = data.venues?.map(venue => venue.id) ?? ['UNDEFINED']
      setFiltersId(venueIdList)
      setPolicyName(data.name ?? '')
    }
  }, [data])

  const syslogInfo = [
    {
      title: $t({ defaultMessage: 'Primary Server' }),
      content: `${data?.primary.server}
      :${data?.primary.port} ${data?.primary.protocol}`,
      visible: Boolean(data)
    },
    {
      title: $t({ defaultMessage: 'Secondary Server' }),
      content: data?.secondary?.server ? `${data?.secondary?.server}
      :${data?.secondary?.port} ${data?.secondary?.protocol}` : '',
      visible: Boolean(data)
    },
    {
      title: $t({ defaultMessage: 'Event Facility' }),
      content: data?.facility ? $t(facilityLabelMapping[data?.facility as FacilityEnum]) : '',
      visible: Boolean(data)
    },
    {
      title: $t({ defaultMessage: 'Send Logs' }),
      content: data?.flowLevel ? $t(flowLevelLabelMapping[data?.flowLevel as FlowLevelEnum]) : '',
      visible: Boolean(data)
    }
  ]

  return <Loader states={[{ isLoading }]}>
    <SummaryCard data={syslogInfo} colPerRow={6} />
  </Loader>
}

export default SyslogDetailContent
