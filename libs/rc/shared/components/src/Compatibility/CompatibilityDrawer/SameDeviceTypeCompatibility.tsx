import { Form }               from 'antd'
import { intersection, omit } from 'lodash'

import { Tabs }                           from '@acx-ui/components'
import { Features, useIsSplitOn }         from '@acx-ui/feature-toggle'
import {
  ApIncompatibleFeature,
  CompatibilityDeviceEnum,
  CompatibilitySelectedApInfo,
  CompatibilityType,
  IncompatibilityFeatures,
  IncompatibleFeature,
  getCompatibilityDeviceTypeDisplayName
} from '@acx-ui/rc/utils'

import { ApCompatibilityDetailTable }   from '../Ap/ApCompatibilityDetailTable'
import { EdgeCompatibilityDetailTable } from '../Edge/EdgeCompatibilityDetailTable'

import { CompatibilityItem } from './CompatibilityItem'
import { useDescription }    from './utils'

interface SameDeviceTypeCompatibilityProps {
  types: string[],
  data: Record<string, IncompatibleFeature[]> | Record<string, ApIncompatibleFeature[]>,
  compatibilityType: CompatibilityType,
  deviceType: CompatibilityDeviceEnum,
  totalDevices?: number,
  apInfo?: CompatibilitySelectedApInfo,
  venueId?: string,
  venueName?: string,
  featureName?: IncompatibilityFeatures,
}

// to ensure tab order
const tabOrder = [CompatibilityDeviceEnum.AP, CompatibilityDeviceEnum.EDGE]
export const SameDeviceTypeCompatibility = (props: SameDeviceTypeCompatibilityProps) => {
  const isApCompatibilitiesByModel = useIsSplitOn(Features.WIFI_COMPATIBILITY_BY_MODEL)
  const { types, data, ...others } = props
  const description = useDescription(omit(props, 'data'))

  const defaultActiveKey = intersection(tabOrder, types)[0]

  const allCompatibilityData = [
    ...(data[CompatibilityDeviceEnum.AP] ?? []),
    ...(data[CompatibilityDeviceEnum.EDGE] ?? [])
  ]

  return <>
    <Form.Item>
      {description}
    </Form.Item>
    {props.deviceType === CompatibilityDeviceEnum.AP?
      (isApCompatibilitiesByModel?
        <ApCompatibilityDetailTable
          requirementOnly={props.compatibilityType === CompatibilityType.DEVICE}
          data={allCompatibilityData as IncompatibleFeature[]}
          venueId={props.venueId}
          apInfo={props.apInfo}
        />
        /* Should be a detail table for AP in the future, like <EdgeCompatibilityDetailTable /> */
        :<Tabs defaultActiveKey={defaultActiveKey}>
          {tabOrder.map((typeName) =>
            data[typeName]
              ? <Tabs.TabPane
                key={typeName}
                tab={getCompatibilityDeviceTypeDisplayName(typeName as CompatibilityDeviceEnum)}
              >
                <CompatibilityItem
                  data={data[typeName]}
                  {...others}
                />
              </Tabs.TabPane>
              : null)}
        </Tabs>)
      : <EdgeCompatibilityDetailTable
        requirementOnly={props.compatibilityType === CompatibilityType.DEVICE}
        data={(data[CompatibilityDeviceEnum.EDGE] as ApIncompatibleFeature[]).map(i => ({
          featureRequirement: {
            featureName: i.featureName,
            requiredFw: i.requiredFw!
          },
          incompatibleDevices: i.incompatibleDevices ?? []
        }))}
        venueId={props.venueId}
      />}
  </>
}