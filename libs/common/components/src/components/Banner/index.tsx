import React from 'react'

import { useIntl } from 'react-intl'

import { ChatbotLink } from '@acx-ui/icons'

import bannerImg from '../../../../assets/banner_bkg.png'

import * as UI from './styledComponents'

type BannerProps = {
    helpUrl?: string
    closable?: boolean
    title: string
    subTitles: string[],
    disabled?: boolean
}

export const Banner: React.FC<BannerProps> = ({
  helpUrl, title, subTitles, closable=false, disabled=false
}) => {
  const { $t } = useIntl()

  return (<UI.BannerAlert
    type='info'
    closable={closable}
    message={<UI.BannerWrapper>
      <UI.BannerBG src={bannerImg}/>
      <UI.Banner>
        <UI.BannerTitle>{title}</UI.BannerTitle>
        {subTitles.map((subTitle, i) =>
          <UI.BannerSubTitle key={`bannerSub_${i}`}>{subTitle}</UI.BannerSubTitle>)}
        <UI.BannerButton
          disabled={disabled}
          onClick={() => {
            helpUrl && window.open(helpUrl, '_blank')
          }}>
          {$t({ defaultMessage: 'Learn More' })}
          <ChatbotLink />
        </UI.BannerButton>
      </UI.Banner>
    </UI.BannerWrapper>}
  />)
}