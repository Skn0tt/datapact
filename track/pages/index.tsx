import React from "react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getOrganisations from "app/organisations/queries/getOrganisations"
import { Shell } from "app/layout/Shell"
import {
  Heading,
  ListItem,
  UnorderedList,
  Link,
  Text,
  Button,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerFooter,
  DrawerBody,
  Input,
  DrawerHeader,
  FormControl,
  FormLabel,
  FormHelperText,
} from "@chakra-ui/react"
import { PageTitle } from "app/components/PageTitle"
import NextLink from "next/link"
import { AddIcon } from "@chakra-ui/icons"
import createOrganisationMutation from "app/organisations/mutations/createOrganisation"
import Router from "next/router"

function LandingPage() {
  return <p>Sign in to get started.</p>
}

const Dashboard = () => {
  const createOrgModal = useDisclosure()
  const [createOrganisation] = useMutation(createOrganisationMutation)
  const [orgs] = useQuery(getOrganisations, null)

  const user = useCurrentUser()
  if (!user) {
    return null
  }

  return (
    <>
      <PageTitle title="welcome," name={user.name} suffix="!" />

      <Text>
        This is the Datapact Dashboard, your dataset knowledge tracker. To get started, enter your
        organisations workspace:
      </Text>

      <Heading size="md" pt={4} pb={2}>
        Organisations
      </Heading>
      <UnorderedList>
        {orgs.map((org) => (
          <ListItem key={org.slug}>
            <NextLink href={`/${org.slug}`}>
              <Link>{org.name}</Link>
            </NextLink>{" "}
            (owned by <b>{org.owner.name}</b>)
          </ListItem>
        ))}
      </UnorderedList>

      <Button mt={4} size="sm" leftIcon={<AddIcon />} onClick={createOrgModal.onOpen}>
        Create Organisation
      </Button>

      <Drawer isOpen={createOrgModal.isOpen} onClose={createOrgModal.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create Organisation</DrawerHeader>
          <DrawerBody>
            <form
              id="create-org"
              onSubmit={async (e) => {
                e.preventDefault()
                const form = new FormData(e.target as any)
                const org = await createOrganisation({
                  name: form.get("name") as string,
                  slug: form.get("slug") as string,
                })
                createOrgModal.onClose()
                Router.push(`/${org.slug}`)
              }}
            >
              <FormControl isInvalid={true}>
                <FormLabel>
                  Slug
                  <Input name="slug" placeholder="Type here..." required />
                </FormLabel>
                <FormHelperText>URL-Safe shorthand for your organisation.</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>
                  Name
                  <Input name="name" placeholder="Type here..." required />
                </FormLabel>
                <FormHelperText>
                  Full display name, used in the dashboard, emails etc.
                </FormHelperText>
              </FormControl>
            </form>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={createOrgModal.onClose}>
              Cancel
            </Button>
            <Button type="submit" form="create-org">
              Create
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

const Home = () => {
  const user = useCurrentUser()

  return <Shell>{user ? <Dashboard /> : <LandingPage />}</Shell>
}

export default Home
