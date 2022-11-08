import React, { useContext, useEffect } from 'react'

import { Row, Typography } from 'antd'
import { useIntl }         from 'react-intl'
import { useParams }       from 'react-router-dom'

import { Card, GridCol, GridRow } from '@acx-ui/components'
import { useRoguePolicyQuery }    from '@acx-ui/rc/services'

import { RogueAPDetailContext } from './RogueAPDetectionDetailView'

const RogueAPDetectionDetailContent = () => {
  const { Paragraph } = Typography
  const { $t } = useIntl()

  const { data } = useRoguePolicyQuery({
    params: useParams()
  })

  const { setFiltersId } = useContext(RogueAPDetailContext)

  useEffect(() => {
    if (data){
      const filtersIdList = data.venues ? data.venues.map(venue => venue.id) : ['UNDEFINED']
      setFiltersId(filtersIdList)
    }
  }, [data])

  if (data) {
    return <Card>
      <GridRow style={{ width: '100%' }}>
        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Tags' })}
          </Card.Title>
          <Paragraph>{[].join(', ')}</Paragraph>
        </GridCol>

        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Classification Rules' })}
          </Card.Title>
          <Paragraph>{data.rules.length}</Paragraph>
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

export default RogueAPDetectionDetailContent
