import { useState, useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader, Select, useStepFormContext }                                     from '@acx-ui/components'
import { get }                                                                    from '@acx-ui/config'
import { Features, useIsSplitOn }                                                 from '@acx-ui/feature-toggle'
import { useVenueRadioActiveNetworksQuery, useVenueWifiRadioActiveNetworksQuery } from '@acx-ui/rc/services'
import { RadioTypeEnum }                                                          from '@acx-ui/rc/utils'

import { useIntentContext }    from '../../IntentContext'
import { useIntentWlansQuery } from '../../services'
import { IntentDetail }        from '../../useIntentDetailsQuery'

export type Wlan = {
  name: string
  ssid: string
  id?: string
  excluded?: boolean
}
const codeToRadio: Record<string, RadioTypeEnum> = {
  'c-probeflex-24g': RadioTypeEnum._2_4_GHz,
  'c-probeflex-5g': RadioTypeEnum._5_GHz,
  'c-probeflex-6g': RadioTypeEnum._6_GHz
}

export default function WlanSelection ({ disabled }: { disabled: boolean }) {
  const isMlisa = Boolean(get('IS_MLISA_SA'))
  const { intent } = useIntentContext()
  const { form } = useStepFormContext<IntentDetail>()
  const { root, code, sliceId } = intent
  const { $t } = useIntl()
  const isWifiRbacEnabled = useIsSplitOn(Features.WIFI_RBAC_API)
  const savedWlans = form.getFieldValue('wlans') as Wlan[]
  const [wlans, setWlans] = useState<Array<Wlan>>(savedWlans)
  const selected = wlans.filter(wlan => !wlan.excluded)
  const selectedWlans = selected.length ? selected : wlans
  const venueId = sliceId
  const raiQuery = useIntentWlansQuery({ sliceId, root, code }, { skip: !isMlisa || disabled })
  let available: Wlan[] | undefined
  const networkQuery = isWifiRbacEnabled
    ? useVenueWifiRadioActiveNetworksQuery
    : useVenueRadioActiveNetworksQuery
  const r1Networks = networkQuery({
    params: { venueId },
    radio: codeToRadio[code],
    payload: {
      ...(isWifiRbacEnabled
        ? {
          filters: {
            'venueApGroups.venueId': [venueId]
          }
        }
        : { venueId }
      ),
      fields: isWifiRbacEnabled ? ['id', 'name', 'venueApGroups', 'ssid'] : ['id', 'name', 'ssid'],
      page: 1,
      sortField: 'name',
      sortOrder: 'ASC',
      pageSize: 10_000
    }
  }, { skip: isMlisa })
  const wlansQuery = isMlisa ? raiQuery : r1Networks
  useEffect(() => {
    let wlansData: Wlan[]
    if (!wlansQuery.data) return

    if (isMlisa) {
      available = wlansQuery.data.map(wlan => ({ ...wlan, id: wlan.name })) // RA does not have ID
    } else {
      available = wlansQuery.data as typeof r1Networks.data
    }
    if (available?.length) {
      const formData = form.getFieldValue('wlans') as Wlan[]
      if (formData?.length) {
        const saved = formData.map(({ id }) => id)
        wlansData = available.map(wlan => ({
          ...wlan,
          excluded: !saved.includes(isMlisa ? wlan.name : wlan.id)
        }))
      } else {
        wlansData = available
      }
      setWlans(wlansData)
      form.setFieldValue('wlans', wlansData.filter(wlan => !wlan.excluded))
    }
  }, [wlansQuery.data, isMlisa])
  return<Loader states={[wlansQuery]} style={{ height: '72px' }}>
    <Form.Item
      label={$t({ defaultMessage: 'Networks' })}
      style={{
        margin: '0 0 0 0',
        fontWeight: 'normal',
        color: 'var(--acx-neutrals-60)',
        fontSize: 'var(--acx-body-4-font-size)'
      }}
    >
      <Select
        disabled={disabled}
        mode='multiple'
        maxTagCount='responsive'
        showArrow
        showSearch={false}
        style={{ width: '100%', margin: '0 auto 10px auto' }}
        onChange={(ids: string[]) => {
          const updatedList = wlans.map(wlan =>
            ({ ...wlan, excluded: ids.length > 0 && !ids.includes(wlan.id!) }))
          setWlans(updatedList)
          form.setFieldValue('wlans', updatedList.filter(wlan => !wlan.excluded))
        }}
        placeholder={$t({ defaultMessage: 'Select Networks' })}
        value={selectedWlans.map(wlan => wlan.id)}
        children={wlans
          ?.map(({ id, name }: { id?: string, name: string }) =>
            <Select.Option key={id!} value={id!} children={name} />
          )
        }
      />
    </Form.Item>
  </Loader>
}
