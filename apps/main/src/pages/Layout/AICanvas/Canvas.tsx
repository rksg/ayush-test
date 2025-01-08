import { useEffect, useState } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button } from '@acx-ui/components'

import Layout  from './components/Layout'
import * as UI from './styledComponents'

// import mockData from './mock'

const compactType = 'horizontal'

export interface LayoutConfig {
  containerWidth: number
  containerHeight: number
  calWidth: number
  rowHeight: number
  col: number
  margin: number[]
  containerPadding: number[]
}

export interface Size {
  width: number
  height: number
}

export interface CardInfo {
  id: string,
  gridx: number
  gridy: number
  width: number
  height: number
  type: string
  isShadow: boolean
  currentSizeIndex: number
  sizes: Size[]
  chartType?: string
}
export interface Group {
  id: string
  sectionId: string
  type: string
  cards: CardInfo[]
  index?: number
  defaultTab?: string
  tabValue?: string
  tabLabel?: string
}
export interface Section {
  id: string
  type: string
  hasTab: boolean
  groups: Group[]
}

const layout:LayoutConfig = {
  containerWidth: 1200,
  containerHeight: 300, // min height
  calWidth: 380,
  rowHeight: 50,
  col: 4, // fixed (for R1)
  margin: [20, 10],
  containerPadding: [0, 0] // deprecated
}

const DEFAULT_CANVAS = [
  {
    id: 'default_section',
    type: 'section',
    hasTab: false,
    groups: [{
      id: 'default_group',
      sectionId: 'default_section',
      type: 'group',
      cards: []
    }]
  }
] as unknown as Section[]

export default function Canvas () {
  const { $t } = useIntl()
  // const [widgets, setWidgets] = useState([])
  const [groups, setGroups] = useState([] as Group[])
  const [sections, setSections] = useState([] as Section[])

  useEffect(() => {
    const data = getFromLS()
    setSections(data)
    const group = data.reduce((acc:Section[], cur:Section) => [...acc, ...cur.groups], [])
    setGroups(group)
  }, [])

  const getFromLS = () => {
    let ls = localStorage.getItem('acx-ui-canvas') ?
      JSON.parse(localStorage.getItem('acx-ui-canvas') || '') : DEFAULT_CANVAS // mockData
    return ls
  }

  const saveToLS = () => {
    const tmp = _.cloneDeep(sections)
    tmp.forEach(s => {
      s.groups = groups.filter(g => g.sectionId === s.id)
    })
    localStorage.setItem('acx-ui-canvas', JSON.stringify(tmp))
  }

  // const onClear = () => {
  //   setSections(DEFAULT_CANVAS)
  //   setGroups(DEFAULT_CANVAS.reduce((acc:Group[], cur:Section) => [...acc, ...cur.groups], []))
  // }

  return (
    <UI.Canvas>
      <div className='header'>
        <div className='title'>
          <span>{$t({ defaultMessage: 'Custom Canvas' })}</span>
        </div>
        <div className='actions'>
          {/* <Button onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Publish' })}
          </Button> */}
          {/* <Button className='black' onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Preview' })}
          </Button> */}
          {/* <Button className='black' onClick={() => {onClear()}}>
            {$t({ defaultMessage: 'Clear' })}
          </Button> */}
          <Button type='primary' onClick={()=>{saveToLS()}}>
            {$t({ defaultMessage: 'Save' })}
          </Button>
        </div>
      </div>
      <div className='grid' id='grid'>
        <UI.Grid>
          <Layout
            sections={sections}
            groups={groups}
            setGroups={setGroups}
            compactType={compactType}
            layout={layout}
          />
        </UI.Grid>
      </div>
    </UI.Canvas>
  )
}
