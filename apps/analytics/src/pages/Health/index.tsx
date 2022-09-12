import { useIntl } from 'react-intl'

import Header from '../../components/Header'

import { HealthPageContextProvider } from './HealthPageContext'

export default function HealthPage () {
  const { $t } = useIntl()
  return <HealthPageContextProvider>
    <Header title={$t({ defaultMessage: 'Health' })} />
  </HealthPageContextProvider>
}
