import React from 'react'

import { AupIcon, PoweredBy }     from '@acx-ui/icons'
import { DefaultUIConfiguration } from '@acx-ui/rc/utils'

import { StepNavigation } from './StepNavigation'
import * as UI            from './styledComponent'


interface ContentPreviewProps {
  title?: React.ReactNode,
  body?: React.ReactNode,
  hideNavigation?: boolean
  isStart?: boolean,
  onNext?: () => void,
  onBack?: () => void
}

export function ContentPreview (props: ContentPreviewProps) {
  const { title, body, hideNavigation = false, ...rest } = props
  // TODO: Change to use global configuration
  const { uiColorSchema, uiStyleSchema, disablePoweredBy } = DefaultUIConfiguration

  return (
    <UI.PreviewContainer
      style={{
        backgroundColor: uiColorSchema.backgroundColor
      }}
    >
      <UI.Logo
        style={{
          height: 105 * uiStyleSchema.logoRatio,
          width: 105 * uiStyleSchema.logoRatio
        }}
      >
        {/* TODO: Change to use global Logo */}
        <AupIcon/>
      </UI.Logo>
      <UI.Title
        style={{
          fontSize: `${uiStyleSchema.titleFontSize}px`,
          letterSpacing: `${uiStyleSchema.titleFontSize * 0.03}px`,
          lineHeight: `${uiStyleSchema.titleFontSize * 1.2}px`,
          color: uiColorSchema.titleFontColor
        }}
      >
        {title}
      </UI.Title>
      <UI.Body
        style={{
          fontSize: `${uiStyleSchema.bodyFontSize}px`,
          letterSpacing: `${uiStyleSchema.bodyFontSize * 0.03}px`,
          lineHeight: `${uiStyleSchema.bodyFontSize * 1.2}px`,
          color: uiColorSchema.bodyFontColor
        }}
      >
        {body}
      </UI.Body>

      {!hideNavigation && <StepNavigation {...rest} />}

      {!disablePoweredBy &&
        <UI.PoweredByContainer>
          <PoweredBy/>
        </UI.PoweredByContainer>
      }
    </UI.PreviewContainer>
  )
}
