import { routes, useLocation } from '@redwoodjs/router'
import { Fragment, useState } from 'react'
import {
  SimpleGrid,
  Flex,
  Table,
  TableCaption,
  Heading,
} from '@chakra-ui/react'
import TableColumns from 'src/components/TableColumns'
import TableQuery from 'src/components/TableQuery'
import TablePagination from 'src/components/TablePagination'
import TableRows from 'src/components/TableRows/TableRows'
import { DELETE_MESSAGE_MUTATION } from 'src/components/Message/EditMessageCell'

export const beforeQuery = (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { search } = useLocation()
  let params = new URLSearchParams(search)
  return {
    variables: {
      q: params.get('q'),
      filter: params.get('filter') || props.fuzzyQuery,
      skip: params.get('skip') || props.skip || 0,
      take: params.get('take') || props.take || 10,
      orderBy: params.get('orderBy') || props.orderBy,
    },

    fetchPolicy: 'no-cache',
  }
}

export const QUERY = gql`
  query FindMessages(
    $filter: String
    $skip: Int
    $take: Int
    $q: String
    $orderBy: OrderByInput
  ) {
    messages(
      filter: $filter
      skip: $skip
      take: $take
      q: $q
      orderBy: $orderBy
    ) {
      count
      take
      skip
      q
      results {
        id
        createdAt
        updatedAt
        language
        entity
        value
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error.message}</div>
)

export const Success = ({
  messages,
  fuzzyQuery,
  setFuzzyQuery,
  query,
  setQuery,
  columns,
  initialColumns,
  setColumns,
  orderBy,
  setOrderBy,
  skip,
  setSkip,
  take,
  setTake,
  displayColumn,
  roles,
}) => {
  let [data, setData] = useState(messages)
  return (
    <Fragment>
      <Heading>Messages ({data.count})</Heading>
      {/*<Text>orderBy: {JSON.stringify(orderBy).toString()}</Text>
      <Text>query: {JSON.stringify(query).toString()}</Text>
      <Text>fuzzyQuery: {JSON.stringify(fuzzyQuery).toString()}</Text>
      <Text>take: {JSON.stringify(take).toString()}</Text>
      <Text>skip: {JSON.stringify(skip).toString()}</Text>*/}
      <TableQuery
        query={query}
        setQuery={setQuery}
        fuzzyQuery={fuzzyQuery}
        setFuzzyQuery={setFuzzyQuery}
        rawQuery={messages.q}
        inputPlaceholder="Search"
        link={(query) => {
          return routes.messages({ q: query })
        }}
        setSkip={setSkip}
      />

      <Table variant="striped" colorScheme={'green'} size="xs">
        <TableCaption>List of Messages</TableCaption>

        <TableColumns
          columns={columns}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          setColumns={setColumns}
          initialColumns={initialColumns}
          setTake={setTake}
        />

        <TableRows
          columns={columns}
          roles={roles}
          setData={setData}
          data={data}
          model="messages"
          deleteMutation={DELETE_MESSAGE_MUTATION}
          displayColumn={displayColumn}
        />
      </Table>
      <SimpleGrid columns={2} spacingX="40px" spacingY="20px">
        <Flex padding="10px"></Flex>
        <Flex padding="10px">
          <TablePagination skip={skip} setSkip={setSkip} take={take} />
        </Flex>
      </SimpleGrid>
    </Fragment>
  )
}
