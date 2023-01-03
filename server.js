const express = require('express');
const expressGraphQl = require('express-graphql').graphqlHTTP;
const { 
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require('graphql');
const app = express();

const authors = [
  { id: 1, name: 'J.R.R. Tolkien' },
  { id: 2, name: 'J.K. Rowling' },
  { id: 3, name: 'Brent Weeks' }
];

const books = [
  { id: 1, name: 'The Fellowship of the Ring', authorId: 1 },
  { id: 2, name: 'The Two Towers', authorId: 1 },
  { id: 3, name: 'The Return of the King', authorId: 1 },
  { id: 4, name: 'Harry Potter 1', authorId: 2 },
  { id: 5, name: 'Harry Potter 2', authorId: 2 },
  { id: 6, name: 'Harry Potter 3', authorId: 2 },
  { id: 7, name: 'The Silmarillion', authorId: 3 },
  { id: 8, name: 'The Way of Shadows', authorId: 3 },
];

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'This represents an author of a book',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    books: {
      type: GraphQLList(BookType),
      resolve: (author) => {
        return books.filter(book => book.authorId === author.id);
      }
    }
  })
});

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: 'This represents a book written by an author',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLNonNull(GraphQLInt) },
    author: { 
      type: AuthorType,
      resolve: (book) => {
        return authors.find(author => author.id === book.authorId);
      }
    }
  })
});

const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
    addBook: {
      type: BookType,
      args: {
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        const book = {
          id: books.length + 1,
          name: args.name,
          authorId: args.authorId
        };
        books.push(book);
        return book;
      }
    },
    addAuthor: {
      type: AuthorType,
      description: 'Add an author',
      args: {
        name: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve: (parent, args) => {
        const author = {
          id: authors.length + 1,
          name: args.name
        };
        authors.push(author);
        return author;
      }
    }
  })
});

const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: () => ({
    book: {
      type: BookType,
      description: 'A single book',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parents, args) => books.find(book => book.id === args.id)
    },
    books: {
      type: new GraphQLList(BookType),
      description: 'List of all books',
      resolve: () => books
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of all authors',
      resolve: () => authors
    },
    author: {
      type: AuthorType,
      description: 'A single author',
      args: {
        id: { type: GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parents, args) => authors.find(author => author.id === args.id)
    }
  })
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType
})

app.use('/graphql', expressGraphQl({
  schema,
  graphiql: true,
}));
app.listen(process.env.PORT || 3001, () => {
  console.log('Server is running on port 3000');
});
