// @ts-nocheck
import React, { useState, useEffect } from 'react'

import { v4 as uuidv4 } from 'uuid'

import Layout                      from './components/Layout'
import mockData                    from './mock'
import * as UI                     from './styledComponents'
import { compactLayoutHorizontal } from './utils/compact'

const layout = {
  containerWidth: 1200,
  containerHeight: 300, // min height
  calWidth: 380,
  rowHeight: 50,
  col: 4, // fixed (for R1)
  margin: [20, 10],
  containerPadding: [0, 0] // deprecated
}

// const emptyData = [
//   {
//     id: 0,
//     type: 'group',
//     cards: []
//   }
// ]

export default function Grid () {
  const [compactType, setCompactType] = useState('horizontal')
  const [groups, setGroups] = useState([])
  const [sections, setSections] = useState([])
  useEffect(() => {
    const data = getFromLS()
    setSections(data)
    const group = data.reduce((acc, cur) => acc.groups.concat(cur.groups))
    setGroups(group)
  }, [])

  const changeCompactType = () => {
    setCompactType(compactType === 'horizontal' ? 'vertical' : 'horizontal')
  }

  const getFromLS = () => {
    let ls = localStorage.getItem('acx-ui-dashboard') ?
      JSON.parse(localStorage.getItem('acx-ui-dashboard')) : mockData
    return ls //mockData
  }

  const saveToLS = () => {
    const tmp = _.cloneDeep(sections)
    tmp.forEach(s => {
      s.groups = groups.filter(g => g.sectionId === s.id)
    })
    localStorage.setItem('acx-ui-dashboard', JSON.stringify(tmp))
  }

  const addCard = () => {
    let cards = groups[0].cards
    const lastCard = cards[cards.length - 1]
    cards = [
      ...cards,
      {
        id: uuidv4(),
        gridx: lastCard ? lastCard.gridx : 0,
        gridy: lastCard ? lastCard.gridy : 0,
        width: 1,
        height: 6,
        type: 'card',
        isShadow: false
      }
    ]
    let compactedLayout = compactLayoutHorizontal(cards, 4)
    groups[0].cards = compactedLayout
    const tmp = [...groups]
    setGroups(tmp)
  }

  return (
    <UI.Grid>
      <button
        style={{ height: '30px', margin: '10px' }}
        onClick={changeCompactType}
      >
        Change Compaction Type: <b>{compactType}</b>
      </button>
      <button
        style={{ height: '30px', margin: '10px' }}
        onClick={saveToLS}
      >
        Save to Local Storage
      </button>
      <button
        style={{ height: '30px', margin: '10px' }}
        onClick={addCard}
      >
        Add a card to group 1
      </button>

      <Layout
        sections={sections}
        setSections={setSections}
        groups={groups}
        setGroups={setGroups}
        compactType={compactType}
        layout={layout}
      />
    </UI.Grid>
  )
}
