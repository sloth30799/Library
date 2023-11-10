import { Routes, Route, useNavigate } from 'react-router-dom'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

const App = () => {
    const navigate = useNavigate()

    return (
        <div>
            <div style={{marginBottom: '10px'}}>
                <button onClick={() => navigate('')}>authors</button>
                <button onClick={() => navigate('books')}>books</button>
                <button onClick={() => navigate('add')}>add book</button>
            </div>

            <Routes>
                <Route index element={<Authors />} />
                <Route path="books" element={<Books />} />
                <Route path="add" element={<NewBook />} />
            </Routes>
        </div>
    )
}

export default App
