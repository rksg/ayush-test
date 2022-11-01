import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  Button,
  PageHeader
} from '@acx-ui/components'
import { TenantLink } from '@acx-ui/react-router-dom'

import RogueAPDetectionDetailContent from './RogueAPDetectionDetailContent'
import RogueAPDetectionVenueDetail   from './RogueAPDetectionVenueDetail'

const RogueAPDetectionDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()

  return (
    <>
      <PageHeader
        title={`${$t({ defaultMessage: 'Rogue AP Detection policy' })}`}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: '/policies' }
        ]}
        extra={[
          <TenantLink to={`/policies/rogueAPDetection/${params.policyId}/edit`} key='edit'>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          </TenantLink>
        ]}
      />

      <GridRow>
        <GridCol col={{ span: 24 }}>
          <RogueAPDetectionDetailContent />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <RogueAPDetectionVenueDetail />
        </GridCol>
      </GridRow>
    </>
  )
}

export default RogueAPDetectionDetailView
