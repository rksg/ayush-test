import { List }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer }              from '@acx-ui/components'
import { BetaListDetails as betaList } from '@acx-ui/feature-toggle'
import { CaretRightList }              from '@acx-ui/icons'

import * as UI from './styledComponents'

/* eslint-disable-next-line */
export interface BetaFeaturesDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  onClose: () => void
  width?: number
}

function BetaFeaturesDrawer (
  props: BetaFeaturesDrawerProps
) {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  const onClose = () => {
    setVisible(false)
  }

  const footer =<div>
    <Button type='primary'
      onClick={() => {
        setVisible(false)
      }}>
      {$t({ defaultMessage: 'Ok' })}
    </Button>
  </div>

  return <Drawer
    title={$t({ defaultMessage: 'RUCKUS One Beta Features' })}
    visible={visible}
    onClose={onClose}
    width={props.width}
    children={
      <UI.ListWrapper>
        <List
          split={false}
          size='small'
          dataSource={betaList}
          renderItem={(item) =>
            <List.Item id={item.key}>
              {item.status &&
                  <List.Item.Meta
                    avatar={<CaretRightList />}
                    title={$t(item.description)}
                  />
              }
            </List.Item>
          }
        />
      </UI.ListWrapper>
    }
    footer={footer}
  />
}

export { BetaFeaturesDrawer }

