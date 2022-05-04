import { useQuery } from "@blitzjs/rpc"
import {
  Code,
  Heading,
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
import Link from "next/link"
import { useRouter } from "next/router"
import { Light as SyntaxHighlighter } from "react-syntax-highlighter"
import python from "react-syntax-highlighter/dist/cjs/languages/hljs/python"
import docco from "react-syntax-highlighter/dist/cjs/styles/hljs/docco"

SyntaxHighlighter.registerLanguage("python", python)

export default function Dataset() {
  const router = useRouter()
  const { query } = router
  const [dataset] = useQuery(getDataset, {
    organisation: query.organisation as string,
    slug: query.dataset as string,
  })
  const codeString = `
import datafox

datafox.connect(api=, token="${dataset.token}")
`.trim()

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
        Owned by <b>{dataset.owner.name}</b>.
      </Text>

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
              <Th>Result</Th>
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
                  <time dateTime={run.createdAt.toISOString()}>{run.createdAt.toISOString()}</time>
                </Td>
                <Td>{run.result ? "✅" : "❌"}</Td>
                <Td isNumeric>
                  <Link href={`/${query.organisation}/${query.project}/runs/${run.id}`}>
                    <a>&rsaquo;</a>
                  </Link>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Shell>
  )
}
