'use client';

import { Box, Grid, HStack, Theme, useBreakpointValue } from '@chakra-ui/react';
import { Toaster } from '@/components/ui/toaster';
import { useThemes } from '@/hooks/useTheme';

export default function ResponsiveTradingLayout({
  header,
  klineChart,
  orderBook,
  placeOrder,
  transcation,
}: {
  header?: React.ReactNode;
  klineChart: React.ReactNode;
  orderBook: React.ReactNode;
  placeOrder: React.ReactNode;
  transcation?: React.ReactNode;
}) {

  const gridColumns = useBreakpointValue({
    base: '1fr', // 手机：单列
    md: '1fr', // 平板：两列
    lg: '2fr 1fr', // 桌面：主内容 2/3，侧边栏 1/3
    xl: '5fr 2fr 2fr', // 大桌面：主内容 3/4，侧边栏 1/4
  });

  const { getTheme } = useThemes();
  const { mode: theme } = getTheme();

  return (
    <Theme p={4} appearance={theme} height="100vh" overflow="auto">
      <Toaster />
      <HStack mb={4} justify={'space-between'}>
       {header} 
      </HStack>
      <Grid templateColumns={gridColumns} gap={1}>
        <Box bg='bg.primary' borderRadius='lg' width='100%' p={4}>
          {klineChart}
        </Box>
        <Box bg='bg.primary' borderRadius='lg' p={4} minHeight='200px'>
          {orderBook}
        </Box>

        <Box
          bg='bg.primary'
          borderRadius='lg'
          p={4}
          minHeight='200px'
          display={{
            base: 'none', // 手机隐藏
            lg: 'block', // 桌面显示
          }}
        >
          {placeOrder}
        </Box>
      </Grid>

      <Box width="full" bg="bg.primary" borderRadius="md" p={4} mt="1" height="fit">
        {transcation}
      </Box>

      {/* 移动端底部交易栏 */}
      <Box
        display={{
          base: 'block', // 手机显示
          lg: 'none', // 桌面隐藏
        }}
        position='fixed'
        zIndex={50}
        bottom={0}
        left={0}
        right={0}
        bg='bg.primary'
        p={3}
        textAlign='center'
      >
        {placeOrder}
      </Box>
    </Theme>
  );
}
