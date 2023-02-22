import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow, Loader } from '@acx-ui/components'

import { useNetworkHealthTest } from '../../services'
import { NetworkHealthTest }    from '../../types'

import { ConfigSection }    from './ConfigSection'
import { ExecutionSection } from './ExecutionSection'

const Overview = () => {
  const { $t } = useIntl()
  const queryResults = useNetworkHealthTest()
  return <Loader states={[queryResults]}>
    <GridRow>
      <GridCol col={{ span: 6 }}>
        <Card type='no-border' title={$t({ defaultMessage: 'Test Configuration' })} >
          <ConfigSection details={queryResults.data as NetworkHealthTest} />
        </Card>
      </GridCol>
      <GridCol col={{ span: 18 }}>
        <Card type='no-border' title={$t({ defaultMessage: 'Execution' })} >
          <ExecutionSection details={queryResults.data as NetworkHealthTest} />
        </Card>
      </GridCol>
    </GridRow>
  </Loader>
}

export { Overview }
