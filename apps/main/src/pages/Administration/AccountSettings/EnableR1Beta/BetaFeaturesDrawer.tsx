import { List }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Drawer }                              from '@acx-ui/components'
import { BetaListDetails as betaList, useGetBetaList } from '@acx-ui/feature-toggle'
import { CaretRightList }                              from '@acx-ui/icons'

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
  // beta list feature Ids fetched from split.io
  const betaListFeatureIds = useGetBetaList()
  const showBetaList = betaListFeatureIds.length > 0
  if (showBetaList && betaList) {
    Object.keys(betaList).forEach(k => {
      betaList[Number(k)].status = betaList[Number(k)].status &&
          betaListFeatureIds.includes(betaList[Number(k)].key)
    })
  }

  const drawerTitle = $t({ defaultMessage: 'RUCKUS One Early Access Features' })
  const footer =<div>
    <Button type='primary'
      onClick={() => {
        setVisible(false)
      }}>
      {$t({ defaultMessage: 'OK' })}
    </Button>
  </div>
  return ( showBetaList ? <Drawer
    title={drawerTitle}
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
            item.status &&
            <List.Item id={item.key}>
              <List.Item.Meta
                avatar={<CaretRightList/>}
                title={$t(item.description)}
              />
            </List.Item>
          }
        />
      </UI.ListWrapper>
    }
    footer={footer}
  /> : <Drawer
    title={drawerTitle}
    visible={visible}
    onClose={onClose}
    width={props.width}
    children={
      <UI.ListWrapper>
        <p>{$t({ defaultMessage: 'No Early Access features to show' })} </p>
      </UI.ListWrapper>
    }
    footer={footer}
  />

  )
}

export { BetaFeaturesDrawer }

