import { Heading, Text } from "@chakra-ui/react"

export function PageTitle({
  title,
  name,
  suffix,
}: {
  title: string
  name: string
  suffix?: string
}) {
  return (
    <Heading fontSize="lg" pb={4}>
      <Text fontSize="md" as="span" color="gray">
        {title}
      </Text>{" "}
      <Text as="span" fontSize="xl">
        {name}
      </Text>
      {suffix && (
        <Text fontSize="md" as="span" color="gray">
          {" "}
          {suffix}
        </Text>
      )}
    </Heading>
  )
}
