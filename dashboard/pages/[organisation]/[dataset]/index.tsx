import { invoke, useQuery } from "@blitzjs/rpc"
import {
  Code,
  FormControl,
  FormLabel,
  Heading,
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
} from "@chakra-ui/react"
import { PageTitle } from "app/components/PageTitle"
import { Shell } from "app/layout/Shell"
import getDataset from "app/datasets/queries/getDataset"
import NextLink from "next/link"
import { useRouter } from "next/router"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import python from "react-syntax-highlighter/dist/cjs/languages/hljs/python"
import docco from "react-syntax-highlighter/dist/cjs/styles/hljs/docco"
import getMembers from "app/organisations/queries/getMembers"
import { canUpdateOwner } from "app/datasets/permissions"
import { useSession } from "@blitzjs/auth"
import updateOwner from "app/datasets/mutations/updateOwner"

SyntaxHighlighter.registerLanguage("python", python)

export default function Dataset() {
  const router = useRouter()
  const { query } = router
  const [dataset, datasetMeta] = useQuery(getDataset, {
    organisation: query.organisation as string,
    slug: query.dataset as string,
  })

  let serverUrl = location.host
  if (location.protocol !== "https:") {
    serverUrl = location.protocol + "//" + serverUrl
  }
  const codeString = `
import datafox

datafox.connect(server="${serverUrl}", api_key="${dataset.token}")
`.trim()

  const [members] = useQuery(getMembers, dataset.organisation.slug)

  const session = useSession()

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

      {canUpdateOwner(session, dataset) ? (
        <FormControl>
          <FormLabel>
            Owner
            <Select
              value={dataset.ownerId}
              onChange={async (evt) => {
                const newId = Number.parseInt(evt.target.value)
                await invoke(updateOwner, {
                  datasetId: dataset.id,
                  userId: newId,
                })
                await datasetMeta.refetch()
              }}
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </FormLabel>
        </FormControl>
      ) : (
        <Text pb={2}>
          Owned by <b>{dataset.owner.name}</b>.
        </Text>
      )}

      <Text pb={2}>
        Token: <Code userSelect="all">{dataset.token}</Code>
      </Text>

      <Text pb={2}>To connect to this dataset, place the following line in your script:</Text>

      <SyntaxHighlighter language="python" style={docco}>
        {codeString}
      </SyntaxHighlighter>

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
    </Shell>
  )
}
