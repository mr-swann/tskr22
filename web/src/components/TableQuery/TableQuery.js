import { Fragment, useRef } from 'react'
import {
  SimpleGrid,
  IconButton,
  Box,
  Input,
  Text,
  Button,
  Flex,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
/**
 * Loads query from state....
 * Allows you to pick from the fields (not necessarily hte columns presented)
 * Operators based on field types
 * values based on.... lookups.
 * TODO: Make this wokr
 */

const TableQuery = ({ setQuery, fuzzyQuery, setFuzzyQuery, rawQuery }) => {
  let searchInput = useRef('')
  let handleSearchButton = () => {
    console.log(`searching for ${searchInput.current.value}`)
    setFuzzyQuery(searchInput.current.value)
  }
  let handleSearchKeyDown = (event) => {
    //
    if (event.charCode === 13) {
      setFuzzyQuery(searchInput.current.value)
    }
  }

  return (
    <Fragment>
      <SimpleGrid columns={2} spacingX="40px" spacingY="20px">
        <Box padding="5px" bg="teal" height="160px">
          <Flex padding="10px">
            <Input
              color="black"
              bgColor="white"
              placeholder="Search id, name and email"
              ref={searchInput}
              padding="10px"
              defaultValue={fuzzyQuery}
              onKeyPress={handleSearchKeyDown}
            />
            <IconButton
              aria-label="Search database"
              onClick={handleSearchButton}
              icon={<SearchIcon />}
            />
          </Flex>
          <Flex padding="10px">
            <Text color="white">{rawQuery || 'All Users'}</Text>
            <Button
              onClick={() => {
                setQuery('')
                setFuzzyQuery('')
              }}
              colorScheme="red"
              variant="solid"
              type="button"
              size="xs"
            >
              Clear Query
            </Button>
          </Flex>
          <Text color="white">{fuzzyQuery.toString()}</Text>
        </Box>
        <Box padding="5px" height="80px"></Box>
      </SimpleGrid>
    </Fragment>
  )
}

export default TableQuery