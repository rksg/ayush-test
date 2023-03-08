import { IntlShape, defineMessage, useIntl } from 'react-intl'

import { renderHook } from '@acx-ui/test-utils'

import { stage, allStagesKeys } from './stages'
import { TestStage }            from './types'

describe('stage', () => {
  it('returns stage key & title', () => {
    const convert = ($t: IntlShape['$t'], key: TestStage) => {
      const result = stage(key)
      return { ...result, title: $t(result.title) }
    }

    const { result } = renderHook(() => {
      const { $t } = useIntl()
      return allStagesKeys.map(key => convert($t, key))
    })

    expect(result.current).toEqual([
      { key: 'auth', title: '802.11 Auth' },
      { key: 'assoc', title: 'Association' },
      { key: 'eap', title: 'EAP' },
      { key: 'radius', title: 'RADIUS' },
      { key: 'dhcp', title: 'DHCP' },
      { key: 'userAuth', title: 'L3 Authentication' },
      { key: 'dns', title: 'DNS' },
      { key: 'ping', title: 'Ping' },
      { key: 'traceroute', title: 'Traceroute' },
      { key: 'speedTest', title: 'Speed Test' }
    ])
  })

  it('allowed customizing stage title', () => {
    const title = defineMessage({ defaultMessage: 'Custom Title' })
    const convert = ($t: IntlShape['$t'], key: TestStage) => {
      const result = stage(key, title)
      return { ...result, title: $t(result.title) }
    }

    const { result } = renderHook(() => {
      const { $t } = useIntl()
      return allStagesKeys.map(key => convert($t, key))
    })

    expect(result.current).toEqual([
      { key: 'auth', title: 'Custom Title' },
      { key: 'assoc', title: 'Custom Title' },
      { key: 'eap', title: 'Custom Title' },
      { key: 'radius', title: 'Custom Title' },
      { key: 'dhcp', title: 'Custom Title' },
      { key: 'userAuth', title: 'Custom Title' },
      { key: 'dns', title: 'Custom Title' },
      { key: 'ping', title: 'Custom Title' },
      { key: 'traceroute', title: 'Custom Title' },
      { key: 'speedTest', title: 'Custom Title' }
    ])
  })
})
