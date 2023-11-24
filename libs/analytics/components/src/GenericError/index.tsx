import { useIntl } from 'react-intl'

function GenericError ({ errMsg } : { errMsg?: string }) {
  const { $t } = useIntl()
  const msg = errMsg
    || $t({ defaultMessage: 'Please reduce the time period selection and try again.' })
  return <div>
    { msg }
  </div>
}
export default GenericError
