import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }                       from 'react-intl'

import { Button } from '../../Button'

import * as UI from './styledComponents'

export interface DrawerFormFooterProps {
  showAddAnother?: boolean
  addAnotherChecked?: boolean
  onAddAnotherChange?: (e: CheckboxChangeEvent) => void
  onCancel: () => void
  onSave: () => void
  buttonLabel?: {
    addAnother?: string
    cancel?: string
    save?: string
  }
}

export const DrawerFormFooter = (props: DrawerFormFooterProps) => {
  const { $t } = useIntl()

  const {
    showAddAnother = false,
    addAnotherChecked = false,
    onAddAnotherChange,
    onCancel,
    onSave
  } = props

  const buttonLabel = {
    ...{
      addAnother: $t({ defaultMessage: 'Add another' }),
      cancel: $t({ defaultMessage: 'Cancel' }),
      save: $t({ defaultMessage: 'Save' })
    },
    ...props.buttonLabel
  }

  return (
    <UI.FooterBar>
      <div>
        {showAddAnother && <Checkbox
          onChange={onAddAnotherChange}
          checked={addAnotherChecked}
          children={buttonLabel.addAnother}
        />}
      </div>
      <div>
        <Button
          key='cancelBtn'
          onClick={onCancel}
        >
          {buttonLabel.cancel}
        </Button>
        <Button
          key='saveBtn'
          onClick={onSave}
          type={'secondary'}
        >
          {buttonLabel.save}
        </Button>
      </div>
    </UI.FooterBar>
  )
}
