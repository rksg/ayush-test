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
import { Canvas } from '@acx-ui/rc/utils'

import { CardInfo, layoutConfig, Section, Group } from './Canvas'
import Layout                                     from './components/Layout'
import {
  getCalculatedColumnWidth,
  getCanvasData,
  getMenuWidth,
  getPreviewModalWidth
} from './index.utils'
import * as UI from './styledComponents'

export const PreviewDashboardModal = (props: {
  data: Canvas[]
  visible: boolean
  setVisible: (visible: boolean) => void
}) => {
  const { data, visible, setVisible } = props
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
      const { canvasId, sections, groups } = getCanvasData(data)
      if (canvasId && sections) {
        setCanvasId(canvasId)
        setSections(sections)
        setGroups(groups)
        setTimeout(() => {
          const modalBody = document.querySelector('.ant-modal-body')
          if (modalBody) {
            modalBody.scrollTop = 0
          }
        }, 50)
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
      <div className='title'>{ data[0]?.name }</div>
      <div className='action'>
        {isFullmode
          ? <Button
            data-testid='collapsed-button'
            ghost={true}
            icon={<ArrowsIn size='md' />}
            onClick={()=> setIsFullmode(false)}
          />
          : <>
            <Button
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
        <UI.Grid $type='pageview'>
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
        </UI.Grid>
      </div>
    </DndProvider>
  </UI.PreviewModal>
}