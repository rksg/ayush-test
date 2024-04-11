import React from 'react'

import { Divider } from 'antd'

import { Dropdown, Button }      from '@acx-ui/components'
import { ConfigurationOutlined } from '@acx-ui/icons'

import * as UI from './styledComponents'

interface OverlayElement {
  title: string | React.ReactNode | JSX.Element
  content: string | React.ReactNode | JSX.Element
}

interface DetailsActionsProps {
  overlayElements: OverlayElement[]
}

export function DetailsActions ({ overlayElements } : DetailsActionsProps) {
  return <Dropdown
    overlay={<UI.DetailsActions>
      {overlayElements.map(({ title, content }, index) =>
        <span key={`element-${index}`}>
          <Dropdown.OverlayTitle>{title}</Dropdown.OverlayTitle>
          {content}
          {index < overlayElements.length - 1 && <Divider />}
        </span>
      )}
    </UI.DetailsActions>}
  >
    {() => <Button icon={<ConfigurationOutlined />} />}
  </Dropdown>
}
