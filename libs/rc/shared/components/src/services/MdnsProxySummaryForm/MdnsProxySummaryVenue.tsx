import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { ApMdnsProxyScopeData, EdgeMdnsProxyScopeData, MdnsProxyFeatureTypeEnum } from '@acx-ui/rc/utils'

export function MdnsProxySummaryVenues (props: {
  featureType: MdnsProxyFeatureTypeEnum,
  scope: (ApMdnsProxyScopeData | EdgeMdnsProxyScopeData)[]
}) {
  const { $t } = useIntl()
  const { featureType, scope } = props

  return (
    <div>
      <Space direction='vertical' size={4}>
        {scope.map((scopeData: ApMdnsProxyScopeData | EdgeMdnsProxyScopeData) => {

          const scopedDevices = (featureType === MdnsProxyFeatureTypeEnum.EDGE
            ? (scopeData as EdgeMdnsProxyScopeData).edgeClusters
            : (scopeData as ApMdnsProxyScopeData).aps
          )
          const deviceCount = scopedDevices.length

          return (
            <div key={scopeData.venueId}>
              <Space>
                <span>{scopeData.venueName}</span>
                <span>
                  ({deviceCount=== 1
                    ? scopedDevices[0].name
                    : $t({ defaultMessage: '{deviceCount} {featureType}' },
                      {
                        deviceCount,
                        featureType: featureType === MdnsProxyFeatureTypeEnum.EDGE
                          ? $t({ defaultMessage: 'RUCKUS Edges' })
                          : $t({ defaultMessage: 'APs' })
                      })
                  })
                </span>
              </Space>
            </div>
          )
        })}
      </Space>
    </div>
  )
}
