import { useIntl } from 'react-intl'

function GenericError ({ errMsg } : { errMsg?: string }) {
  const { $t } = useIntl()
  const msg = errMsg || 'Please reduce the time period selection and try again.'
  return <div>
    {$t({ defaultMessage: '{msg}' }, { msg })}
  </div>
}
export default GenericError
