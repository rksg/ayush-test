import React from 'react'

import { Tabs }       from '@acx-ui/components'
import { EdgeStatus } from '@acx-ui/rc/utils'

interface NodesTabsProps {
  nodeList?: EdgeStatus[]
  content: React.ReactElement
}

export const NodesTabs = (props: NodesTabsProps) => {
  const { nodeList, content } = props

  return <Tabs >
    {
      nodeList?.map((node) => {
        return <Tabs.TabPane
          key={node.serialNumber}
          tab={node.name}
          children={React.cloneElement(content, { name: [node.serialNumber, content.props.name] })}
        />
      })
    }
  </Tabs>
}