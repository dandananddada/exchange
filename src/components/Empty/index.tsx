import { EmptyState, HStack, VStack } from "@chakra-ui/react";
import { HiColorSwatch } from "react-icons/hi";

const Empty = () => {
  return (
    <HStack align="center">
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <HiColorSwatch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title fontSize="sm">暂无数据</EmptyState.Title>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    </HStack>
  )
}

export default Empty;