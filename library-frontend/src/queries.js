import { gql } from "@apollo/client"

export const ALL_AUTHORS = gql`
    query {
        allAuthors {
            name
            born
            bookCount
        }
    }
`
export const ALL_BOOKS = gql`
    query {
        allBooks {
            author {
                name
            }
            title
            id
            published
            genres
        }
    }
`

export const ALL_BOOKS_WITH_GENRE = gql`
    query ($genre: String) {
        allBooks(genre: $genre) {
            author {
                name
            }
            title
            id
            published
            genres
        }
    }
`

export const ADD_BOOK = gql`
    mutation (
        $title: String!
        $author: String!
        $published: Int!
        $genres: [String!]!
    ) {
        addBook(
            title: $title
            author: $author
            published: $published
            genres: $genres
        ) {
            title
            published
        }
    }
`

export const SET_BIRTHYEAR = gql`
    mutation ($name: String!, $setBornTo: Int!) {
        editAuthor(name: $name, setBornTo: $setBornTo) {
            name
        }
    }
`

export const LOGIN = gql`
    mutation login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    }
`

export const USER = gql`
    query {
        me {
            favoriteGenre
            username
        }
    }
`

export const BOOK_ADDED = gql`
    subscription {
        bookAdded {
            title
            published
            id
            genres
            author {
                name
            }
        }
    }
`
