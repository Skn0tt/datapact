import { useMutation, useQuery } from "@blitzjs/rpc"
import { AddIcon } from "@chakra-ui/icons"
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Link,
  ListItem,
  Stack,
  Text,
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react"
import { PageTitle } from "app/components/PageTitle"
import { Shell } from "app/layout/Shell"
import getOrganisation from "app/organisations/queries/getOrganisation"
import NextLink from "next/link"
import { useRouter } from "next/router"
import createDatasetMutation from "app/datasets/mutations/createDataset"

export default function OrganisationPage() {
  const router = useRouter()
  const {
    query: { organisation },
  } = router

  const [org] = useQuery(getOrganisation, organisation as string)

  const addDatasetModal = useDisclosure()

  const [createDataset] = useMutation(createDatasetMutation)

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
        Members
      </Heading>

      <Heading size="md" pt={4} pb={2}>
        Datasets
      </Heading>
      <UnorderedList>
        {org.datasets.map((project) => (
          <ListItem key={project.id}>
            <NextLink href={`/${organisation}/${project.slug}`}>
              <Link>{project.slug}</Link>
            </NextLink>{" "}
            (owned by <b>{project.owner.name}</b>)
          </ListItem>
        ))}
      </UnorderedList>
      <Button leftIcon={<AddIcon />} onClick={addDatasetModal.onOpen}>
        Add Dataset
      </Button>

      <Drawer isOpen={addDatasetModal.isOpen} onClose={addDatasetModal.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Create Organisation</DrawerHeader>
          <DrawerBody>
            <form
              id="create-dataset"
              onSubmit={async (e) => {
                e.preventDefault()
                const form = new FormData(e.target as any)
                const dataset = await createDataset({
                  slug: form.get("slug") as string,
                  organisation: org.slug,
                })
                addDatasetModal.onClose()
                router.push(`/${org.slug}/${dataset.slug}`)
              }}
            >
              <FormControl isInvalid={true}>
                <FormLabel>
                  Slug
                  <Input name="slug" placeholder="Type here..." required />
                </FormLabel>
                <FormHelperText>URL-Safe identifier for the dataset</FormHelperText>
              </FormControl>
            </form>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={addDatasetModal.onClose}>
              Cancel
            </Button>
            <Button type="submit" form="create-dataset">
              Create
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Shell>
  )
}
