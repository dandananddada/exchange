
import { UIProvider } from '@/providers/ChakraProvider';
import RequestProvider from "@/providers/RequestProvider";

export default function Provider({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <RequestProvider>
      <UIProvider>
        {children}
      </UIProvider>
    </RequestProvider>
  );
}