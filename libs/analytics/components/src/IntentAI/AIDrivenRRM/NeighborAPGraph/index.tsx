import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card, nodeTypes, Drawer, DrawerTypes, Loader, NeighborAPGraph as NeighborAPGraphComponent, ProcessedCloudRRMGraph } from '@acx-ui/components'

import { useIntentContext }                    from '../../IntentContext'
import { coldTierDataText, dataRetentionText } from '../../utils'
import { GraphTitle }                          from '../RRMGraph'
import { Legend }                              from '../RRMGraph/Legend'
import { useIntentAICRRMQuery }                from '../RRMGraph/services'
import * as UI                                 from '../RRMGraph/styledComponents'

export function DataGraph (props: {
  data: ProcessedCloudRRMGraph[],
  graphFactors?: {
    zoom: number,
    repulsion: number,
    leftOffset: string
  }
}) {
  const nodeSize = {
    max: 120,
    min: 60
  }

  if (!props.data?.length) return null

  return <>
    <div><AutoSizer>{({ height, width }) => <NeighborAPGraphComponent
      title=''
      nodeSize={nodeSize}
      nodes={props.data[0].neighborAP!}
      width={width}
      height={height}
      backgroundColor='transparent'
      zoom={props.graphFactors?.zoom}
      repulsion={props.graphFactors?.repulsion}
      leftOffset={props.graphFactors?.leftOffset}
    />}</AutoSizer>
    </div>
    <UI.CrrmArrow children={<UI.RightArrow/>} />
    <div><AutoSizer>{({ height, width }) => <NeighborAPGraphComponent
      title=''
      nodeSize={nodeSize}
      nodes={props.data[1].neighborAP!}
      width={width}
      height={height}
      backgroundColor='transparent'
      zoom={props.graphFactors?.zoom}
      repulsion={props.graphFactors?.repulsion}
      leftOffset={props.graphFactors?.leftOffset}
    />}</AutoSizer>
    </div>
  </>
}

export const NeighborAPGraph = () => {
  const { $t } = useIntl()
  const { intent, state, isDataRetained, isHotTierData } = useIntentContext()
  const [ visible, setVisible ] = useState<boolean>(false)
  const [ key, setKey ] = useState(0)

  const showDrawer = () => setVisible(true)
  const closeDrawer = () => setVisible(false)
  useEffect(() => setKey(Math.random()), [visible])

  const queryResult = useIntentAICRRMQuery()
  const result = queryResult.data!

  const title = $t({ defaultMessage: 'Neighbor AP Graph' })
  const noData = state === 'no-data'

  const entries = Object.entries(nodeTypes)
  const [, ...rest] = entries
  const trimmed = Object.fromEntries(rest)

  if (!isHotTierData) return <Card>{$t(coldTierDataText)}</Card>
  if (!isDataRetained) return <Card>{$t(dataRetentionText)}</Card>

  if (noData) {
    return <Card>
      {$t({ defaultMessage: 'Graph modeling will be generated once Intent is activated.' })}
    </Card>
  }

  const graphFactors = {
    zoom: 0.5,
    repulsion: 10,
    leftOffset: '15%'
  }

  return <UI.Wrapper>
    <Loader states={[queryResult]}>
      <Card>
        <UI.GraphWrapper data-testid='graph-wrapper'
          key={'graph-details'}
        >
          <DataGraph data={result} graphFactors={graphFactors} />
          <GraphTitle details={intent} />
          <UI.GraphLegendWrapper><Legend {...trimmed}/></UI.GraphLegendWrapper>
        </UI.GraphWrapper>
        <div style={{ display: 'flex', justifyContent: 'end' }}>
          <UI.ViewMoreButton
            hidden={noData}
            onClick={showDrawer}
            children={$t({ defaultMessage: 'View More' })}
          />
        </div>
      </Card>
      <Drawer
        key={key}
        drawerType={DrawerTypes.FullHeight}
        width={'90vw'}
        title={title}
        visible={visible}
        onClose={closeDrawer}
        children={
          <UI.GraphWrapper>
            <DataGraph data={result} />
            <GraphTitle details={intent} />
            <UI.GraphLegendWrapper><Legend {...trimmed}/></UI.GraphLegendWrapper>
          </UI.GraphWrapper>
        }
      />
    </Loader>
  </UI.Wrapper>
}
