import { useQuery } from "@blitzjs/rpc"
import {
  Button,
  Code,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  toast,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react"
import { PageTitle } from "app/components/PageTitle"
import { Shell } from "app/layout/Shell"
import getDataset from "app/datasets/queries/getDataset"
import NextLink from "next/link"
import { useRouter } from "next/router"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import python from "react-syntax-highlighter/dist/cjs/languages/hljs/python"
import docco from "react-syntax-highlighter/dist/cjs/styles/hljs/docco"
import { useState } from "react"
import { BellIcon } from "@chakra-ui/icons"

SyntaxHighlighter.registerLanguage("python", python)

function getServerUrl() {
  let serverUrl = location.host
  if (location.protocol !== "https:") {
    serverUrl = location.protocol + "//" + serverUrl
  }
  return serverUrl
}

export default function Dataset() {
  const router = useRouter()
  const { query } = router
  const [dataset] = useQuery(getDataset, {
    organisation: query.organisation as string,
    slug: query.dataset as string,
  })
  const toast = useToast()

  const codeString = `
import datafox

datafox.connect(server="${getServerUrl()}", api_key="${dataset.token}")
`.trim()

  const addNotificationModal = useDisclosure()

  const [addNotificationType, setAddNotificationType] = useState<"email" | "slack" | "teams">(
    "email"
  )

  return (
    <Shell
      breadcrumbs={[
        {
          label: dataset.organisation.name,
          href: `/${dataset.organisation.slug}`,
        },
        {
          label: dataset.slug,
          href: `/${dataset.organisation.slug}/${dataset.slug}`,
        },
      ]}
    >
      <PageTitle title="dataset" name={dataset.slug} />

      <Text pb={2}>
        Token: <Code userSelect="all">{dataset.token}</Code>
      </Text>

      <Text pb={2}>To connect to this dataset, place the following line in your script:</Text>

      <SyntaxHighlighter language="python" style={docco}>
        {codeString}
      </SyntaxHighlighter>

      <Button mt={4} size="sm" leftIcon={<BellIcon />} onClick={addNotificationModal.onOpen}>
        set up notifications
      </Button>

      <Heading size="md" pt={4} pb={2}>
        Runs
      </Heading>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {dataset.testRuns.map((run) => (
              <Tr
                onClick={() =>
                  router.push(`/${query.organisation}/${query.project}/runs/${run.id}`)
                }
              >
                <Td>
                  <time dateTime={run.date.toISOString()}>{run.date.toISOString()}</time>
                </Td>
                <Td isNumeric>
                  <NextLink href={`/${query.organisation}/${query.project}/runs/${run.id}`}>
                    <Link>&rsaquo;</Link>
                  </NextLink>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Drawer isOpen={addNotificationModal.isOpen} onClose={addNotificationModal.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Add Notifications</DrawerHeader>

          <DrawerBody>
            <FormControl>
              <FormLabel>
                Method
                <Select onChange={(evt) => setAddNotificationType(evt.target.value as any)}>
                  <option value="email">E-Mail</option>
                  <option value="slack">Slack</option>
                  <option value="teams">Teams</option>
                </Select>
              </FormLabel>
            </FormControl>

            {addNotificationType === "email" ? (
              <FormControl>
                <FormLabel>
                  E-Mail
                  <Input type="email" required />
                </FormLabel>
              </FormControl>
            ) : (
              <Text>🚧 Under Construction 🚧</Text>
            )}
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={addNotificationModal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                toast({
                  title: "Not Implemented yet",
                })
              }}
            >
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Shell>
  )
}
