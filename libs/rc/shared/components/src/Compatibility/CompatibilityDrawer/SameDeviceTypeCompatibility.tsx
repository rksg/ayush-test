import { intersection, omit } from 'lodash'

import { Tabs }                                                                                                                              from '@acx-ui/components'
import { ApIncompatibleFeature, CompatibilityDeviceEnum, CompatibilityType, IncompatibilityFeatures, getCompatibilityDeviceTypeDisplayName } from '@acx-ui/rc/utils'

import { CompatibilityItem } from './CompatibilityItem'
import { useDescription }    from './utils'

interface SameDeviceTypeCompatibilityProps {
  types: string[],
  data: Record<string, ApIncompatibleFeature[]>
  compatibilityType: CompatibilityType,
  deviceType: CompatibilityDeviceEnum,
  totalDevices?: number,
  venueId?: string,
  venueName?: string,
  featureName?: IncompatibilityFeatures,
}

// to ensure tab order
const tabOrder = [CompatibilityDeviceEnum.AP, CompatibilityDeviceEnum.EDGE]
export const SameDeviceTypeCompatibility = (props: SameDeviceTypeCompatibilityProps) => {
  const { types, data, ...others } = props
  const description = useDescription(omit(props, 'data'))

  const defaultActiveKey = intersection(tabOrder, types)[0]

  return <Tabs defaultActiveKey={defaultActiveKey}>
    {tabOrder.map((typeName) =>
      data[typeName]
        ? <Tabs.TabPane
          key={typeName}
          tab={getCompatibilityDeviceTypeDisplayName(typeName as CompatibilityDeviceEnum)}
        >
          <CompatibilityItem
            data={data[typeName]}
            description={description}
            {...others}
          />
        </Tabs.TabPane>
        : null)}
  </Tabs>
}