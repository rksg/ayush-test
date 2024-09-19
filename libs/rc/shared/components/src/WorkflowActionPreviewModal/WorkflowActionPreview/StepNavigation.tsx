import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button } from '@acx-ui/components'


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
      style={{
        paddingTop: '35px',
        paddingBottom: '12px'
      }}
      size={20}
    >
      {!isStart &&
      <Button
        type='primary'
        size='large'
        onClick={onBack}
      >
        {$t({ defaultMessage: '< Back' })}
      </Button>
      }
      <Button
        style={{
          /* TODO: Use global configuration */
          // backgroundColor: 'yellowgreen',
          // borderColor: 'yellowgreen'
        }}
        type='primary'
        size='large'
        onClick={onNext}
      >
        {isStart
          ? $t({ defaultMessage: 'Start' })
          : $t({ defaultMessage: 'Next >' })
        }
      </Button>
    </Space>
  )
}
