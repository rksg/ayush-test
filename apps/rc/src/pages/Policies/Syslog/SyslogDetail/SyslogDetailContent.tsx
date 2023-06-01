import React, { useContext, useEffect } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'
import { useParams }  from 'react-router-dom'

import { Card, GridCol, GridRow, Loader } from '@acx-ui/components'
import { useGetSyslogPolicyQuery }        from '@acx-ui/rc/services'
import {
  FacilityEnum,
  FlowLevelEnum
} from '@acx-ui/rc/utils'

import { facilityLabelMapping, flowLevelLabelMapping } from '../../contentsMap'

import { SyslogDetailContext } from './SyslogDetailView'

const SyslogDetailContent = () => {
  const { Paragraph } = Typography
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

  return <Loader states={[{ isLoading }]}>
    <Card>
      {data && <GridRow>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Primary Server' })}
          </Card.Title>
          <Paragraph>
            {`${data.primary.server}
            :${data.primary.port} ${data.primary.protocol}`}
          </Paragraph>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Secondary Server' })}
          </Card.Title>
          <Paragraph>
            {data.secondary?.server ? `${data.secondary?.server}
            :${data.secondary?.port} ${data.secondary?.protocol}` : ''}
          </Paragraph>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Event Facility' })}
          </Card.Title>
          <Paragraph>
            {data.facility ? $t(facilityLabelMapping[data.facility as FacilityEnum]) : ''}
          </Paragraph>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Send Logs' })}
          </Card.Title>
          <Paragraph>
            {data.flowLevel ? $t(flowLevelLabelMapping[data.flowLevel as FlowLevelEnum]) : ''}
          </Paragraph>
        </GridCol>
      </GridRow>}
    </Card>
  </Loader>
}

export default SyslogDetailContent
