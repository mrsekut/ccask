import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Screen } from './types.js';

type Props = {
  onNavigate: (screen: Screen) => void;
};

const menuItems = [
  { key: 'ask', label: '🤔 Ask new question', screen: 'ask' as Screen },
  { key: 'list', label: '📋 List questions', screen: 'list' as Screen },
];

export function MainMenu({ onNavigate }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : menuItems.length - 1));
    } else if (key.downArrow) {
      setSelectedIndex(prev => (prev < menuItems.length - 1 ? prev + 1 : 0));
    } else if (key.return && menuItems[selectedIndex]) {
      onNavigate(menuItems[selectedIndex].screen);
    }
  });

  return (
    <Box flexDirection="column" paddingX={2}>
      <Box marginBottom={1}>
        <Text bold>Select an action:</Text>
      </Box>

      {menuItems.map((item, index) => (
        <Box key={item.key} marginBottom={1}>
          <Text color={index === selectedIndex ? 'green' : 'white'}>
            {index === selectedIndex ? '→ ' : '  '}
            {item.label}
          </Text>
        </Box>
      ))}

      <Box marginTop={1}>
        <Text dimColor>Press Enter to select, q to quit</Text>
      </Box>
    </Box>
  );
}
