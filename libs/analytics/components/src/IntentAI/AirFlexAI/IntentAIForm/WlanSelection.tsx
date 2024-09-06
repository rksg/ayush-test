import { useCallback, useMemo, useRef, useState, useEffect } from 'react'

import { Form }                   from 'antd'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { Loader, Select, useStepFormContext } from '@acx-ui/components'
import { get }                                                from '@acx-ui/config'

import { useVenueRadioActiveNetworksQuery } from '@acx-ui/rc/services'
import { RadioTypeEnum }                    from '@acx-ui/rc/utils'

import { useIntentWlansQuery } from '../../services'
import { useIntentContext }    from '../../IntentContext'
import { Intent } from '../../useIntentDetailsQuery'

export type Wlan = {
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
export default function WlanSelection() {
  const isMlisa = Boolean(get('IS_MLISA_SA'))
  const { intent } = useIntentContext()
  const { form } = useStepFormContext<Intent>()
  const { root, code, metadata, sliceId } = intent
  const savedWlans = metadata.wlans
  const { $t } = useIntl()
  const [wlans, setWlans] = useState<Array<Wlan>>([])
  const selected = wlans.filter(wlan => !wlan.excluded)
  const selectedWlans = selected.length ? selected : wlans
  const venueId = sliceId
  const raIQuery = useIntentWlansQuery({ sliceId, root, code }, { skip: !isMlisa })
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
    } else if (!isMlisa && wlansQuery.data) {
      available = wlansQuery.data as typeof r1Networks.data
    }
    if (available?.length) {
      if (savedWlans) {
        const saved = savedWlans.map(({ name }) => name)
        console.log('saved', saved)
        setWlans(available.map(wlan => ({
          ...wlan,
          excluded: !saved.includes(isMlisa ? wlan.name : wlan.id)
        })))
        form.setFieldValue('wlans', savedWlans)
      } else {
        setWlans(available)
        form.setFieldValue('wlans', available)
      }
    }
  }, [r1Networks.data, code, isMlisa, savedWlans, venueId, wlansQuery])
  return<Loader states={[wlansQuery]} style={{ height: '72px' }}>
  <Form.Item hidden name='wlans' children={<></>}></Form.Item>
  <Form.Item
    label={$t({ defaultMessage: 'Exclude Networks' })}
    rules={[{ required: true, message: $t({ defaultMessage: 'Please select atleast one Network' }) }]}
    style={{
      margin: '0 0 0 0',
      fontWeight: 'normal',
      color: 'var(--acx-neutrals-60)',
      fontSize: 'var(--acx-body-4-font-size)'
    }}
  >
    <Select
      mode='multiple'
      maxTagCount='responsive'
      showArrow
      showSearch={false}
      style={{ width: '100%', margin: '0 auto 10px auto' }}
      onChange={(ids: string[]) => {
        setWlans(
          wlans.map(wlan => ({ ...wlan, excluded: !ids.includes(wlan.id) }))
        )
        form.setFieldValue(
          'wlans',
          wlans.filter(wlan => (ids.includes(wlan.id)))
        )
      }}
      placeholder={$t({ defaultMessage: 'Select Networks' })}
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
            singular: $t(defineMessage({ defaultMessage: 'Network' })),
            plural: $t(defineMessage({ defaultMessage: 'Networks' }))
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
