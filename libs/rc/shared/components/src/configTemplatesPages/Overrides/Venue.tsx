import { Space } from 'antd'

import { Tooltip }                          from '@acx-ui/components'
import { VenuesForm }                       from '@acx-ui/main/components'
import { useGetVenueTemplateQuery }         from '@acx-ui/rc/services'
import { VenueExtended, WIFI_COUNTRY_CODE } from '@acx-ui/rc/utils'
import { getIntl }                          from '@acx-ui/utils'

export interface ConfigTemplateVenueOverrideProps {
  templateId: string
  existingOverrideValues?: Partial<VenueExtended>
  onCancel: () => void
  updateOverrideValue: (values: Partial<VenueExtended>) => void
}

export function ConfigTemplateVenueOverride (props: ConfigTemplateVenueOverrideProps) {
  const { templateId, existingOverrideValues, onCancel, updateOverrideValue } = props
  const { data } = useGetVenueTemplateQuery({ params: { venueId: templateId } })

  const onModalCallBack = (venue?: VenueExtended) => {
    if (venue) {
      updateOverrideValue(venue)
    }
    onCancel()
  }

  return <VenuesForm
    modalMode={true}
    modalCallBack={onModalCallBack}
    specifiedAction={'override'}
    dataFromParent={data ? { ...data, ...existingOverrideValues } : undefined}
  />
}

export function transformVenueOverrideValueToDisplay (venue: Partial<VenueExtended>) {
  const { $t } = getIntl()
  return [
    { name: $t({ defaultMessage: 'Name' }), value: venue.name },
    { name: $t({ defaultMessage: 'Description' }), value: venue.description },
    { name: $t({ defaultMessage: 'Address' }), value: venue.address?.addressLine },
    {
      name: $t({ defaultMessage: 'Wi-Fi Country Code' }),
      value: WIFI_COUNTRY_CODE.find(item => item.code === venue.address?.countryCode)?.name
    }
  ].filter(item => item.value)
}

export function VenueOverrideDisplayView ({ entity: venue }: { entity: Partial<VenueExtended> }) {
  const displayValue = transformVenueOverrideValueToDisplay(venue)

  return (
    <Tooltip
      title={<Space size='small' direction='vertical'>
        {displayValue.map(({ name, value }) => {
          return <Space key={name} size={2} split={':'} align='start'>
            <span style={{ fontWeight: 'bold' }}>{name}</span>
            <span>{value}</span>
          </Space>
        })}
      </Space>}
    >
      <span>{displayValue.map(v => `${v.name}: ${v.value}`).join(' | ')}</span>
    </Tooltip>
  )
}
