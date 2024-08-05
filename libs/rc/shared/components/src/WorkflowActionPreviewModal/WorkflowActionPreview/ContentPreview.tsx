import React from 'react'

import { PoweredBy }                               from '@acx-ui/icons'
import { DefaultUIConfiguration, UIConfiguration } from '@acx-ui/rc/utils'

import { StepNavigation } from './StepNavigation'
import * as UI            from './styledComponent'


interface ContentPreviewProps {
  uiConfiguration?: UIConfiguration,
  title?: React.ReactNode,
  body?: React.ReactNode,
  extra?: React.ReactNode,
  hideNavigation?: boolean
  isStart?: boolean,
  onNext?: () => void,
  onBack?: () => void
}

export function ContentPreview (props: ContentPreviewProps) {
  const { uiConfiguration, title, body, extra, hideNavigation = false, ...rest } = props
  const {
    uiColorSchema,
    uiStyleSchema,
    disablePoweredBy
  } = uiConfiguration ?? DefaultUIConfiguration

  return (
    <UI.PreviewContainer
      hasBackgroundImage={!!uiConfiguration?.logoImage}
    >
      {uiConfiguration?.logoImage &&
        <UI.Logo
          style={{
            height: 105 * (uiStyleSchema.logoRatio
              ?? DefaultUIConfiguration.uiStyleSchema.logoRatio),
            width: 105 * (uiStyleSchema.logoRatio
              ?? DefaultUIConfiguration.uiStyleSchema.logoRatio)
          }}
        >
          <img
            style={{ width: '100%', height: '100%' }}
            src={uiConfiguration?.logoImage}
            alt={'logo'}
          />
        </UI.Logo>
      }
      <UI.Title
        style={{
          fontSize: `${uiStyleSchema.titleFontSize}px`,
          letterSpacing: `${uiStyleSchema.titleFontSize * 0.03}px`,
          lineHeight: `${uiStyleSchema.titleFontSize * 1.2}px`,
          color: uiColorSchema.fontHeaderColor
        }}
      >
        {title}
      </UI.Title>
      <UI.Body
        style={{
          color: uiColorSchema.fontColor
        }}
      >
        {body}
      </UI.Body>

      {extra}

      {!hideNavigation && <StepNavigation {...rest} />}

      {!disablePoweredBy &&
        <UI.PoweredByContainer>
          <PoweredBy/>
        </UI.PoweredByContainer>
      }
    </UI.PreviewContainer>
  )
}
