import { useState } from 'react'

import { useIntl } from 'react-intl'

import { CompatibleAlertBanner, EdgeCompatibilityDrawer, EdgeCompatibilityType } from '@acx-ui/rc/components'
import {
  ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY,
  EntityCompatibility
} from '@acx-ui/rc/utils'


export const CompatibilityCheck = ({ data }: { data: EntityCompatibility[] }) => {
  const { $t } = useIntl()
  const [drawerFeature, setDrawerFeature] = useState<boolean>(false)

  const toggleCompatibilityDrawer = (open: boolean) => {
    setDrawerFeature(open)
  }

  const incompatibleCount = Number(data[0]?.incompatible)

  return incompatibleCount > 0
    ? <>
      <CompatibleAlertBanner
        title={$t({
          defaultMessage: `{edgeCount} { edgeCount, plural,
                  one {SmartEdge is}
                  other {SmartEdges are}
                } not compatible with certain SmartEdge features.`
        },
        {
          edgeCount: incompatibleCount
        })}
        cacheKey={ACX_UI_EDGE_COMPATIBILITY_NOTE_HIDDEN_KEY}
        onClick={() => toggleCompatibilityDrawer(true)}
      />
      <EdgeCompatibilityDrawer
        visible={drawerFeature}
        title={$t({ defaultMessage: 'Incompatibility Details' })}
        type={EdgeCompatibilityType.VENUE}
        data={data}
        onClose={() => toggleCompatibilityDrawer(false)}
        width={600}
      />
    </>
    : null
}