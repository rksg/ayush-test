import React        from 'react'
import { Provider } from 'react-redux'
import { Outlet }   from 'react-router-dom'
import { store }    from 'src/store'

function Networks () {
  return (
    <Provider store={store}>
      <Outlet />
    </Provider>
  )
}

export default Networks
