/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const vlanContents = {
  vlan: defineMessage({
    defaultMessage: `VLAN-{id} {isCustom, selectordinal,
        one {(Custom)}
        other {(Default)}
      }`,
    description: 'Translation not needed'
  }),
  vlanPool: defineMessage({
    defaultMessage: `VLAN Pool: {poolName} {isCustom, selectordinal,
        one {(Custom)}
        other {(Default)}
      }`,
    description: 'Translation string - VLAN Pool'
  })
}

export const usbTooltipInfo = defineMessage({
  defaultMessage: 'Enable or disable the USB port for IoT-connected devices. When enabled, the port supports IoT device connectivity and data transfer.{br}Please be aware that for PoE APs, the USB port will not be supported when using PoE 802.3af or 802.3at due to insufficient power.',
  description: 'Tooltips message of the AP USB support feature'
})
