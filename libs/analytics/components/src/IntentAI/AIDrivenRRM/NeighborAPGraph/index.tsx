import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Card, nodeTypes, Drawer, DrawerTypes, Loader, NeighborAPGraph as NeighborAPGraphComponent, ProcessedCloudRRMGraph } from '@acx-ui/components'

import { useIntentContext }     from '../../IntentContext'
import { GraphTitle }           from '../RRMGraph'
import { Legend }               from '../RRMGraph/Legend'
import { useIntentAICRRMQuery } from '../RRMGraph/services'
import * as UI                  from '../RRMGraph/styledComponents'


export function DataGraph (props: {
  data: ProcessedCloudRRMGraph[],
  zoom: number
}) {
  const nodeSize = {
    max: 120,
    min: 50
  }

  if (!props.data?.length) return null

  return <>
    <div style={{
      margin: 'auto',
      zoom: props.zoom
    }}>
      <NeighborAPGraphComponent
        title=''
        nodeSize={nodeSize}
        nodes={props.data[0].neighborAP!}
        width={500}
        height={400}
        backgroundColor='transparent'
      />
    </div>
    <UI.CrrmArrow children={<UI.RightArrow/>} />
    <div style={{
      margin: 'auto',
      zoom: props.zoom
    }}>
      <NeighborAPGraphComponent
        title=''
        nodeSize={nodeSize}
        nodes={props.data[1].neighborAP!}
        width={500}
        height={400}
        backgroundColor='transparent'
      />
    </div>
  </>
}

export const NeighborAPGraph = () => {
  const { $t } = useIntl()
  const { intent, state } = useIntentContext()
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

  return <UI.Wrapper>
    <Loader states={[queryResult]}>
      <Card>
        <UI.GraphWrapper data-testid='graph-wrapper'
          key={'graph-details'}
        >
          <DataGraph data={result} zoom={0.8}/>
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
            <DataGraph data={result} zoom={1.5}/>
            <GraphTitle details={intent} />
            <UI.GraphLegendWrapper><Legend {...trimmed}/></UI.GraphLegendWrapper>
          </UI.GraphWrapper>
        }
      />
    </Loader>
  </UI.Wrapper>
}
