import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button }        from '@acx-ui/components'
import { UIColorSchema } from '@acx-ui/rc/utils'


interface StepNavigationProps {
  isStart?: boolean,
  onNext?: () => void,
  onBack?: () => void,
  config: UIColorSchema
}

export function StepNavigation (props: StepNavigationProps) {
  const { isStart, onNext, onBack, config } = props
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
        style={{
          color: config.buttonFontColor,
          backgroundColor: config.buttonColor,
          borderColor: config.buttonColor
        }}
        type='primary'
        onClick={onBack}
      >
        {$t({ defaultMessage: '< Back' })}
      </Button>
      }
      <Button
        style={{
          color: config.buttonFontColor,
          backgroundColor: config.buttonColor,
          borderColor: config.buttonColor
        }}
        type='primary'
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