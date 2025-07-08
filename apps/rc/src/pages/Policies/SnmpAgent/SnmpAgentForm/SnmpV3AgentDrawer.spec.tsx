import { useReducer } from 'react'

import userEvent from '@testing-library/user-event'

import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { render, screen, renderHook } from '@acx-ui/test-utils'

import { newEmptySnmpData }                  from './__tests__/fixtures'
import SnmpAgentFormContext, { mainReducer } from './SnmpAgentFormContext'
import SnmpV3AgentDrawer                     from './SnmpV3AgentDrawer'

const renderInitState = (children: JSX.Element, initState=newEmptySnmpData) => {
  const { result } = renderHook(() => useReducer(mainReducer, initState ))
  const [state, dispatch] = result.current

  const renderElement = <SnmpAgentFormContext.Provider value={{ state, dispatch }}>
    {children}
  </SnmpAgentFormContext.Provider>

  return {
    state, dispatch, renderElement
  }
}

describe('SnmpV3AgentDrawer', () => {
  jest.mocked(useIsSplitOn).mockImplementation(
    ff => (
      ff === Features.WIFI_RBAC_API
    )
  )

  describe('PasswordInputStrength Extend Test', () => {
    describe('Should pass', () => {
      it('Aa1@bcdef', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), 'Aa1@bcdef')
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
      it('P@ssw0rd!', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), 'P@ssw0rd!')
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
      it('Str0ng$P@ss', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), 'Str0ng$P@ss')
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
      it('C0mpl3x!ty1', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), 'C0mpl3x!ty1')
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
      it('ValidP@ss1!', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), 'ValidP@ss1!')
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
      it('S@feP@ssw0rd', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), 'S@feP@ssw0rd')
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      })
    })
    describe('Should not pass', () => {
      it('~Aa1@bcdef - Should fail (starts with ~)', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), '~Aa1@bcdef')
        expect(await screen.findByRole('alert')).toBeInTheDocument()
      })
      it('Aa1`bcdef@ - Should fail (contains `)', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), 'Aa1`bcdef@')
        expect(await screen.findByRole('alert')).toBeInTheDocument()
      })
      it('Aa1@bcd$( - Should fail (contains $()', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), 'Aa1@bcd$(')
        expect(await screen.findByRole('alert')).toBeInTheDocument()
      })
      it('Aa1~bcdef - Should fail (contains ~ at the beginning)', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), '~Aa1bcdef')
        expect(await screen.findByRole('alert')).toBeInTheDocument()
      })
      it('`Aa1@bcdef - Should fail (contains `)', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), '`Aa1@bcdef')
        expect(await screen.findByRole('alert')).toBeInTheDocument()
      })
      it('Aa1@bc$(def - Should fail (contains $()', async () => {
        const { renderElement } = renderInitState(
          <SnmpV3AgentDrawer visible={true} setVisible={jest.fn} editIndex={-1} />, newEmptySnmpData
        )
        render(renderElement)
        await userEvent.type(await screen.findByTestId('password-input-strength'), 'Aa1@bc$(def')
        expect(await screen.findByRole('alert')).toBeInTheDocument()
      })
    })
  })

})