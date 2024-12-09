// @ts-nocheck
import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button } from '@acx-ui/components'

import Layout  from './components/Layout'
import * as UI from './styledComponents'

// import mockData from './mock'

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
]

const compactType = 'horizontal'

const layout = {
  containerWidth: 1200,
  containerHeight: 300, // min height
  calWidth: 380,
  rowHeight: 50,
  col: 4, // fixed (for R1)
  margin: [20, 10],
  containerPadding: [0, 0] // deprecated
}

export default function Canvas (props) {
  const { $t } = useIntl()
  // const [widgets, setWidgets] = useState([])
  const [groups, setGroups] = useState([])
  const [sections, setSections] = useState([])

  useEffect(() => {
    const data = getFromLS()
    setSections(data)
    const group = data.reduce((acc, cur) => [...acc, ...cur.groups], [])
    setGroups(group)
  }, [])

  const getFromLS = () => {
    let ls = localStorage.getItem('acx-ui-canvas') ?
      JSON.parse(localStorage.getItem('acx-ui-canvas')) : DEFAULT_CANVAS // mockData
    return ls
  }

  const saveToLS = () => {
    const tmp = _.cloneDeep(sections)
    tmp.forEach(s => {
      s.groups = groups.filter(g => g.sectionId === s.id)
    })
    localStorage.setItem('acx-ui-canvas', JSON.stringify(tmp))
  }

  const onClear = () => {
    setSections(DEFAULT_CANVAS)
    setGroups(DEFAULT_CANVAS.reduce((acc, cur) => [...acc, ...cur.groups], []))
  }

  return (
    <UI.Canvas>
      <div className='header'>
        <div className='title'>
          <span>Canvas</span>
        </div>
        <div className='actions'>
          {/* <Button role='primary' onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Publish' })}
          </Button> */}
          <Button role='primary' onClick={()=>{saveToLS()}}>
            {$t({ defaultMessage: 'Save' })}
          </Button>
          {/* <Button className='black' onClick={()=>{onClose()}}>
            {$t({ defaultMessage: 'Preview' })}
          </Button> */}
          <Button className='black' onClick={() => {onClear()}}>
            {$t({ defaultMessage: 'Clear' })}
          </Button>
        </div>
      </div>
      <div className='grid' id='grid'>
        <UI.Grid>
          <Layout
            sections={sections}
            setSections={setSections}
            groups={groups}
            setGroups={setGroups}
            compactType={compactType}
            layout={layout}
            setShadowCard={props.setShadowCard}
            shadowCard={props.shadowCard}
          />
        </UI.Grid>
      </div>
    </UI.Canvas>
  )
}
