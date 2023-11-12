import { useState } from "react"

const Books = ({ result }) => {
    const [filter, setFilter] = useState(null)

    if (result.loading) {
        return <div>loading...</div>
    }

    const books = result.data?.allBooks

    const filteredBooks = !filter
        ? books
        : books.filter((b) => b.genres.includes(filter))

    let genres = books.flatMap((b) => b.genres)
    genres = [...new Set(genres)]

    return (
        <div>
            <h2>books</h2>
            {filter && <p>in genre {filter}</p>}

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
                <button key={g} onClick={() => setFilter(g)}>
                    {g}
                </button>
            ))}
            <button onClick={() => setFilter(null)}>all genres</button>
        </div>
    )
}

export default Books
