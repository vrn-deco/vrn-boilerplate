/*
 * @Author: Cphayim
 * @Date: 2020-07-15 12:12:42
 * @LastEditTime: 2020-07-16 00:32:24
 * @Description: 路由视图组件
 */

import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { ConnectedRouter, push } from 'connected-react-router'

import { history } from './history'
import { store } from '@/store'

interface Props {
  routes: Array<{ path: string; component: any }>
}

export function RouterView({ routes }: Props) {
  return (
    <ConnectedRouter history={history}>
      <Switch>
        {/* 当前层级的路由 */}
        {routes.map((route) => (
          <Route
            path={route.path}
            exact
            render={(props) => {
              // 将 history、location 对象传递给页面组件
              return <route.component {...props} />
            }}
            key={route.path}
          />
        ))}
        {/* 当前 routes 列表中有路由对象则转至第一个，否则显示 404 */}
        {routes.length ? (
          <Redirect to={routes[0].path} />
        ) : (
          <Route path='*'>404</Route>
        )}
      </Switch>
    </ConnectedRouter>
  )
}

setTimeout(() => {
  console.log('跳')
  store.dispatch(push('/counter/record'))
}, 2000)
