import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow, Loader } from '@acx-ui/components'

import { useServiceGuardTest } from '../../services'
import { ServiceGuardTest }    from '../../types'

import { ConfigSection }    from './ConfigSection'
import { ExecutionSection } from './ExecutionSection'

const Overview = () => {
  const { $t } = useIntl()
  const queryResults = useServiceGuardTest()
  return <Loader states={[queryResults]}>
    <GridRow>
      <GridCol col={{ span: 6 }}>
        <Card type='no-border' title={$t({ defaultMessage: 'Test Configuration' })} >
          <ConfigSection details={queryResults.data as ServiceGuardTest} />
        </Card>
      </GridCol>
      <GridCol col={{ span: 18 }}>
        <Card type='no-border' title={$t({ defaultMessage: 'Execution' })} >
          <ExecutionSection details={queryResults.data as ServiceGuardTest} />
        </Card>
      </GridCol>
    </GridRow>
  </Loader>
}

export { Overview }
