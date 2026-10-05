import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from './context/Store'
import { AuthProvider } from './context/Auth'
import './services/productService'
import App from './App'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(<BrowserRouter><StoreProvider><AuthProvider><App/></AuthProvider></StoreProvider></BrowserRouter>)
