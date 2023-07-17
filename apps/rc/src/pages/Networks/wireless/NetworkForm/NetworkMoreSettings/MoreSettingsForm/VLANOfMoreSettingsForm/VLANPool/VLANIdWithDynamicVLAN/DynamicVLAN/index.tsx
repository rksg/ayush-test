import { Form, Switch } from 'antd'
import { useIntl }      from 'react-intl'

import * as UI from '../../../../../styledComponents'



interface DynamicVLANProps {
    enableVxLan: boolean
}

const DynamicVLAN = ({ enableVxLan }: DynamicVLANProps) => {
  const { $t } = useIntl()

  return (
    <UI.FieldLabel width='250px'>
      {$t({ defaultMessage: 'Dynamic VLAN' })}
      <Form.Item
        data-testid={'DynamicVLAN'}
        name={['wlan', 'advancedCustomization', 'dynamicVlan']}
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={true}
        children={<Switch disabled={enableVxLan}/>}
      />
    </UI.FieldLabel>
  )
}

export default DynamicVLAN
