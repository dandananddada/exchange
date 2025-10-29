
'use client';

import { useMarketData } from "@/hooks/useMarketData";
import { Text, Box, Flex, Menu, Button, Portal } from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { FaAngleDown } from "react-icons/fa6";
import { Ticker } from "./Ticker";
import ThemeSwitch from "@/components/ThemeSwitch";
import { useThemes } from "@/hooks/useTheme";
import { UnifiedMarketData } from "@/types/adapter.types";

export default function Header({
  symbol,
}: {
  symbol: string;
}) {
  const router = useRouter();
  const items = [
    { value: 'BTC-USDT', label: 'BTC/USDT' },
    { value: 'ETH-USDT', label: 'ETH/USDT' },
    { value: 'SOL-USDT', label: 'SOL/USDT' },
    { value: 'ETH-BTC', label: 'ETH/BTC' },
  ];

  const [value, setValue] = useState(symbol);
  const { data: ticker } = useMarketData(symbol);
  const { getTheme, setTheme } = useThemes();
  const { mode: theme } = getTheme();

  return (<Flex width="full" justifyContent="space-between" alignItems="center">
    <Flex alignItems="center" gap={2}>
      <Text fontSize="md" fontWeight="bold">{symbol?.replace('-', '/')}</Text>
      <Menu.Root>
        <Menu.Trigger asChild>
          <Button variant="ghost" size="xs">
            <FaAngleDown />
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="10rem">
              <Menu.RadioItemGroup
                value={value}
                onValueChange={(e: { value: string }) => {
                  setValue(e.value);
                  // 跳转到对应交易对页面（使用小写路径，页面内会自动 toUpperCase）
                  const path = `/trade-spot/${e.value.toLowerCase()}`;
                  router.push(path);
                }}
              >
                {items.map((item) => (
                  <Menu.RadioItem key={item.value} value={item.value}>
                    {item.label}
                    <Menu.ItemIndicator />
                  </Menu.RadioItem>
                ))}
              </Menu.RadioItemGroup>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <Box ml={16}>
        <Ticker ticker={ticker as UnifiedMarketData} />
      </Box>
    </Flex>
    <Box>
      <ThemeSwitch theme={theme} setTheme={(value) => {
        setTheme({ mode: value });
      }} />
    </Box>
  </Flex>);
}