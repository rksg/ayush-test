import React from 'react'

import { useIntl } from 'react-intl'

import { Button } from '@acx-ui/components'

import * as UI from './styledComponents'

interface DropdownFooterProps {
  onCancel: () => void;
  onApply: () => void;
}

export const DropdownFooter: React.FC<DropdownFooterProps> = ({ onCancel, onApply }) => (
  <UI.ButtonDiv>
    <Button size='small' onClick={onCancel}>
      {useIntl().$t({ defaultMessage: 'Cancel' })}
    </Button>
    <Button size='small' type='primary' onClick={onApply}>
      {useIntl().$t({ defaultMessage: 'Apply' })}
    </Button>
  </UI.ButtonDiv>
)
