import React from 'react'

import { PoweredBy, WiFi4EuBanner }                                  from '@acx-ui/icons'
import { DefaultUIConfiguration, getLogoImageSize, UIConfiguration } from '@acx-ui/rc/utils'

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
      {!!uiStyleSchema.wifi4EUNetworkId &&
        <WiFi4EuBanner />
      }

      {uiConfiguration?.logoImage &&
        <img
          style={{
            height: getLogoImageSize(uiStyleSchema.logoSize),
            width: getLogoImageSize(uiStyleSchema.logoSize),
            margin: '24px'
          }}
          src={uiConfiguration?.logoImage}
          alt={'logo'}
        />
      }
      <UI.Title
        style={{
          fontSize: `${uiStyleSchema.headerFontSize}px`,
          letterSpacing: `${uiStyleSchema.headerFontSize * 0.03}px`,
          lineHeight: `${uiStyleSchema.headerFontSize * 1.2}px`,
          color: uiColorSchema.fontHeaderColor
        }}
      >
        {title}
      </UI.Title>
      <UI.Body
        style={{
          color: uiColorSchema.fontColor,
          overflow: 'auto'
        }}
      >
        {body}
      </UI.Body>

      {extra}

      {!hideNavigation && <StepNavigation {...rest} config={uiColorSchema} />}

      {!disablePoweredBy &&
        <UI.PoweredByContainer>
          <PoweredBy/>
        </UI.PoweredByContainer>
      }
    </UI.PreviewContainer>
  )
}
