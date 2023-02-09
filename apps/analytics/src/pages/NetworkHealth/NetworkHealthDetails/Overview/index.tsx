import React from 'react'

import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'

import { NetworkHealthTestResult } from '../../services'

import { ConfigSection }    from './ConfigSection'
import { ExecutionSection } from './ExecutionSection'

const Overview = ({ details }: { details: NetworkHealthTestResult }) => {
  const { $t } = useIntl()
  return <GridRow>
    <GridCol col={{ span: 6 }}>
      <Card type='no-border' title={$t({ defaultMessage: 'Test Configuration' })} >
        <ConfigSection details={details} />
      </Card>
    </GridCol>
    <GridCol col={{ span: 18 }}>
      <Card type='no-border' title={$t({ defaultMessage: 'Execution' })} >
        <ExecutionSection details={details} />
      </Card>
    </GridCol>
  </GridRow>
}

export { Overview }
