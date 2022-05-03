import { useQuery } from "@blitzjs/rpc"
import { Heading, Link, ListItem, Stack, Text, UnorderedList } from "@chakra-ui/react"
import { PageTitle } from "app/components/PageTitle"
import { Shell } from "app/layout/Shell"
import getOrganisation from "app/organisations/queries/getOrganisation"
import NextLink from "next/link"
import { useRouter } from "next/router"

export default function OrganisationPage() {
  const {
    query: { organisation },
  } = useRouter()

  const [org] = useQuery(getOrganisation, organisation as string)

  return (
    <Shell
      breadcrumbs={[
        {
          label: org.name,
          href: `/${org.slug}`,
        },
      ]}
    >
      <PageTitle title="organisation" name={org.name} />

      <Text>
        Owned by <b>{org.owner.name}</b>.
      </Text>

      <Heading size="md" pt={4} pb={2}>
        Projects
      </Heading>
      <UnorderedList>
        {org.projects.map((project) => (
          <ListItem key={project.id}>
            <NextLink href={`/${organisation}/${project.slug}`}>
              <Link>{project.slug}</Link>
            </NextLink>{" "}
            (owned by <b>{project.owner.name}</b>)
          </ListItem>
        ))}
      </UnorderedList>
    </Shell>
  )
}
