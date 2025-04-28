import { useContext, useEffect, useState } from 'react'

import { Space, Radio, RadioChangeEvent } from 'antd'
import { useIntl }                        from 'react-intl'
import { useParams }                      from 'react-router-dom'

import {
  AnchorContext,
  Loader,
  StepsFormLegacy
} from '@acx-ui/components'
import {
  useGetVenueApIpModeQuery,
  useUpdateVenueApIpModeMutation
} from '@acx-ui/rc/services'
import { IPModeEnum, useConfigTemplate } from '@acx-ui/rc/utils'

import { VenueEditContext, VenueWifiConfigItemProps } from '../../../index'

export function ApIpMode (props: VenueWifiConfigItemProps) {
  const { $t } = useIntl()
  const { tenantId, venueId } = useParams()
  const { isAllowEdit=true } = props

  const {
    editContextData,
    setEditContextData,
    editAdvancedContextData,
    setEditAdvancedContextData
  } = useContext(VenueEditContext)
  const { setReadyToScroll } = useContext(AnchorContext)

  const { isTemplate } = useConfigTemplate()

  const [apIpMode, setApIpMode] = useState('IPV4')
  const getVenueApIpMode = useGetVenueApIpModeQuery
  const { data } = getVenueApIpMode(
    { params: { tenantId, venueId } }, { skip: isTemplate }
  )

  const [updateVenueApIpMode, { isLoading: isUpdatingVenueApIpMode }]
  = useUpdateVenueApIpModeMutation()

  useEffect(() => {
    if (data) {
      console.log(data) // eslint-disable-line no-console
      setApIpMode(data?.mode ?? 'IPV4')

      setReadyToScroll?.(r => [...(new Set(r.concat('AP-IP-Mode')))])
    }
  }, [data, setReadyToScroll])

  const handleChanged = (e: RadioChangeEvent) => {
    const newData = { mode: e.target.value }
    setApIpMode(newData.mode)
    setEditContextData && setEditContextData({
      ...editContextData,
      unsavedTabKey: 'settings',
      tabTitle: $t({ defaultMessage: 'Advanced' }),
      isDirty: true
    })

    setEditAdvancedContextData && setEditAdvancedContextData({
      ...editAdvancedContextData,
      updateApIpMode: () => updateApIpMode(newData.mode)
    })
  }

  const updateApIpMode = async (value: string) => {
    try {
      await updateVenueApIpMode({
        params: { tenantId, venueId },
        payload: { mode: value }
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Loader states={[{
      isLoading: false,
      isFetching: isUpdatingVenueApIpMode
    }]}>
      <Space align='start'>
        <StepsFormLegacy.FieldLabel
          width='max-content'
          style={{ height: '32px', display: 'flex', alignItems: 'center', paddingLeft: '10px' }}
        >
          <span>{$t({ defaultMessage: 'AP IP Mode' })}</span>
          <div style={{ margin: '2px' }}></div>
          <Radio.Group
            value={apIpMode}
            disabled={!isAllowEdit}
            onChange={handleChanged}
            style={{ marginLeft: '40px' }}
          >
            <Space direction={'horizontal'} size={8}>
              <Radio
                data-testid='ipv4-radio-option'
                key={IPModeEnum.IPv4}
                value={IPModeEnum.IPv4}
                checked={apIpMode === IPModeEnum.IPv4}>
                {$t({ defaultMessage: 'IPv4 only' })}
              </Radio>
              <Radio
                data-testid='ipv6-radio-option'
                key={IPModeEnum.IPv6}
                value={IPModeEnum.IPv6}
                checked={apIpMode === IPModeEnum.IPv6}>
                {$t({ defaultMessage: 'IPv6 only' })}
              </Radio>
              <Radio
                data-testid='dual-radio-option'
                key={IPModeEnum.Dual}
                value={IPModeEnum.Dual}
                checked={apIpMode === IPModeEnum.Dual}>
                {$t({ defaultMessage: 'Dual' })}
              </Radio>
            </Space>
          </Radio.Group>
        </StepsFormLegacy.FieldLabel>
      </Space>
    </Loader>
  )
}