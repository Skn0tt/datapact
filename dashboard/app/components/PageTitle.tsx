import { Heading, Text } from "@chakra-ui/react"

export function PageTitle({ title, name }: { title: string; name: string }) {
  return (
    <Heading fontSize="lg" pb={4}>
      <Text fontSize="md" as="span" color="gray">
        {title}
      </Text>{" "}
      <Text as="span" fontSize="xl">
        {name}
      </Text>
    </Heading>
  )
}
