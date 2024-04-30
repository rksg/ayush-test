import styled from 'styled-components/macro'

import { Button } from '@acx-ui/components'

export const Section = styled.div`
  margin-top: 12px;
`

export const PreferencesSection = styled.div`
  margin-top: 12px;
  margin-Left: 8;
  font-weight: bold;
`

export const GreyTextSection = styled.div`
  color: var(--acx-neutrals-50)
`

export const ChangeButton = styled(Button)`
  position: absolute;
  top: 56px;
  left: 290px;
  margin: 8px;
  width: 80px !important;
  font-size: 13px;
`