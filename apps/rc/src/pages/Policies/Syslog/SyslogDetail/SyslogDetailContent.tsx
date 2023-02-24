import React, { useContext, useEffect } from 'react'

import { Row, Typography } from 'antd'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { Card, GridCol, GridRow }  from '@acx-ui/components'
import { useGetSyslogPolicyQuery } from '@acx-ui/rc/services'

import { SyslogDetailContext } from './SyslogDetailView'

const SyslogDetailContent = () => {
  const { Paragraph } = Typography
  const { $t } = useIntl()

  const { data } = useGetSyslogPolicyQuery({
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

  if (data) {
    return <Card>
      <GridRow>
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
            {data.facility}
          </Paragraph>
        </GridCol>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Send Logs' })}
          </Card.Title>
          <Paragraph>
            {data.flowLevel}
          </Paragraph>
        </GridCol>
      </GridRow>
    </Card>
  } else {
    return <Card>
      <Row gutter={24} justify='space-evenly' style={{ width: '100%' }}>
        <div data-testid='target'>{$t({ defaultMessage: 'Detail content Error' })}</div>
      </Row>
    </Card>
  }
}

export default SyslogDetailContent
