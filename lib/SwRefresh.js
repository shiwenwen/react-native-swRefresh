/**
 * Created by sww on 2016/10/18.
 */

import React, { Component,PropTypes} from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  Image,
  AsyncStorage,
  ListView
} from 'react-native';
const {width,height}=Dimensions.get('window')
const dateKey = 'SwRefresh_date'
const ArrowImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAABQBAMAAAD8TNiNAAAAJ1BMVEUAAACqqqplZWVnZ2doaGhqampoaGhpaWlnZ2dmZmZlZWVmZmZnZ2duD78kAAAADHRSTlMAA6CYqZOlnI+Kg/B86E+1AAAAhklEQVQ4y+2LvQ3CQAxGLSHEBSg8AAX0jECTnhFosgcjZKr8StE3VHz5EkeRMkF0rzk/P58k9rgOW78j+TE99OoeKpEbCvcPVDJ0OvsJ9bQs6Jxs26h5HCrlr9w8vi8zHphfmI0fcvO/ZXJG8wDzcvDFO2Y/AJj9ADE7gXmlxFMIyVpJ7DECzC9J2EC2ECAAAAAASUVORK5CYII=';
/**
 * 下拉刷新默认状态文字
 * @type {{pullToRefresh: string, releaseToRefresh: string, refreshing: string}}
 */
const RefreshTitle={
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

/**
 * ======================================SwRefreshScrollView===================================
 */

export class SwRefreshScrollView extends ScrollView{
  _offsetY=0
  _isRefreshing=false
  _dragFlag = false; //scrollview是否处于拖动状态的标志
  // 构造
    constructor(props) {
      super(props);
      // 初始状态
      this.state = {
        arrowAngle:new Animated.Value(0),
        refresStatus:RefreshStatus.pullToRefresh,
        refreshTitle:RefreshTitle.pullToRefresh,
        date:'暂无更新',
      };
    }

    static propTypes={

      //-----------------下拉刷新-------------------------------------
      /**
       * 刷新数据时的操作, 参数 end:function 操作结束时执行end() 以结束刷新状态
       */
      onRefresh:PropTypes.func,
      /**
       * 需要返回一个自定义的刷新视图,
       * 参数:
       *  refresStatus:RefreshStatus, 0 下拉以刷新 1 松开以刷新 2 刷新中
       *  offsetY:number 下拉的距离 用于自定义刷新
       */
      customRefreshView:PropTypes.func,
      /**
       * 如果自定义刷新视图 需要传递这个视图的高度 默认视图情况下 此属性无效
       */
      customRefreshViewHeight:PropTypes.number,

    }

    static defaultProps={


    }


  render(){
    return(
      <ScrollView
        ref="scrollView"
        {...this.props}
        scrollEventThrottle={16}
        onScroll={this._onscroll.bind(this)}
        onScrollEndDrag={(event)=>this._onScrollEndDrag(event)}
        onScrollBeginDrag={(event)=>this._onScrollBeginDrag(event)}
      >
        {this._rendRefreshheader()}
        {this.props.children}
      </ScrollView>
    )
  }
  componentDidMount(){

    AsyncStorage.getItem(dateKey, (error, result) => {


      if (result) {
        result = parseInt(result);

        //将时间传入下拉刷新的state
        this.setState({
          date:dateFormat(new Date(result),'yyyy-MM-dd hh:mm'),
        });

      }


    });
  }
  //------------------下拉刷新部分-----------------------------
  /**
   * 渲染头部刷新组件
   * @private
   */
  _rendRefreshheader(){
    if (this.props.customRefreshView) {
      return this._renderCustomHeader()

    }else {
      return this._renderDefaultHeader()
    }

  }

  /**
   * 渲染自定义的刷新视图
   * @returns {*}
   * @private
   */
  _renderCustomHeader(){

   return(
     <View style={{
       position:'absolute',
       top:-this.props.customRefreshViewHeight+0.5,
       left:0,
       right:0,
       height:this.props.customRefreshViewHeight,
       backgroundColor:'green'
     }}>
       {this.props.customRefreshView(this.state.refresStatus,this._offsetY)}
      </View>
   )

  }
  /**
   * 渲染默认的刷新视图
   * @returns {XML}
   * @private
   */
  _renderDefaultHeader(){
    return(
      <View style={defaultHeaderStyles.background}>
        <View style={defaultHeaderStyles.status}>
          {this._rendArrowOrActivity()}
          <Text style={defaultHeaderStyles.statusTitle}>{this.state.refreshTitle}</Text>
        </View>
        <Text style={defaultHeaderStyles.date}>{'上次更新时间:'+this.state.date}</Text>
      </View>
    )
  }

  /**
   * 渲染菊花或者箭头
   * @returns {XML}
   * @private
   */
  _rendArrowOrActivity(){
    if (this.state.refresStatus == RefreshStatus.refreshing){
        return (
          <ActivityIndicator style={{marginRight:10}}>
          </ActivityIndicator>
        )
    }else {
      return(
        <Animated.Image
          source={{uri:ArrowImage}}
          resizeMode={'contain'}
          style={[defaultHeaderStyles.arrow,
            {transform:[{
              rotateZ:this.state.arrowAngle.interpolate({
                inputRange:[0,1],
                outputRange:['0deg','-180deg']
              })
            }]
            }]}
        ></Animated.Image>
      )
    }
  }

  /**
   * 滑动中
   * @param event
   * @private
   */
  _onscroll(event){
    let y = event.nativeEvent.contentOffset.y
    this._offsetY = y
    if (this._dragFlag){
      let height = this.props.customRefreshView ? this.props.customRefreshViewHeight:70
      if (!this._isRefreshing){
        if (y <= -height){
          //松开以刷新
          this.setState({
            refresStatus:RefreshStatus.releaseToRefresh,
            refreshTitle:RefreshTitle.releaseToRefresh
          })
          Animated.timing(this.state.arrowAngle, {
            toValue: 1,
            duration: 50,
            easing: Easing.inOut(Easing.quad)
          }).start();
        }else {
          //下拉以刷新
          this.setState({
            refresStatus:RefreshStatus.pullToRefresh,
            refreshTitle:RefreshTitle.pullToRefresh
          })
          Animated.timing(this.state.arrowAngle, {
            toValue:0,
            duration: 100,
            easing: Easing.inOut(Easing.quad)
          }).start();
        }
      }

    }
    if(this.props.onScroll){
      this.props.onScroll(event)
    }

  }

  /**
   * 拖拽
   * @private
   */
  _onScrollEndDrag(event){
    this._dragFlag = false
    let y = event.nativeEvent.contentOffset.y
    this._offsetY = y
    let height = this.props.customRefreshView ? this.props.customRefreshViewHeight:70
    if (!this._isRefreshing){
      if (this.state.refresStatus == RefreshStatus.releaseToRefresh){
        this._isRefreshing=true
        this.setState({
          refresStatus:RefreshStatus.refreshing,
          refreshTitle:RefreshTitle.refreshing
        })
        this.refs.scrollView.scrollTo({x:0,y:-height,animated:true});
        if(this.props.onRefresh){
          this.props.onRefresh(()=>{
            this._onRefreshEnd()
          })
        }else {
          this._onRefreshEnd()
        }
      }
    }else {

      if (y <= 0) {
        this.refs.scrollView.scrollTo({x:0,y:-height,animated:true});
      }
    }
    if(this.props.onScrollEndDrag){
      this.props.onScrollEndDrag(event)
    }


  }
  _onScrollBeginDrag(event){
    this._dragFlag = true
    this._offsetY = event.nativeEvent.contentOffset.y
    if (this.props.onScrollBeginDrag){
      this.props.onScrollBeginDrag(event)
    }
  }

  /**
   * 刷新结束
   * @private
   */
  _onRefreshEnd(){
    this._isRefreshing = false
    let now = new Date().getTime();
    //下拉以刷新
    this.setState({
      refresStatus:RefreshStatus.pullToRefresh,
      refreshTitle:RefreshTitle.pullToRefresh,
      date:dateFormat(now,'yyyy-MM-dd hh:mm')
    })
    // 存一下刷新时间
    AsyncStorage.setItem(dateKey, now.toString());
    Animated.timing(this.state.arrowAngle, {
      toValue:0,
      duration: 100,
      easing: Easing.inOut(Easing.quad)
    }).start();
    this.refs.scrollView.scrollTo({x:0,y:0,animated:true});
  }

}

/**
 * 上拉加载更多的各状态  1 加载中 2 加载完毕 3 加载完毕 无更多数据
 * @type {loading: number, finish: number, noMoreData: number}}
 */
export const LoadMoreStatus={
  loading:1,
  finish:2,
  noMoreData:3
}

/**
 *===============================================SwRefreshListView=====================================
 */


export class SwRefreshListView extends ListView{
  _isLoading = false
  // 构造
  constructor(props) {
    super(props);
    // 初始状态
    this.state = {
      arrowAngle:new Animated.Value(0),
      refresStatus:RefreshStatus.pullToRefresh,
      refreshTitle:RefreshTitle.pullToRefresh,
      date:'暂无更新',
      loadStatus:LoadMoreStatus.finish
    };
  }

  static propTypes={
    //----------------上拉加载-----------------------------
    /**
     * 自定义底部部刷新指示组件的渲染方法,
     * 参数
     */
    customLoadMoreView:PropTypes.func,
    /**
     * 处于pushing（加载更多时）状态时执行的方法
     * 参数：end，最后执行完操作后应该调用end(isNoMoreData)。
     * isNoMoreData 表示当前是否已经加载完所有数据 已无更多数据
     */
    onLoadMore:PropTypes.func,
    /**
     * //默认样式中的上拉加载更多的提示语
     */
    pusuToLoadMoreTitle:PropTypes.string,
    /**
     * //默认样式中正在加载的提示语
     */
    loadingTitle:PropTypes.string,
    /**
     * //默认样式中已无更多时的提示语
     */
    noMoreDataTitle:PropTypes.string,
    /**
     * 是否显示底部的加载更多 通常用于全部数据不足一页 底部还显示加载更多导致的难看
     */
    isShowLoadMore:PropTypes.bool

  }

  static defaultProps={
    pusuToLoadMoreTitle:'上拉加载更多~~~~',
    loadingTitle:'加载中~~~',
    noMoreDataTitle:'已经加载到底啦（￣︶￣)~~',
    isShowLoadMore:true

  }


  render(){
    return(
      <ListView
        {...this.props}
        onEndReachedThreshold={0}
        onEndReached={(event)=>this._onEndReached(event)}
        renderFooter={
          ()=>this.props.isShowLoadMore?this._rendrFooter():null
        }
        renderScrollComponent={(props) => <SwRefreshScrollView {...props}/>}
      >
      </ListView>
    )
  }
  //-----------------------上拉加载部分-------------------------------
  /**
   * 渲染上拉加载组件
   * @returns {XML}
   * @private
   */
  _rendrFooter(){
    if (this.props.customLoadMoreView) {
      return this.props.customLoadMoreView(this.state.loadStatus)
    }

    if (this.state.loadStatus == LoadMoreStatus.noMoreData){
      return(
        <View style={footStyles.footer}>
          <Text style={footStyles.footerText}>{this.props.noMoreDataTitle}</Text>
        </View>
      )

    }else if(this.state.loadStatus == LoadMoreStatus.finish){
      return <View style={footStyles.footer}>
        <ActivityIndicator/>
        <Text style={footStyles.footerText}>{this.props.pusuToLoadMoreTitle}</Text>
      </View>
    }else if(this.state.loadStatus == LoadMoreStatus.loading){
      return(
        <View style={footStyles.footer}>
          <ActivityIndicator/>
          <Text style={footStyles.footerText}>{this.props.loadingTitle}</Text>
        </View>
      )

    }

  }

  /**
   * 上刷拉操作
   * @param event
   * @private
   */
  _onEndReached(event){
    if (this.state.loadStatus == LoadMoreStatus.noMoreData || this._isLoading || !this.props.isShowLoadMore){
      return
    }
    this._isLoading = true
    this.setState({
      loadStatus:1
    })
    this.timer = setTimeout(()=>{
      if (this.props.onLoadMore){
        this.props.onLoadMore((isNoMoreData)=>{
          this._isLoading = false
          this.setState({
            loadStatus:isNoMoreData ? LoadMoreStatus.noMoreData:LoadMoreStatus.finish
          })
        })
      }
    },500)

    if(this.props.onEndReached){
      this.props.onEndReached(event)
    }

  }

  /**
   * 重置已无更多数据的状态 通常用于下拉刷新数据完毕后 重置状态
   */
  resetStatus(){
      this.setState({
        loadStatus:LoadMoreStatus.finish
      })
  }

  componentDidUnMount() {
    this.timer && clearTimeout(this.timer);
  }


}





/**
 * 时间转换
 * @param dateTime
 * @param fmt
 * @returns {*|string}
 */
const dateFormat = function(dateTime, fmt) {
  var date = new Date(dateTime);
  fmt = fmt || 'yyyy-MM-dd';
  var o = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "h+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    "S": date.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

//-------------------------样式-------------------------------
/**
 * 默认头部
 */
const defaultHeaderStyles=StyleSheet.create({
  background:{
    alignItems:'center',
    position:'absolute',
    top:-69.5,
    left:0,
    right:0,
    height:70,
    justifyContent:'center',
  },
  status:{
    flexDirection:'row',
    alignItems:'center'
  },
  arrow:{
    width:14,
    height:23,
    marginRight:10
  },
  statusTitle:{
    fontSize:13,
    color:'#333333'
  },
  date:{
    fontSize:11,
    color:'#333333',
    marginTop:5
  }

})

const footStyles = StyleSheet.create({
  footer:{
    height:30,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  footerText:{
    fontSize:15,
    color:'#999999',
    marginLeft:10
  }

});

