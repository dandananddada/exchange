'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Input,
  Text,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContentGroup,
  TabsContent,
} from '@chakra-ui/react';
import { toaster } from "@/components/ui/toaster";

import { useMarketData } from '@/hooks/useMarketData';
import { useOrderTrade } from '@/hooks/useOrderTrade';

type OrderFormValues = {
  quantity: string;
  price: string;
};

export default function PlaceOrder({
  symbol,
}: {
  symbol: string;
}) {
  const showToast = (opts: { title: string; description?: string; status?: string }) => {
    // fallback simple logger; project may use Toaster API from Chakra variant in this repo
    toaster.create({
      type: opts.status === 'success' ? 'success' : opts.status === 'error' ? 'error' : 'info',
      title: opts.title,
      description: opts.description,
    });
  };

  // Tabs will manage active value internally; we render both panes via TabsContent

  const [buyValues, setBuyValues] = useState<OrderFormValues>({ quantity: '', price: '' });
  const [sellValues, setSellValues] = useState<OrderFormValues>({ quantity: '', price: '' });

  const [buyErrors, setBuyErrors] = useState<{ quantity?: string; price?: string }>({});
  const [sellErrors, setSellErrors] = useState<{ quantity?: string; price?: string }>({});

  const [isSubmittingSide, setIsSubmittingSide] = useState<'buy' | 'sell' | null>(null);
  const [activeSide, setActiveSide] = useState<'buy' | 'sell'>('buy');

  const { data: marketData } = useMarketData(symbol);
  const { placeOrder } = useOrderTrade();
  const { topSellPrice, topBuyPrice } = marketData || {};

  useEffect(() => {
    if (activeSide === 'buy' && topBuyPrice) {
      setBuyValues((prev) => ({ ...prev, price: String(topBuyPrice) }));
    }
    if (activeSide === 'sell' && topSellPrice) {
      setSellValues((prev) => ({ ...prev, price: String(topSellPrice) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSide]);

  const validate = (vals: OrderFormValues) => {
    const errs: { quantity?: string; price?: string } = {};
    const q = Number(vals.quantity || 0);
    const p = Number(vals.price || 0);
    if (!vals.quantity || isNaN(q) || q <= 0) errs.quantity = '数量必须大于 0';
    if (!vals.price || isNaN(p) || p <= 0) errs.price = '价格必须大于 0';
    return errs;
  };

  const onSubmit = async (side: 'buy' | 'sell') => {
    const vals = side === 'buy' ? buyValues : sellValues;
    const setErrors = side === 'buy' ? setBuyErrors : setSellErrors;

    const errs = validate(vals);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmittingSide(side);
    try {
      const payload = {
        side,
        symbol,
        amount: Number(vals.quantity),
        price: Number(vals.price),
        total: Number(vals.quantity) * Number(vals.price),
        time: new Date().toISOString(),
      };

      await placeOrder(payload);

      showToast({
        title: `${side === 'buy' ? '买入' : '卖出'} 委托已提交`,
        description: `数量: ${payload.amount}, 价格: ${payload.price}, 合计: ${payload.total}`,
        status: 'success',
      });

      if (side === 'buy') {
        setBuyValues({ quantity: '', price: vals.price });
        setBuyErrors({});
      } else {
        setSellValues({ quantity: '', price: vals.price });
        setSellErrors({});
      }
    } catch (error) {
      console.error(error);
      showToast({ title: '提交失败', description: '请稍后重试', status: 'error' });
    } finally {
      setIsSubmittingSide(null);
    }
  };

  const renderForm = (
    values: OrderFormValues,
    setValues: React.Dispatch<React.SetStateAction<OrderFormValues>>,
    errors: { quantity?: string; price?: string },
    side: 'buy' | 'sell'
  ) => {
    const watchedQuantity = Number(values.quantity || 0);
    const watchedPrice = Number(values.price || 0);
    const total = Number((watchedQuantity * watchedPrice).toFixed(8));

    return (
      <Box
        as='form'
        onSubmit={e => {
          e.preventDefault();
          onSubmit(side);
        }}
      >
        <Box mb={3}>
          <Text fontSize='sm' textAlign="left" mb={1}>
            数量
          </Text>
          <Input
            type='number'
            step='any'
            value={values.quantity}
            onChange={e => setValues(prev => ({ ...prev, quantity: e.target.value }))}
            aria-label='数量'
          />
          {errors.quantity && (
            <Text color='red.500' fontSize='sm' mt={1}>
              {errors.quantity}
            </Text>
          )}
        </Box>

        <Box mb={3}>
          <Text fontSize='sm' textAlign="left" mb={1}>
            价格
          </Text>
          <Input
            type='number'
            step='any'
            value={values.price}
            onChange={e => setValues(prev => ({ ...prev, price: e.target.value }))}
            aria-label='价格'
          />
          {errors.price && (
            <Text color='red.500' fontSize='sm' mt={1}>
              {errors.price}
            </Text>
          )}
        </Box>

        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Text>合计</Text>
          <Text fontWeight='semibold'>{isNaN(total) ? '-' : total}</Text>
        </Box>

        <Button
          colorPalette={side === 'buy' ? 'green' : 'red'}
          type='submit'
          width='full'
          mt={4}
          borderRadius='md'
          loading={isSubmittingSide === side}
          aria-label={`${side === 'buy' ? '买入' : '卖出'} 提交`}
        >
          {side === 'buy' ? '买入' : '卖出'}
        </Button>
      </Box>
    );
  };

  return (
    <Box w='100%' p={2} pt={0}>
      <TabsRoot
        size='sm'
        value={activeSide}
        onValueChange={(next: unknown) => {
          let v: unknown = next;
          if (typeof next !== 'string' && typeof next === 'object' && next !== null && 'value' in (next as Record<string, unknown>)) {
            v = (next as { value: unknown }).value;
          }
          if (v === 'buy' || v === 'sell') setActiveSide(v);
        }}
      >
        <TabsList>
          <TabsTrigger value='buy'>买入</TabsTrigger>
          <TabsTrigger value='sell'>卖出</TabsTrigger>
        </TabsList>

        <TabsContentGroup>
          <TabsContent value='buy'>
            {renderForm(buyValues, setBuyValues, buyErrors, 'buy')}
          </TabsContent>
          <TabsContent value='sell'>
            {renderForm(sellValues, setSellValues, sellErrors, 'sell')}
          </TabsContent>
        </TabsContentGroup>
      </TabsRoot>
    </Box>
  );
}
