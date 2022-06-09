import { useMutation, useQuery, invoke } from "@blitzjs/rpc"
import { AddIcon, CheckCircleIcon, WarningIcon } from "@chakra-ui/icons"
import {
  Avatar,
  AvatarGroup,
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
  IconButton,
  Input,
  LinkBox,
  LinkOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger as _PopoverTrigger,
  SimpleGrid,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { PageTitle } from "app/components/PageTitle"
import { Shell } from "app/layout/Shell"
import getOrganisation from "app/organisations/queries/getOrganisation"
import NextLink from "next/link"
import { useRouter } from "next/router"
import createDatasetMutation from "app/datasets/mutations/createDataset"
import addMemberMutation from "app/organisations/mutations/addMember"
import { AsyncSelect } from "chakra-react-select"
import searchUsers from "app/users/queries/searchUsers"
import { useState } from "react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { isFailure } from "app/testruns"

const PopoverTrigger = _PopoverTrigger as any

export default function OrganisationPage() {
  const router = useRouter()
  const {
    query: { organisation },
  } = router

  const [org, orgMeta] = useQuery(getOrganisation, organisation as string)

  const addDatasetModal = useDisclosure()

  const addMemberModal = useDisclosure()

  const [createDataset] = useMutation(createDatasetMutation)
  const [addMember, addMemberMeta] = useMutation(addMemberMutation)

  const [userToAdd, setUserToAdd] = useState<{ name: string; id: number }>()

  const currentUser = useCurrentUser()

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
      <AvatarGroup>
        {org.members.map((member) => (
          <Avatar
            key={member.name}
            name={member.name}
            src={member.profilePictureUrl ?? undefined}
          />
        ))}

        {org.ownerId === currentUser?.id && (
          <Popover
            placement="right"
            isOpen={addMemberModal.isOpen}
            onClose={addMemberModal.onClose}
          >
            <PopoverTrigger>
              <IconButton
                variant="outline"
                isRound
                aria-label="Add Member"
                icon={<AddIcon />}
                onClick={addMemberModal.onOpen}
              />
            </PopoverTrigger>

            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody>
                <AsyncSelect
                  placeholder="Search by name or email"
                  onChange={({ value }) => setUserToAdd(value as any)}
                  loadOptions={async (inputValue) => {
                    const users = await invoke(searchUsers, {
                      term: inputValue,
                      exclude: org.members.map((member) => member.id),
                    })
                    return users.map((user) => ({
                      label: user.name,
                      value: user,
                    }))
                  }}
                />

                {userToAdd && (
                  <Button
                    onClick={async () => {
                      await addMember({
                        organisation: org.slug,
                        userId: userToAdd.id,
                      })
                      addMemberModal.onClose()
                      await orgMeta.refetch()
                    }}
                    loadingText="Adding..."
                    isLoading={addMemberMeta.isLoading}
                  >
                    Add {userToAdd.name}
                  </Button>
                )}
              </PopoverBody>
            </PopoverContent>
          </Popover>
        )}
      </AvatarGroup>

      <Heading size="md" pt={4} pb={2}>
        Datasets
      </Heading>

      <SimpleGrid spacing={8} minChildWidth="150px">
        {org.datasets.map((dataset) => (
          <LinkBox
            key={dataset.id}
            rounded="sm"
            bg="gray.100"
            p={4}
            cursor="pointer"
            maxWidth="300px"
            _hover={{
              bg: "gray.200",
            }}
          >
            <Heading size="md" mb={2}>
              <NextLink key={dataset.id} href={`/${organisation}/${dataset.slug}`}>
                <LinkOverlay>{dataset.slug}</LinkOverlay>
              </NextLink>
              {dataset.testRuns[0] && isFailure(dataset.testRuns[0]?.payload as any) ? (
                <WarningIcon color="red" boxSize={6} float="right" />
              ) : (
                <CheckCircleIcon color="green" boxSize={6} float="right" />
              )}
            </Heading>

            <Text>Number of runs: {dataset._count.testRuns}</Text>

            {dataset.testRuns[0] && (
              <Text>
                Last run:{" "}
                <time dateTime={dataset.testRuns[0].date.toISOString()}>
                  {dataset.testRuns[0].date.toLocaleDateString()}
                </time>
              </Text>
            )}
          </LinkBox>
        ))}
      </SimpleGrid>
      <Button mt={4} size="sm" leftIcon={<AddIcon />} onClick={addDatasetModal.onOpen}>
        Add Dataset
      </Button>

      <Drawer isOpen={addDatasetModal.isOpen} onClose={addDatasetModal.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Add Dataset</DrawerHeader>
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
                await router.push(`/${org.slug}/${dataset.slug}`)
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
