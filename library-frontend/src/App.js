import { useEffect, useState } from "react"
import { useApolloClient, useQuery } from "@apollo/client"
import { Routes, Route, useNavigate } from "react-router-dom"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import Login from "./components/Login"
import Recommend from "./components/Recommend"
import { ALL_BOOKS, USER } from "./queries"

const App = () => {
    const client = useApolloClient()
    const navigate = useNavigate()
    const [token, setToken] = useState(null)
    const result = useQuery(ALL_BOOKS)
    const userResult = useQuery(USER)

    useEffect(() => {
        const storageToken = localStorage.getItem("library-user-token")

        setToken(storageToken)
    }, [])

    const handleLogout = () => {
        setToken(null)
        localStorage.clear()
        client.resetStore()
    }

    if (result.loading || userResult.loading) {
        return <div>loading...</div>
    }

    const favoriteGenre = userResult.data.me.favoriteGenre
    const recommendBooks = result.data.allBooks.filter((b) =>
        b.genres.includes(favoriteGenre)
    )
    console.log("🚀 ~ file: App.js:37 ~ App ~ recommendBooks:", recommendBooks)

    return (
        <div>
            <div style={{ marginBottom: "10px" }}>
                <button onClick={() => navigate("")}>authors</button>
                <button onClick={() => navigate("books")}>books</button>
                {token && (
                    <>
                        <button onClick={() => navigate("add")}>
                            add book
                        </button>
                        <button onClick={() => navigate("recommend")}>
                            recommend
                        </button>
                    </>
                )}
                {!token ? (
                    <button onClick={() => navigate("login")}>login</button>
                ) : (
                    <button onClick={handleLogout}>logout</button>
                )}
            </div>

            <Routes>
                <Route index element={<Authors />} />
                <Route path="books" element={<Books result={result} />} />
                <Route path="add" element={<NewBook />} />
                <Route
                    path="login"
                    element={<Login setToken={setToken} token={token} />}
                />
                <Route
                    path="recommend"
                    element={
                        <Recommend
                            books={recommendBooks}
                            genre={favoriteGenre}
                        />
                    }
                />
            </Routes>
        </div>
    )
}

export default App
