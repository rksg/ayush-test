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

  const { setFiltersId, setPolicyName } = useContext(RogueAPDetailContext)

  useEffect(() => {
    if (data){
      const filtersIdList = data.venues?.map(venue => venue.id) ?? ['UNDEFINED']
      setFiltersId(filtersIdList)
      setPolicyName(data.name ?? '')
    }
  }, [data])

  if (data) {
    return <Card>
      <GridRow>
        {/* TODO: temporarily hidden until tags column has been supported */}
        {/*<GridCol col={{ span: 4 }}>*/}
        {/*  <Card.Title>*/}
        {/*    {$t({ defaultMessage: 'Tags' })}*/}
        {/*  </Card.Title>*/}
        {/*  <Paragraph>*/}
        {/*    <FormattedList type='conjunction' value={[]} />*/}
        {/*  </Paragraph>*/}
        {/*</GridCol>*/}

        <GridCol col={{ span: 4 }}>
          <Card.Title>
            {$t({ defaultMessage: 'Description' })}
          </Card.Title>
          <Paragraph>{data.description}</Paragraph>
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
