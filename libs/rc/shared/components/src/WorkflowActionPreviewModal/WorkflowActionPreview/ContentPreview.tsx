import React from 'react'

import { baseUrlFor }                                                from '@acx-ui/config'
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
    uiStyleSchema
  } = uiConfiguration ?? DefaultUIConfiguration

  return (
    <UI.PreviewContainer
      hasBackgroundImage={!!uiConfiguration?.logoImage}
    >
      {!!uiStyleSchema.wifi4EuNetworkId && <img
        src={baseUrlFor('/assets/images/portal/WiFi4euBanner.png')}
        alt='WiFi4EU Banner'
        width='420'
        height='120'
      />}

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

      {!uiStyleSchema.disablePoweredBy &&
        <UI.PoweredByContainer>
          <img
            src={baseUrlFor('/assets/images/portal/PoweredBy.png')}
            alt='Powered by RUCKUS'
            width='126'
            height='30'
          />
        </UI.PoweredByContainer>
      }
    </UI.PreviewContainer>
  )
}
