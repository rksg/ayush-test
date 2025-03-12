import { useIntl } from 'react-intl'

import { Drawer }    from '@acx-ui/components'
import { useParams } from '@acx-ui/react-router-dom'


import WithApAndSwitchDiagram from '../../../../../assets/images/personal-identity-diagrams/personal-identity-with-ap-and-switch.svg'

import { MessageMapping } from './MessageMapping'
import * as UI            from './styledComponents'


export function PersonalIdentityPreparationListDrawer (props: {
  open: boolean;
  onClose?: () => void
}) {
  const { $t } = useIntl()
  useParams()
  const { open, onClose } = props

  return (
    <Drawer
      title={$t({ defaultMessage: 'Get prepared for Personal Identity Network:' })}
      visible={open}
      onClose={onClose}
      destroyOnClose={true}
      width={550}
    >

      <UI.List>
        <ol>
          <li>
            {MessageMapping.pin_preparation_list_desc_1}
          </li>
          <li>
            {MessageMapping.pin_preparation_list_desc_2}
            <ul >
              <li>
                {MessageMapping.pin_preparation_list_desc_2_1}
              </li>
              <li>
                {MessageMapping.pin_preparation_list_desc_2_2}
              </li>
            </ul>
          </li>
        </ol>
        <dl>
          <u>{MessageMapping.pin_preparation_list_for_wifi}</u>
          <dt>{MessageMapping.pin_preparation_list_for_wifi_desc_1}</dt>
          <dd><ul><li>
            {MessageMapping.pin_preparation_list_for_wifi_desc_1_1}
          </li></ul></dd>
        </dl>
        <dl>
          <u>{MessageMapping.pin_preparation_list_for_switch}</u>
          <dt>
            {MessageMapping.pin_preparation_list_for_switch_desc_1}
          </dt>
        </dl>
      </UI.List>
      <UI.List>
        <dl>
          {MessageMapping.pin_preparation_list_start_desc}
        </dl>
      </UI.List>
      <UI.List>
        <dl>
          {MessageMapping.pin_preparation_list_diagram_desc}
        </dl>
      </UI.List>
      <img
        style={{ margin: 'auto', marginTop: '10px' }}
        src={WithApAndSwitchDiagram}
        width={350}
        alt={$t({ defaultMessage: 'Personal Identity Topology' })}
      />
    </Drawer>
  )
}

