# aya-draglayout

这个是自己调研的一个比较糙的Demo, 里面有些垃圾代码，有点乱 

主要有两个核心点：
  1. 支持拖拽
     -  无意间发现了GitHub的一个js库：https://github.com/SortableJS/Sortable
     -  这是它的Vue版本： https://github.com/SortableJS/Vue.Draggable
  2. 用了Vue的动态组件 `<component is='component_name'>`

余下的就是一些糙的code逻辑：
  1. 准备几个Vue的组件，用`.js`文件把这些组件`export`出去，
  2. Vue的支持的动态组件，利用`:is`来绑定被拖拽的组件名字
  3. 利用Vue.Draggel的事件，来完成组件数据记录
  4. 准备好 数据结构 + 页面布局，就ok了，

目前demo欠缺的是：
  1. 都需要手动把Vue挂件import，没能自动


Demo演示地址：https://ronliruonan.github.io/aya-draglayout/

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Run your end-to-end tests
```
npm run test:e2e
```
