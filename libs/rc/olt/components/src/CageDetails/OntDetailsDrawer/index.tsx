import { useIntl } from 'react-intl'

import {
  Descriptions,
  Drawer
} from '@acx-ui/components'
import { OltOnt }               from '@acx-ui/olt/utils'
import { transformDisplayText } from '@acx-ui/rc/utils'

export const OntDetailsDrawer = (props: {
  ontDetails: OltOnt
  visible: boolean
  onClose: () => void
}) => {
  const { $t } = useIntl()
  const { ontDetails, visible, onClose } = props

  return (
    <Drawer
      title={$t({ defaultMessage: 'ONT Details' })}
      visible={visible}
      onClose={onClose}
      mask={true}
      maskClosable={true}
      width={480}
      children={<div>
        <Descriptions labelWidthPercent={50} key='ont-details'>
          <Descriptions.Item
            label={$t({ defaultMessage: 'ONT Model' })}
            children={transformDisplayText(ontDetails?.model)}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Software Version' })}
            children={transformDisplayText(ontDetails?.version)}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Uptime' })}
            children={transformDisplayText(ontDetails?.uptime)}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'Number of Ports' })}
            children={transformDisplayText(ontDetails?.ports.toString())}
          />
          <Descriptions.Item
            label={$t({ defaultMessage: 'PoE utilization' })}
            children={transformDisplayText(ontDetails?.poeUtilization)}
          />
        </Descriptions>
      </div>}
    />
  )
}
