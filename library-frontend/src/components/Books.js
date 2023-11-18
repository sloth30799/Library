import { useState } from "react"
import { ALL_BOOKS_WITH_GENRE } from "../queries"
import { useQuery } from "@apollo/client"

const Books = ({ result }) => {
    const [genre, setGenre] = useState(null)
    const resultWithGenre = useQuery(ALL_BOOKS_WITH_GENRE, {
        variables: { genre },
    })

    if (result.loading || resultWithGenre.loading) {
        return <div>loading...</div>
    }

    const books = result.data?.allBooks
    const filteredBooks = resultWithGenre.data?.allBooks

    let genres = books.flatMap((b) => b.genres)
    genres = [...new Set(genres)]

    return (
        <div>
            <h2>books</h2>
            {genre && <p>in genre {genre}</p>}

            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {filteredBooks.map((a) => (
                        <tr key={a.title}>
                            <td>{a.title}</td>
                            <td>{a.author.name}</td>
                            <td>{a.published}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {genres.map((g) => (
                <button key={g} onClick={() => setGenre(g)}>
                    {g}
                </button>
            ))}
            <button onClick={() => setGenre(null)}>all genres</button>
        </div>
    )
}

export default Books
