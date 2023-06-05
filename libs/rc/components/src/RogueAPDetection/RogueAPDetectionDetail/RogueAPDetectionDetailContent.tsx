import React, { useContext, useEffect } from 'react'

import { Typography } from 'antd'
import { useIntl }    from 'react-intl'
import { useParams }  from 'react-router-dom'

import { Card, GridCol, GridRow, Loader } from '@acx-ui/components'
import { useRoguePolicyQuery }            from '@acx-ui/rc/services'

import { RogueAPDetailContext } from './RogueAPDetectionDetailView'

const RogueAPDetectionDetailContent = () => {
  const { Paragraph } = Typography
  const { $t } = useIntl()

  const { data, isLoading } = useRoguePolicyQuery({
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

  return <Loader states={[{ isLoading }]}>
    <Card>
      { data && <GridRow>
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
      </GridRow> }
    </Card>
  </Loader>
}

export default RogueAPDetectionDetailContent
