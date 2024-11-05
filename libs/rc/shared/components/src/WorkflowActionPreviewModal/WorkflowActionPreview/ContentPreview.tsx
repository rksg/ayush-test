import React from 'react'

import { Image, Typography } from 'antd'
import { useIntl }           from 'react-intl'

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
  const { $t } = useIntl()
  const {
    uiColorSchema,
    uiStyleSchema
  } = uiConfiguration ?? DefaultUIConfiguration

  return (
    <UI.PreviewContainer
      hasBackgroundImage={!!uiConfiguration?.logoImage}
    >
      {!!uiStyleSchema.wifi4EuNetworkId &&
        <WiFi4EuBanner />
      }

      {uiConfiguration?.logoImage &&
        <Image
          src={uiConfiguration?.logoImage}
          width={getLogoImageSize(uiStyleSchema.logoSize)}
          height={getLogoImageSize(uiStyleSchema.logoSize)}
          alt={$t({ defaultMessage: 'Logo' })}
          preview={false}
          placeholder={true}
        />
      }
      <Typography.Title
        style={{
          width: '100%',
          textAlign: 'center',
          color: uiColorSchema.fontHeaderColor
            ? uiColorSchema.fontHeaderColor
            : DefaultUIConfiguration.uiColorSchema.fontHeaderColor,
          fontSize: uiStyleSchema.headerFontSize
            ? uiStyleSchema.headerFontSize
            : DefaultUIConfiguration.uiStyleSchema.headerFontSize
        }}
      >
        {title}
      </Typography.Title>
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
          <PoweredBy/>
        </UI.PoweredByContainer>
      }
    </UI.PreviewContainer>
  )
}
