import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import * as UI from './styledComponent'


interface StepNavigationProps {
  isStart?: boolean,
  onNext?: () => void,
  onBack?: () => void
}

export function StepNavigation (props: StepNavigationProps) {
  const { isStart, onNext, onBack } = props
  const { $t } = useIntl()

  return (
    <Space
      style={{ paddingTop: '35px' }}
      size={20}
    >
      {!isStart &&
      <UI.Button
        type='primary'
        size='large'
        onClick={onBack}
      >
        {$t({ defaultMessage: '< Back' })}
      </UI.Button>
      }
      <UI.Button
        type='primary'
        size='large'
        onClick={onNext}
      >
        {isStart
          ? $t({ defaultMessage: 'Start' })
          : $t({ defaultMessage: 'Next >' })
        }
      </UI.Button>
    </Space>
  )
}