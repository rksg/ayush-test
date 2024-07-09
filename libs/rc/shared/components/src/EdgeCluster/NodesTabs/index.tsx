import React from 'react'

import { Tabs }       from '@acx-ui/components'
import { EdgeStatus } from '@acx-ui/rc/utils'

interface NodesTabsProps {
  value?: Record<string, unknown>
  nodeList?: EdgeStatus[]
  content: (serialNumber: string) => React.ReactElement
}

export const NodesTabs = (props: NodesTabsProps) => {
  const { nodeList, content } = props

  return <Tabs >
    {
      nodeList?.map((node) => {
        return <Tabs.TabPane
          key={node.serialNumber}
          tab={node.name}
          children={content(node.serialNumber)}
        />
      })
    }
  </Tabs>
}