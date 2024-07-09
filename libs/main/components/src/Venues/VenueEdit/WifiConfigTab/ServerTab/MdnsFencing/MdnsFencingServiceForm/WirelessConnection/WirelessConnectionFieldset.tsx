import { useIntl } from 'react-intl'

import { FencingRangeRadioGroup, FieldsetItem } from '../../utils'


export const WirelessConnectionFieldset = () => {
  const { $t } = useIntl()

  return (
    <FieldsetItem
      name='wirelessEnabled'
      label={$t({ defaultMessage: 'Wireless Connection' })}
      initialValue={false}
      children={<FencingRangeRadioGroup
        style={{ paddingBottom: '16px' }}
        fieldName={['wirelessRule', 'fencingRange']}
      />}
      switchStyle={{ marginLeft: '20px' }}/>
  )
}
