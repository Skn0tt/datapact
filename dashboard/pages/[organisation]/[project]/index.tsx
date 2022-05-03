import { useQuery } from "@blitzjs/rpc"
import {
  Box,
  Code,
  Heading,
  Stack,
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
import getProject from "app/projects/queries/getProject"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Project() {
  const router = useRouter()
  const { query } = router
  const [project] = useQuery(getProject, {
    organisation: query.organisation as string,
    slug: query.project as string,
  })

  return (
    <Shell
      breadcrumbs={[
        {
          label: project.organisation.name,
          href: `/${project.organisation.slug}`,
        },
        {
          label: project.slug,
          href: `/${project.organisation.slug}/${project.slug}`,
        },
      ]}
    >
      <PageTitle title="project" name={project.slug} />
      <Text>
        Owned by <b>{project.owner.name}</b>.
      </Text>

      <Text>
        Token: <Code userSelect="all">{project.token}</Code>
      </Text>

      <Heading size="md" pt={4} pb={2}>
        Runs
      </Heading>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Result</Th>
              <Th>multiply by</Th>
            </Tr>
          </Thead>
          <Tbody>
            {project.testRuns.map((run) => (
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
