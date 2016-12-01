# react-native-swRefresh
--
##react-native-swRefresh是提供react-native下拉刷新和下拉加载组件，简单好用，支持自定义,支持iOS，Android 。
###提供SwRefreshScrollView和SwRefreshListView两种支持下拉刷新的组件，SwRefreshListView支持上拉加载更多。 实现方式不一样 所以Android体验可能稍微有点不同。
####因为刚接触，改着改着就有点冗余，代码不是很优美，会慢慢优化的.
--
##介绍:[简书上有更详细的介绍](http://www.jianshu.com/p/cb029455f9cd)
	
	
**1. SwRefreshScrollView**

兼容ScrollView的属性

* props:
	
```javascript     
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
customRefreshViewHeight:PropTypes.number
```
 * func:
 
```javascript 	
/**
* 手动调用刷新
*/
beginRefresh()
  
/**
* 手动结束 推荐end()回调
*/
endRefresh()

```	
      
 **2. SwRefreshListView**     
 
 兼容ListView, SwRefreshScrollView属性 新增endLoadMore方法
 
 * props:
 
```javascript  			
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
```
	    
 * func:
 
```javascript 	
/**
* 重置已无更多数据的状态 通常用于下拉刷新数据完毕后 重置状态
*/
resetStatus()
/**
* 直接将状态置为没有更多数据状态 通常用于第一次刷新加载的后数据已全部加载 不必下拉刷新
* 也可使用 isShowLoadMore:PropTypes.bool将上拉加载组件隐藏
*/
setNoMoreData()

/**
* 手动调用刷新
*/
beginRefresh()
  
/**
* 手动结束 推荐end()回调
*/
endRefresh()
/*
 * 手动结束加载
 * isNoMoreData 表示当前是否已经加载完所有数据 已无更多数据
 * */
 endLoadMore(isNoMoreData)
```		  	
		  	
 	   
##使用:
	npm install react-native-swRefresh --save    
* 导入

```javascript			
//根据需要引入
import {
  SwRefreshScrollView,
  SwRefreshListView,
  RefreshStatus, //刷新状态 用于自定义
  LoadMoreStatus //上拉加载状态 用于自定义
} from 'react-native-swRefresh'
```
		
*  **Demo**: SwRefreshScrollView
  
```javascript		
	<SwRefreshScrollView
		onRefresh={this._onRefresh.bind(this)}
		//其他你需要设定的属性(包括ScrollView的属性)
	>
		<View style={styles.content}>
			<Text>下拉刷新ScrollView</Text>
		</View>
	</SwRefreshScrollView>
	-------------------------------------------------------------------------------
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
```		
		
	
*  **Demo**: SwRefreshListView
	
```javascript		
 <SwRefreshListView
    dataSource={this.state.dataSource}
    ref="listView"
    renderRow={this._renderRow.bind(this)}
    onRefresh={this._onListRefersh.bind(this)}
    onLoadMore={this._onLoadMore.bind(this)}
   //其他需要设置的ListView属性
/>
 -------------------------------------------------------------------------------
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
	// this.refs.listView.endRefresh() //新增方法 结束刷新 建议使用end() 。当然这个可以在任何地方使用
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
  
 componentDidMount() {
   let timer = setTimeout(()=>{
     clearTimeout(timer)
      this.refs.listView.beginRefresh()
    },500) //自动调用开始刷新 新增方法
  }
```		  
		  
		  
###具体查看Demo
###演示

![image](https://github.com/shiwenwen/react-native-swRefresh/blob/master/screenshot/refresh1.gif?raw=true)

----

![image](https://github.com/shiwenwen/react-native-swRefresh/blob/master/screenshot/refresh2.gif?raw=true)

----

![image](https://github.com/shiwenwen/react-native-swRefresh/blob/master/screenshot/refresh3.gif?raw=true)

-----

![image](https://github.com/shiwenwen/react-native-swRefresh/blob/master/screenshot/refresh4.gif?raw=true)
