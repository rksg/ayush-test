import { useEffect, useState } from 'react'

import { DndProvider }  from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import {
  Button,
  useLayoutContext
} from '@acx-ui/components'
import {
  ArrowsIn,
  ArrowsOut,
  Close
} from '@acx-ui/icons-new'

import { Section, Group }         from '../AICanvas/Canvas'
import { CardInfo, layoutConfig } from '../AICanvas/Canvas'
import Layout                     from '../AICanvas/components/Layout'
import * as CanvasUI              from '../AICanvas/styledComponents'

import {
  getCalculatedColumnWidth,
  getCanvasData,
  getMenuWidth,
  getPreviewModalWidth
} from './index.utils'
import * as UI from './styledComponents'

export const PreviewDashboardModal = (props: {
  visible: boolean
  setVisible: (visible: boolean) => void
  previewId: string
}) => {
  const { visible, setVisible, previewId } = props
  const { menuCollapsed } = useLayoutContext()
  const [canvasId, setCanvasId] = useState('')
  const [groups, setGroups] = useState([] as Group[])
  const [sections, setSections] = useState([] as Section[])
  const [shadowCard, setShadowCard] = useState({} as CardInfo)

  const menuWidth = getMenuWidth(menuCollapsed)
  const modalDefaultWidth = document.documentElement.clientWidth - menuWidth
  const [isFullmode, setIsFullmode] = useState(false)
  const [modalWidth, setModalWidth] = useState(modalDefaultWidth)
  const [layout, setLayout] = useState({
    ...layoutConfig,
    containerWidth: modalWidth,
    calWidth: getCalculatedColumnWidth(menuCollapsed, modalWidth)
  })

  useEffect(() => {
    const menuWidth = getMenuWidth(menuCollapsed)
    const modalWidth = getPreviewModalWidth(menuWidth, isFullmode)
    setModalWidth(modalWidth)
    setLayout({
      ...layout,
      containerWidth: modalWidth,
      calWidth: getCalculatedColumnWidth(menuCollapsed, modalWidth)
    })
  }, [menuCollapsed, isFullmode])

  useEffect(() => {
    if (visible) {
      //TODO
      // 1. get canvas by id
      // 2. scroll to top when opened
      console.log('previewId: ', previewId) // eslint-disable-line no-console
      const { canvasId, sections, groups } = getCanvasData()
      if (canvasId && sections) {
        setCanvasId(canvasId)
        setSections(sections)
        setGroups(groups)
      }
    }
  }, [visible])

  return <UI.PreviewModal
    title=''
    centered
    closable={false}
    zIndex={9999}
    footer={[]}
    visible={visible && !!canvasId}
    width={modalWidth}
    className={isFullmode ? 'fullmode' : ''}
  >
    <div className='header'>
      <div className='title'>Dashboard Canvas</div>
      <div className='action'>
        {isFullmode
          ? <Button
            data-testid='collapsed-button'
            ghost={true}
            icon={<ArrowsIn size='md' />}
            onClick={()=> setIsFullmode(false)}
          />
          : <>
            <Button //TODO: Fix bug
              data-testid='expanded-button'
              ghost={true}
              icon={<ArrowsOut size='md' />}
              onClick={()=> setIsFullmode(true)}
            />
            <Button
              data-testid='close-button'
              ghost={true}
              icon={<Close size='md' />}
              onClick={()=> setVisible(false)}
            />
          </>}
      </div>
    </div>
    <DndProvider backend={HTML5Backend}>
      <div className='grid'>
        <CanvasUI.Grid $type='pageview'>
          <Layout
            readOnly={true}
            sections={sections}
            groups={groups}
            setGroups={setGroups}
            compactType={'horizontal'}
            layout={layout}
            setLayout={setLayout}
            canvasId={canvasId}
            shadowCard={shadowCard}
            setShadowCard={setShadowCard}
            containerId='preview-container'
          />
        </CanvasUI.Grid>
      </div>
    </DndProvider>
  </UI.PreviewModal>
}