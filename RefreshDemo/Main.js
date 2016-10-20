/**
 * Created by sww on 2016/10/20.
 */
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ListView
} from 'react-native';
import {
  SwRefreshScrollView,
  SwRefreshListView,
  RefreshStatus,
  LoadMoreStatus
} from 'react-native-swRefresh'
const {width,height}=Dimensions.get('window')
export default class Main extends Component{
    _page=0
    _dataSource = new ListView.DataSource({rowHasChanged:(row1,row2)=>row1 !== row2})
  // 构造
    constructor(props) {

      super(props);


      // 初始状态
      this.state = {
        dataSource:this._dataSource.cloneWithRows([0,1,2,3,4,5,6,7,8,9,0])
      };
    }

  render(){

    // return this._renderScrollView() //ScrollView Demo ScrollView不支持上拉加载

    return this._renderListView() // ListView Demo
  }


  /**
   * scrollVewDemo
   * @returns {XML}
   */
  _renderScrollView(){

    return(
      <SwRefreshScrollView
        onRefresh={this._onRefresh.bind(this)}
        //其他你需要设定的属性(包括ScrollView的属性)
      >
        <View style={styles.content}>
          <Text>下拉刷新ScrollView</Text>
        </View>
      </SwRefreshScrollView>
    )

  }

  /**
   * ListViewDemo
   * @returns {XML}
   * @private
   */
  _renderListView(){
    return(
      <SwRefreshListView
        dataSource={this.state.dataSource}
        ref="listView"
        renderRow={this._renderRow.bind(this)}
        onRefresh={this._onListRefersh.bind(this)}
        onLoadMore={this._onLoadMore.bind(this)}
        //isShowLoadMore={false}
        customRefreshView={(refresStatus,offsetY)=>{
            return (<Text>{'状态:'+refresStatus+','+offsetY}</Text>)
        }}
      />
    )

    }
  _renderRow(rowData) {
    return (
      <View style={styles.cell}>
        <Text>{'这是第'+rowData+'行'}</Text>
      </View>)

  }

  /**
   * 模拟刷新
   * @param end
   * @private
   */
  _onRefresh(end){
   let timer =  setTimeout(()=>{
     clearTimeout(timer)
      alert('刷新成功')

     end()//刷新成功后需要调用end结束刷新

    },1500)

  }

  /**
   * 模拟刷新
   * @param end
   * @private
   */
  _onListRefersh(end){
    let timer =  setTimeout(()=>{
      clearTimeout(timer)
      this._page=0
      let data = []
      for (let i = 0;i<10;i++){
        data.push(i)
      }
      this.setState({
        dataSource:this._dataSource.cloneWithRows(data)
      })
      this.refs.listView.resetStatus() //重置上拉加载的状态
      end()//刷新成功后需要调用end结束刷新

    },1500)
  }

  /**
   * 模拟加载更多
   * @param end
   * @private
   */
  _onLoadMore(end){
    let timer =  setTimeout(()=>{
      clearTimeout(timer)
      this._page++
      let data = []
      for (let i = 0;i<(this._page+1)*10;i++){
        data.push(i)
      }
      this.setState({
        dataSource:this._dataSource.cloneWithRows(data)
      })
      end(this._page > 2)//加载成功后需要调用end结束刷新 假设加载4页后数据全部加载完毕

    },2000)
  }

}
const styles=StyleSheet.create({
  container:{

  },
  content:{
    width:width,
    height:height,
    backgroundColor:'yellow',
    justifyContent:'center',
    alignItems:'center'
  },
  cell:{
    height:100,
    backgroundColor:'purple',
    alignItems:'center',
    justifyContent:'center',
    borderBottomColor:'#ececec',
    borderBottomWidth:1

  }

})
