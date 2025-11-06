import { Theme } from "@/types/theme";
import { Tabs } from "@chakra-ui/react"
import { MdLightMode, MdDarkMode } from "react-icons/md"

const ThemeSwitch = ({
  theme, setTheme,
}: {
  theme: Theme['mode'];
  setTheme: (theme: Theme['mode']) => void;
}) => {
  return (
    <Tabs.Root
      size="sm"
      variant="plain"
      value={theme}
      onValueChange={(e) => {
        setTheme(e.value as Theme['mode'])
      }}
    >
      <Tabs.List bg="bg.muted" rounded="l3" p="1">
        <Tabs.Trigger value="light">
          <MdLightMode />
        </Tabs.Trigger>
        <Tabs.Trigger value="dark">
          <MdDarkMode />
        </Tabs.Trigger>
        <Tabs.Indicator rounded="l2" />
      </Tabs.List>
    </Tabs.Root>
  )
}

export default ThemeSwitch;
