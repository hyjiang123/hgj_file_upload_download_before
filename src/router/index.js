import Vue from 'vue'
import Router from 'vue-router'
import BigFileUpload from '../components/BigFileUpload'
import SingleFileUpload from '../components/SingleFileUpload'
import MultiFileUpload from  '../components/MultiFileUpload'

Vue.use(Router)

export default new Router({
  routes: [
    {path:'/singleFileUpload',component:SingleFileUpload,name:'singleFileUpload'},
    {path:'/bigFileUpload',component:BigFileUpload,name:'bigFileUpload'},
    {path:'/multiFileUpload',component:MultiFileUpload,name:'multiFileUpload'},
    {path:'/',component:SingleFileUpload,name:'singleFileUpload'}
  ]
})
