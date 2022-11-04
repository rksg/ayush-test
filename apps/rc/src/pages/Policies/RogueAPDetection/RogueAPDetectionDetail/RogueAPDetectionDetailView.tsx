import React, { createContext, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  Button,
  PageHeader
} from '@acx-ui/components'
import { RogueAPDetailContextType } from '@acx-ui/rc/utils'
import { TenantLink }               from '@acx-ui/react-router-dom'

import RogueAPDetectionDetailContent from './RogueAPDetectionDetailContent'
import RogueAPDetectionVenueDetail   from './RogueAPDetectionVenueDetail'

export const RogueAPDetailContext = createContext({} as RogueAPDetailContextType)

const RogueAPDetectionDetailView = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [filtersId, setFiltersId] = useState([] as string[])

  return (
    <>
      <RogueAPDetailContext.Provider value={{ filtersId, setFiltersId }}>
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
            { filtersId.length && <RogueAPDetectionVenueDetail /> }
          </GridCol>
        </GridRow>
      </RogueAPDetailContext.Provider>
    </>
  )
}

export default RogueAPDetectionDetailView
