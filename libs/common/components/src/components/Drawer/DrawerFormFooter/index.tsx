import { Button }                        from 'antd'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl }                       from 'react-intl'

import * as UI from './styledComponents'

export interface DrawerFormFooterProps {
  showAddAnother?: boolean;
  addAnotherChecked?: boolean;
  addAnotherText?: string;
  onAddAnotherChange?: (e: CheckboxChangeEvent) => void;
  cancelText?: string;
  saveText?: string;
  onCancel: () => void;
  onSave: () => void;
}

export const DrawerFormFooter = (props: DrawerFormFooterProps) => {
  const { $t } = useIntl()

  const {
    showAddAnother = false,
    addAnotherChecked = false,
    addAnotherText,
    onAddAnotherChange,
    cancelText = $t({ defaultMessage: 'Cancel' }),
    saveText = $t({ defaultMessage: 'Save' }),
    onCancel,
    onSave
  } = props


  return (
    <UI.FooterBar>
      <div>
        {showAddAnother && <Checkbox
          onChange={onAddAnotherChange}
          checked={addAnotherChecked}
          children={addAnotherText}
        />}
      </div>
      <div>
        <Button
          key='cancelBtn'
          onClick={onCancel}>
          {cancelText}
        </Button>
        <Button
          key='saveBtn'
          onClick={onSave}
          type={'primary'}>
          {saveText}
        </Button>
      </div>
    </UI.FooterBar>
  )
}
