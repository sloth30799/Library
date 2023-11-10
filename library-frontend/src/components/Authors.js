import { useMutation, useQuery } from '@apollo/client'
import { ALL_AUTHORS, SET_BIRTHYEAR } from '../queries'

const Authors = () => {
    const result = useQuery(ALL_AUTHORS)
    const [setAuthorBYear] = useMutation(SET_BIRTHYEAR, {
        refetchQueries: [{ query: ALL_AUTHORS }],
    })

    if (result.loading) {
        return <div>loading...</div>
    }

    const authors = result.data.allAuthors

    const setBirthYear = (e) => {
        e.preventDefault()

        const name = e.target.name.value
        const year = Number(e.target.year.value)

        setAuthorBYear({ variables: { name, setBornTo: year } })
    }

    return (
        <div>
            <h2>authors</h2>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>born</th>
                        <th>books</th>
                    </tr>
                    {authors.map((a) => (
                        <tr key={a.name}>
                            <td>{a.name}</td>
                            <td>{a.born}</td>
                            <td>{a.bookCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <form onSubmit={setBirthYear}>
                <h2>Set birth year</h2>
                <div>
                    <select name="name" defaultValue={authors[0].name}>
                        {authors.map((a, i) => (
                            <option key={i} value={a.name}>
                                {a.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    year
                    <input type="text" name="year" />
                </div>
                <button>update author</button>
            </form>
        </div>
    )
}

export default Authors
