/*
 * @Author: Cphayim
 * @Date: 2019-09-10 17:18:39
 * @LastEditTime: 2020-07-15 09:24:46
 * @Description: 计数器容器组件
 */

import Types from 'MyTypes'
import { connect } from 'react-redux'

import { FCCounter } from './fc-counter'
import { CounterStore } from './counter.store'

interface StateProps {
  (state: Types.RootState): {
    count: number
  }
}

interface DispatchProps {
  readonly onIncrement: () => void
  readonly onDecrement: () => void
  readonly onSet: (num: number) => void
}

const mapStateToProps: StateProps = (state) => ({
  count: state.counter.count,
})

const mapDispatchToProps: DispatchProps = {
  onIncrement: CounterStore.action.increment,
  onDecrement: CounterStore.action.decrement,
  onSet: CounterStore.action.set,
}

export default connect(mapStateToProps, mapDispatchToProps)(FCCounter)
