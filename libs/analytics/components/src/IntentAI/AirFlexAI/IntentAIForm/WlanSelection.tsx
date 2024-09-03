import { useState, useEffect } from 'react'

import { Form }                   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, Select }                   from '@acx-ui/components'
import { get }                              from '@acx-ui/config'
import { useVenueRadioActiveNetworksQuery } from '@acx-ui/rc/services'
import { RadioTypeEnum }                    from '@acx-ui/rc/utils'

// eslint-disable-next-line import/order
import {
  useRecommendationWlansQuery
} from '../../../Recommendations/services'

// TODO
// import {
//   useIntentWlansQuery,
// } from '../../services'
import { useIntentContext } from '../../IntentContext'

type Wlan = {
  name: string
  ssid: string
  id: string
  excluded?: boolean
}
const codeToRadio: Record<string, RadioTypeEnum> = {
  'c-probeflex-24g': RadioTypeEnum._2_4_GHz,
  'c-probeflex-5g': RadioTypeEnum._5_GHz,
  'c-probeflex-6g': RadioTypeEnum._6_GHz
}
export default function WlanSelection () {
  const isMlisa = Boolean(get('IS_MLISA_SA'))
  const { intent } = useIntentContext()
  const { id, code, metadata, path } = intent
  const savedWlans = metadata.wlans
  const { $t } = useIntl()
  const [wlans, setWlans] = useState<Array<Wlan>>([])
  const selected = wlans.filter(wlan => !wlan.excluded)
  const selectedWlans = selected.length ? selected : wlans
  const venueId = path?.filter(({ type }) => type === 'zone')?.[0].name
  const raIQuery = useRecommendationWlansQuery({ id }, { skip: !isMlisa })
  let available: Wlan[] | undefined
  const r1Networks = useVenueRadioActiveNetworksQuery({
    params: { venueId },
    radio: codeToRadio[code],
    payload: {
      venueId,
      fields: ['id', 'name', 'ssid'],
      page: 1,
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10_000
    }
  }, { skip: isMlisa })
  const wlansQuery = isMlisa ? raIQuery : r1Networks
  useEffect(() => {

    if (isMlisa && wlansQuery.data) {
      available = wlansQuery.data.map(wlan => ({ ...wlan, id: wlan.name })) // RA does not have ID
    } else if (!isMlisa && r1Networks.data) {
      available = r1Networks.data
    }
    if (available) {
      if (savedWlans) {
        const saved = savedWlans.map(({ name }) => name)
        setWlans(available.map(wlan => ({
          ...wlan,
          excluded: !saved.includes(isMlisa ? wlan.name : wlan.id)
        })))
      } else {
        setWlans(available)
      }
    }
  }, [r1Networks.data, code, isMlisa, savedWlans, venueId, wlansQuery])
  return<Loader states={[wlansQuery]} style={{ height: '72px' }}>
    <Form.Item
      label={$t({ defaultMessage: 'Networks' })}
      style={{ margin: '0 0 0 10px' }}
    >
      <Select
        mode='multiple'
        maxTagCount='responsive'
        showArrow
        showSearch={false}
        style={{ width: '260px', margin: '0 auto 10px auto' }}
        onChange={setWlans}
        placeholder={$t({ defaultMessage: 'Select networks' })}
        value={selectedWlans.map(wlan => wlan.id)}
        maxTagPlaceholder={() =>
          <div title={selectedWlans.map(wlan => wlan.name).join(', ')}>
            {$t({
              defaultMessage: `{count} {count, plural,
              one {{singular}}
              other {{plural}}
            } selected`
            }, {
              count: selectedWlans.length,
              singular: $t(defineMessage({ defaultMessage: 'network' })),
              plural: $t(defineMessage({ defaultMessage: 'networks' }))
            })}
          </div>
        }
        children={wlans
          ?.map(({ id, name }: { id: string, name: string }) =>
            <Select.Option key={id} value={id} children={name} />
          )
        }
      />
    </Form.Item>
  </Loader>
}