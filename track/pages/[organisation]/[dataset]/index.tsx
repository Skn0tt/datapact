import { useMutation, useQuery } from "@blitzjs/rpc"
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
  IconButton,
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
  Tr,
  useDisclosure,
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
import { BellIcon, DeleteIcon } from "@chakra-ui/icons"
import { isFinalised } from "app/testruns"
import updateNotificationMailMutation from "app/datasets/mutations/updateNotificationMail"
import removeNotificationMailMutation from "app/datasets/mutations/removeNotificationMail"

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
  const [dataset, datasetMeta] = useQuery(getDataset, {
    organisation: query.organisation as string,
    slug: query.dataset as string,
  })
  const [udpateNotificationMail, udpateNotificationMailMeta] = useMutation(
    updateNotificationMailMutation
  )
  const [removeNotificationMail, removeNotificationMailMeta] = useMutation(
    removeNotificationMailMutation
  )

  const codeString = `
import datapact

dp = datapact.test(df)
dp.connect(
  server="${getServerUrl()}",
  token="${dataset.token}"
)
`.trim()

  const addNotificationModal = useDisclosure()

  const [addNotificationType, setAddNotificationType] = useState<
    "email" | "slack" | "teams" | "pagerduty"
  >("email")

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

      <Text pb={2}>
        To connect to this dataset, call <Code>.connect</Code> in your script:
      </Text>

      <Code display="block" mb={4}>
        <SyntaxHighlighter language="python" style={docco}>
          {codeString}
        </SyntaxHighlighter>
      </Code>

      {dataset.notificationMail ? (
        <Text>
          Notifications are sent to <Code>{dataset.notificationMail}</Code>
          <IconButton
            aria-label="remove email notifications"
            size="xs"
            isLoading={removeNotificationMailMeta.isLoading}
            onClick={async () => {
              await removeNotificationMail({ datasetId: dataset.id })
              await datasetMeta.refetch()
            }}
          >
            <DeleteIcon />
          </IconButton>
          .
        </Text>
      ) : (
        <Button size="sm" leftIcon={<BellIcon />} onClick={addNotificationModal.onOpen}>
          set up notifications
        </Button>
      )}

      <Heading size="md" pt={4} pb={2}>
        Runs
      </Heading>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Finalised</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {dataset.testRuns.map((run) => (
              <Tr
                key={run.id}
                onClick={() =>
                  router.push(`/${query.organisation}/${query.dataset}/runs/${run.id}`)
                }
              >
                <Td>
                  <time dateTime={run.date.toISOString()}>{run.date.toISOString()}</time>
                </Td>
                <Td>{isFinalised(run) ? "Yes" : "No"}</Td>
                <Td isNumeric>
                  <NextLink href={`/${query.organisation}/${query.dataset}/runs/${run.id}`}>
                    <Link>&rsaquo;</Link>
                  </NextLink>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Drawer size="lg" isOpen={addNotificationModal.isOpen} onClose={addNotificationModal.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Add Notifications</DrawerHeader>

          <DrawerBody>
            <form
              id="notificationForm"
              onSubmit={async (evt) => {
                evt.preventDefault()

                const form = new FormData(evt.target as any)

                const email = form.get("email") as string
                await udpateNotificationMail({
                  datasetId: dataset.id,
                  email,
                })
                addNotificationModal.onClose()
                await datasetMeta.refetch()
              }}
            >
              <FormControl>
                <FormLabel>
                  Method
                  <Select
                    value={addNotificationType}
                    onChange={(evt) => setAddNotificationType(evt.target.value as any)}
                  >
                    <option value="email">E-Mail</option>
                    <option value="slack">Slack</option>
                    <option value="teams">Teams</option>
                    <option value="pagerduty">PagerDuty</option>
                  </Select>
                </FormLabel>
              </FormControl>

              {addNotificationType === "email" && (
                <FormControl>
                  <FormLabel>
                    E-Mail
                    <Input type="email" name="email" required placeholder="data@company.com" />
                  </FormLabel>
                </FormControl>
              )}
              {addNotificationType === "teams" && (
                <Text>
                  Follow{" "}
                  <Link
                    color="blue.400"
                    isExternal
                    href="https://support.microsoft.com/en-us/office/send-an-email-to-a-channel-in-teams-d91db004-d9d7-4a47-82e6-fb1b16dfd51e"
                  >
                    this guide
                  </Link>{" "}
                  to get a channel-specific email, and use the email integration.
                </Text>
              )}
              {addNotificationType === "slack" && (
                <Text>
                  Follow{" "}
                  <Link
                    color="blue.400"
                    isExternal
                    href="https://slack.com/help/articles/206819278-Send-emails-to-Slack"
                  >
                    this guide
                  </Link>{" "}
                  to get a channel-specific email, and use the email integration.
                </Text>
              )}
              {addNotificationType === "pagerduty" && (
                <Text>
                  Follow{" "}
                  <Link
                    color="blue.400"
                    isExternal
                    href="https://support.pagerduty.com/docs/email-integration-guide"
                  >
                    this guide
                  </Link>{" "}
                  to get a PagerDuty-owned email, and use the email integration.
                  <Code></Code>
                </Text>
              )}
            </form>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={addNotificationModal.onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              form="notificationForm"
              loadingText="Saving ..."
              isLoading={udpateNotificationMailMeta.isLoading}
            >
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Shell>
  )
}
