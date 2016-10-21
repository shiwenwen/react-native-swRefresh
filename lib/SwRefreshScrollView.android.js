/**
 * Created by sww on 2016/10/21.
 */

/**
 * ---------------------Android平台ScrollView不支持下拉刷新 这是一个空实现-----------------------
 */

import React, { Component,PropTypes} from 'react';
import {
  View,
  ScrollView
} from 'react-native';
/**
 * 下拉刷新默认状态文字
 * @type {{pullToRefresh: string, releaseToRefresh: string, refreshing: string}}
 */
export const RefreshTitle={
  pullToRefresh:'下拉以刷新',
  releaseToRefresh:'松开以刷新',
  refreshing:'正在刷新数据'
}

/**
 * 下拉刷新状态//0 下拉以刷新 1 松开以刷新 2 刷新中
 * @type {{pullToRefresh: number, releaseToRefresh: number, refreshing: number}}
 */

export const RefreshStatus={
  pullToRefresh:0,
  releaseToRefresh:1,
  refreshing:2
}
export class SwRefreshScrollView extends ScrollView{
  render(){
    return<View></View>
  }


}
