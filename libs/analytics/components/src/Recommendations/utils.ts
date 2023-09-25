import _                                    from 'lodash'
import { defineMessage, MessageDescriptor } from 'react-intl'

import { formatter } from '@acx-ui/formatter'
import { getIntl }   from '@acx-ui/utils'

import { enumMap }     from '../ConfigChange/Table/mapping/enumMap'
import { json2keymap } from '../ConfigChange/Table/util'

type CrrmTextType = { recommended: string, txPowerAPCount?: number }
  | Array<{
    radio: string,
    channelMode: string | null,
    channelWidth: string | null,
    autoCellSizing: string | null
  }>

const enumTextMap = json2keymap(['enumType', 'value'], 'text', ['TBD'])(enumMap)
const enumMode = 'com.ruckuswireless.scg.protobuf.ccm.Zone.CcmRadio.ChannelSelectMode'
const enumWidth = 'com.ruckuswireless.scg.protobuf.ccm.Zone.CcmRadio.ChannelWidth'

const currentConfiguration = defineMessage({
  defaultMessage: '{channelMode} and {channelWidth} for {radioList} with {autoCellSizing}'
})
const unknown = defineMessage({ defaultMessage: 'Unknown' })

export const crrmText = (value: CrrmTextType) => {
  const { $t, formatList } = getIntl()
  if (Array.isArray(value)) {
    const data = value.map(config => {
      const channelMode = config.channelMode
        ? $t(enumTextMap.get(`${enumMode}-${config.channelMode}`) as MessageDescriptor)
        : $t(unknown)
      const channelWidthValue = config.channelWidth
        ? $t(enumTextMap.get(`${enumWidth}-${config.channelWidth}`) as MessageDescriptor)
        : $t(unknown)
      const channelWidth = config.channelWidth === '_AUTO'
        ? channelWidthValue
        : formatter('bandwidthFormat')(channelWidthValue)
      const radio = formatter('radioFormat')(config.radio)
      const autoCellSizing = config.autoCellSizing === 'true'
        ? $t({ defaultMessage: 'Auto Cell Sizing on' })
        : $t({ defaultMessage: 'static AP Tx Power' })
      return {
        mode: channelMode,
        width: channelWidth,
        radio: radio,
        autoCellSizing: autoCellSizing
      }
    })
    const groupByData = _.groupBy(
      data, ({ mode, width, autoCellSizing }) => `${mode}-${width}-${autoCellSizing}`)
    const result = Object.values(groupByData)
    return result.map(config => $t(currentConfiguration, {
      channelMode: config[0].mode,
      channelWidth: config[0].width,
      radioList: formatList(config.map(item => item.radio), { type: 'conjunction' }),
      autoCellSizing: config[0].autoCellSizing
    })).join(', ')
  } else {
    const { txPowerAPCount } = value
    // eslint-disable-next-line max-len
    return $t({ defaultMessage: 'AI-Driven RRM for channel and bandwidth plan with {txPowerAPCountText}' }, {
      txPowerAPCountText: txPowerAPCount
        // eslint-disable-next-line max-len
        ? $t({ defaultMessage: `static and reduced AP Tx Power in {txPowerAPCount} {txPowerAPCount, plural,
            one {AP}
            other {APs}
          }` }, { txPowerAPCount })
        : $t({ defaultMessage: 'no change in AP Tx Power' })
    })
  }
}

