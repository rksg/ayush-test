import { defineMessage, useIntl } from 'react-intl'

export { kpis } from './common'

const useFormSteps = () => {
  const { $t } = useIntl()
  return [{
    title: $t({ defaultMessage: 'Introduction' })
  }, {
    title: defineMessage({ defaultMessage: 'Intent Priority' })
  }, {
    title: defineMessage({ defaultMessage: 'Settings' })
  }, {
    title: defineMessage({ defaultMessage: 'Summary' })
  }]
}
