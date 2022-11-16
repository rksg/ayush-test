import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { MdnsProxyScopeData } from '@acx-ui/rc/utils'

export function MdnsProxySummaryVenues (props: { scope: MdnsProxyScopeData[] }) {
  const { scope } = props
  const { $t } = useIntl()

  return (
    <div>
      <Space direction='vertical' size={4}>
        {scope.map((scopeData: MdnsProxyScopeData) => {
          return (
            <div key={scopeData.venueId}>
              <Space>
                <span>{scopeData.venueName}</span>
                <span>
                  ({scopeData.aps.length === 1
                    ? scopeData.aps[0].name
                    : $t({ defaultMessage: '{apCount} APs' }, { apCount: scopeData.aps.length })
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
