import { Typography } from 'antd'
import styled         from 'styled-components/macro'

import { Card } from '@acx-ui/components'

export const Wrapper = styled.div`
  padding-top: 35px;
`

export const Title = styled(Typography.Title).attrs({ level: 2 })``
export const SideNoteTitle = styled(Typography.Title).attrs({ level: 3 })``

export const Subtitle = styled(Card.Title)`
  font-weight: var(--acx-headline-5-font-weight-bold);
  padding-bottom: 20px;
`

export const Content = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  color: var(--acx-primary-black);
`

export const ContentText = styled.span`
  display: flex;
  flex-direction: column;
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  color: var(--acx-primary-black);
`

export const SideNote = styled.div`
  border-radius: 4px;
  border: 1px solid var(--acx-neutrals-25);
  height: 65vh;
  min-height: 470px;
`

export const SideNoteHeader = styled.div`
  padding: 20px;
  display: flex;
`

export const SideNoteSubtitle = styled.div`
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  font-weight: var(--acx-headline-5-font-weight-bold);
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  color: var(--acx-primary-black);
`

export const SideNoteContent = styled.span`
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-subtitle-5-line-height);
  color: var(--acx-primary-black);
`

export const Para = styled.p`
  margin-block-end: 1em;
`

export const Bold = styled.b`
  margin-block-end: 1em;
`

export const Link = styled.a`
  text-decoration: underline;
`