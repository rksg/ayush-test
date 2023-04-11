
import { useIntl } from 'react-intl'

import { Tabs }                   from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import ApFirmware     from './ApFirmware'
import EdgeFirmware   from './EdgeFirmware'
import SwitchFirmware from './SwitchFirmware'

const FWVersionMgmt = () => {
  const { $t } = useIntl()
  const isEdgeEnabled = useIsSplitOn(Features.EDGES)

  const tabs = {
    apFirmware: {
      title: $t({ defaultMessage: 'AP Firmware' }),
      content: <ApFirmware />,
      visible: true
    },
    switchFirmware: {
      title: $t({ defaultMessage: 'Switch Firmware' }),
      content: <SwitchFirmware />,
      visible: true
    },
    edgeFirmware: {
      title: $t({ defaultMessage: 'Edge Firmware' }),
      content: <EdgeFirmware />,
      visible: isEdgeEnabled
    }
  }

  return (
    <Tabs
      defaultActiveKey='apFirmware'
      type='card'
    >
      {
        Object.entries(tabs).map((item) =>
          item[1].visible &&
          <Tabs.TabPane
            key={item[0]}
            tab={item[1].title}
            children={item[1].content}
          />)
      }
    </Tabs>
  )
}

export default FWVersionMgmt
