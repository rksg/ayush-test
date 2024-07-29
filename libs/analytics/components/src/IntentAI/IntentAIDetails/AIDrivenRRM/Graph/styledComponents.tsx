import styled from 'styled-components'

import { Card } from '@acx-ui/components'

import { detailsHeaderFontStyles } from '../../styledComponents'

export const Wrapper = styled.div`
  position: relative;
  height: 385px;
  margin-top: 40px;

  ${Card.Title} {
    ${detailsHeaderFontStyles}
  }
`
export const DownloadWrapper = styled.div`
  width: fit-content;
`
