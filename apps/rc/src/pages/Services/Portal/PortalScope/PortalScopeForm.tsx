import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm } from '@acx-ui/components'

import PortalScopeNetworkTable from './PortalScopeNetworkTable'

const PortalScopeForm = () => {
  const { $t } = useIntl()

  return (
    <>
      <StepsForm.Title>{$t({ defaultMessage: 'Networks' })}</StepsForm.Title>

      <Form.Item
        name='network'
        label={$t({
          defaultMessage:
            'Select the wireless networks where the Portal Service will be applied:'
        })}
      >
        <PortalScopeNetworkTable />
      </Form.Item>

    </>
  )
}

export default PortalScopeForm
