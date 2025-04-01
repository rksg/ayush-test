import { useState } from 'react'

import userEvent from '@testing-library/user-event'

import { renderHook, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { EdgeEditContext } from '../..'

import { EditEdgeFormControlType, showUnsavedModal } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

const defaultFormControlState = {
  isDirty: true,
  hasError: false,
  applyFn: () => {}
} as EditEdgeFormControlType

const defaultActiveSubTabState = {
  key: EdgeEditContext.EdgePortTabEnum.PORTS_GENERAL as string,
  title: 'Ports General'
}

const mockedCancelFn = jest.fn()
const mockedDiscardFn = jest.fn()
const mockedSaveFn = jest.fn()

describe('EditEdgeContext', () => {
  beforeEach(async () => {
    mockedCancelFn.mockReset()
    mockedDiscardFn.mockReset()
    mockedSaveFn.mockReset()
  })

  it('handle undefined title', async () => {
    const { result: formControlRef } = renderHook(() => {
      const [formControl, setFormControl] = useState(defaultFormControlState)
      return { formControl, setFormControl }
    })

    const { result: activeSubTabRef } = renderHook(() => {
      const [activeSubTab, setActiveSubTab] = useState({
        key: '123' as string,
        title: undefined as unknown as string
      })
      return { activeSubTab, setActiveSubTab }
    })

    showUnsavedModal(
      {
        activeSubTab: activeSubTabRef.current.activeSubTab,
        formControl: formControlRef.current.formControl,
        setActiveSubTab: activeSubTabRef.current.setActiveSubTab,
        setFormControl: formControlRef.current.setFormControl
      },
      {
        cancel: mockedCancelFn,
        discard: mockedDiscardFn,
        save: mockedSaveFn
      })

    await assertModalVisible({
      contents: [
        'You Have Unsaved Changes',
        'Do you want to save your changes in "", or discard all changes?'
      ]
    })

    await assertButtonClicked({
      label: 'Cancel',
      handler: mockedCancelFn
    })
  })

  describe('has unsave', () => {
    const { result: formControlRef } = renderHook(() => {
      const [formControl, setFormControl] = useState(defaultFormControlState)
      return { formControl, setFormControl }
    })

    const { result: activeSubTabRef } = renderHook(() => {
      const [activeSubTab, setActiveSubTab] = useState(defaultActiveSubTabState)
      return { activeSubTab, setActiveSubTab }
    })

    beforeEach(async () => {
      showUnsavedModal(
        {
          activeSubTab: activeSubTabRef.current.activeSubTab,
          formControl: formControlRef.current.formControl,
          setActiveSubTab: activeSubTabRef.current.setActiveSubTab,
          setFormControl: formControlRef.current.setFormControl
        },
        {
          cancel: mockedCancelFn,
          discard: mockedDiscardFn,
          save: mockedSaveFn
        })

      await assertModalVisible({
        contents: [
          'You Have Unsaved Changes'
        ]
      })
    })

    it('handle cancel', async () => {
      await assertButtonClicked({
        label: 'Cancel',
        handler: mockedCancelFn
      })
    })

    it('handle discard change', async () => {
      await assertButtonClicked({
        label: 'Discard Changes',
        handler: mockedDiscardFn
      })
    })

    it('handle save change', async () => {
      await assertButtonClicked({
        label: 'Save Changes',
        handler: mockedSaveFn
      })
    })
  })

  describe('has error', () => {
    const { result: formControlRef } = renderHook(() => {
      const [formControl, setFormControl] = useState({
        ...defaultFormControlState,
        hasError: true
      })
      return { formControl, setFormControl }
    })

    const { result: activeSubTabRef } = renderHook(() => {
      const [activeSubTab, setActiveSubTab] = useState(defaultActiveSubTabState)
      return { activeSubTab, setActiveSubTab }
    })

    beforeEach(async () => {
      showUnsavedModal(
        {
          activeSubTab: activeSubTabRef.current.activeSubTab,
          formControl: formControlRef.current.formControl,
          setActiveSubTab: activeSubTabRef.current.setActiveSubTab,
          setFormControl: formControlRef.current.setFormControl
        },
        {
          cancel: mockedCancelFn,
          discard: mockedDiscardFn,
          save: mockedSaveFn
        })

      await assertModalVisible({
        contents: [
          'You Have Invalid Changes'
        ]
      })
    })

    it('handle cancel and should not have save button', async () => {
      expect(screen.queryByRole('button', { name: 'Save Changes' })).toBeNull()

      await assertButtonClicked({
        label: 'Cancel',
        handler: mockedCancelFn
      })
    })

    it('handle discard change', async () => {
      await assertButtonClicked({
        label: 'Discard Changes',
        handler: mockedDiscardFn
      })
    })
  })
})

async function assertModalVisible (props: {
  contents: string[]
}) {
  const dialog = await screen.findByRole('dialog')
  const scope = within(dialog)
  for (const content of props.contents) {
    expect(await scope.findByText(content)).toBeVisible()
  }
}

async function findTargetCancelButton () {
  return (await screen.findAllByRole('button', { name: 'Cancel' }))[0]
}

async function assertButtonClicked (props: {
  label: string
  handler: jest.Mock
}) {
  if (props.label === 'Cancel') {
    await userEvent.click(await findTargetCancelButton())
  } else {
    await userEvent.click(await screen.findByRole('button', { name: props.label }))
  }

  await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
  expect(props.handler).toBeCalled()
}
