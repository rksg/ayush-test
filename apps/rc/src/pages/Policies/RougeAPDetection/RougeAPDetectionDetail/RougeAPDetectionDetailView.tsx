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

import RougeAPDetectionDetailContent from './RougeAPDetectionDetailContent'
import RougeAPDetectionVenueDetail   from './RougeAPDetectionVenueDetail'

const RougeAPDetectionDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()

  return (
    <>
      <PageHeader
        title={`${$t({ defaultMessage: 'Rouge AP Detection policy' })}`}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Policies' }), link: '/policies' }
        ]}
        extra={[
          <TenantLink to={`/policies/rougeAPDetection/${params.policyId}/edit`} key='edit'>
            <Button key={'configure'} type={'primary'}>
              {$t({ defaultMessage: 'Configure' })}
            </Button>
          </TenantLink>
        ]}
      />

      <GridRow>
        <GridCol col={{ span: 24 }}>
          <RougeAPDetectionDetailContent />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <RougeAPDetectionVenueDetail />
        </GridCol>
      </GridRow>
    </>
  )
}

export default RougeAPDetectionDetailView
