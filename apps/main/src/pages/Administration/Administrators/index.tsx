import { useIntl } from 'react-intl'

const Administrators = () => {
  const { $t } = useIntl()
  return <>{$t({ defaultMessage: 'Administrators' })}</>
}

export default Administrators