import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import {
  MagnifyingGlassMinusOutlined,
  ArrowsOut,
  DesktopOutlined,
  RotateMobileOutlined
} from '@acx-ui/icons'

import * as UI from './styledComponents'

interface ContentProps {
    setShowScreen: (value: boolean) => void
}

export function Content ({ setShowScreen }: ContentProps) {
  const { $t } = useIntl()

  return (
    <UI.SpaceAlignContainer>
      <UI.Description>
        <h2>{$t({ defaultMessage: 'Hey, you are missing the bigger picture' })}</h2>
      </UI.Description>
      <UI.Description style={{ marginTop: '15px' }}>
        <h3>{$t({ defaultMessage: 'The screen width seems to be too low' })}</h3>
      </UI.Description>
      <UI.Description>
        <h3>{$t({ defaultMessage: '(minimal supported width is 1280px)' })}</h3>
      </UI.Description>
      <UI.Description style={{ marginTop: '15px' }}>
        <p>{$t({ defaultMessage:
          'For optimal display of RUCKUS One, please use one of the following methods:' })}
        </p>
      </UI.Description>
      <UI.SpaceAlignBlock>
        <UI.Description>
          <MagnifyingGlassMinusOutlined />
        </UI.Description>
        <Typography.Text strong>
          {$t({ defaultMessage: 'Zoom Out' })}
        </Typography.Text>
      </UI.SpaceAlignBlock>
      <UI.SpaceAlignBlock>
        <UI.Description>
          <ArrowsOut />
        </UI.Description>
        <Typography.Text strong>
          {$t({ defaultMessage: 'Resize browser window' })}
        </Typography.Text>
        <p>
          {$t({ defaultMessage: 'to at least 1280 pixels width' })}
        </p>
      </UI.SpaceAlignBlock>
      <UI.SpaceAlignBlock>
        <UI.Description>
          <DesktopOutlined />
        </UI.Description>
        <Typography.Text strong>
          {$t({ defaultMessage: 'Change screen resolution' })}
        </Typography.Text>
        <p>
          {$t({ defaultMessage: 'to 1280*X or higher' })}
        </p>
      </UI.SpaceAlignBlock>
      <UI.SpaceAlignBlock>
        <UI.Description>
          <RotateMobileOutlined />
        </UI.Description>
        <Typography.Text strong>
          {$t({ defaultMessage: 'Rotate your device' })}
        </Typography.Text>
        <p>{$t({ defaultMessage: 'to landscape orientation' })}</p>
      </UI.SpaceAlignBlock>
      <UI.Description style={{ marginTop: '30px' }}>
        <Typography.Link onClick={() => setShowScreen(true)} data-testid='subOptimalButton'>
          <p>{$t({ defaultMessage: 'Let me continue with sub-optimal display' })}</p>
        </Typography.Link>
      </UI.Description>
    </UI.SpaceAlignContainer>
  )
}