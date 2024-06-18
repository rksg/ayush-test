/* eslint-disable max-len */

import { TooltipPlacement }          from 'antd/lib/tooltip'
import { FormattedMessage, useIntl } from 'react-intl'

import { Tooltip, Button, cssStr }    from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'


export type ApCompatibilityToolTipProps = {
    visible: boolean,
    title: string,
    onClick: () => void,
    placement?: TooltipPlacement
  }

/*
  Sample:
  <ApCompatibilityToolTip
    title={clientAdmissionControlTitleInfo}
    visible={supportApCompatibleCheck}
    onClick={() => setDrawerVisible(true)}/>
  */
export function ApCompatibilityToolTip (props: ApCompatibilityToolTipProps) {
  const { $t } = useIntl()
  const { visible, title, onClick, placement } = props

  const compatibilityToolTipInfo = $t({
    defaultMessage:
        'See the compatibility requirements.'
  })

  return (<Tooltip
    title={
      <FormattedMessage
        defaultMessage={
          '{title}  <compatibilityToolTip></compatibilityToolTip>'
        }
        values={{
          title,
          compatibilityToolTip: ()=> (visible?<Button
            type='link'
            data-testid='tooltip-button'
            style={{ fontSize: cssStr('--acx-body-4-font-size') }}
            onClick={onClick}>
            {compatibilityToolTipInfo}
          </Button>:[])
        }}
      />
    }
    placement={placement ?? 'right'}>
    <QuestionMarkCircleOutlined
      style={{ height: '16px', width: '16px', marginBottom: -3 }}
    />
  </Tooltip>)
}